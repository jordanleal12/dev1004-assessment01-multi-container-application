import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { clearTestDb, setupTestDb, teardownTestDb } from '../setup/testDb';
import { movieFixture } from '../setup/fixtures';
import { app } from '../../server';
import Movie from '../../models/Movie';
import { adminRequest, authenticatedRequest } from '../setup/authHelper';
import User from '../../models/User';

// set up empty variables to be assigned in beforeAll hooks
let authHeader;
let adminHeader;

beforeAll(async () => {
  await setupTestDb(); // Set up in memory MongoDB database and console spies
});

// before each request, set the authHeader variable using the authenticatedRequest helper function
// Check the authHelper file for full functionality and usage details
beforeEach(async () => {
  await clearTestDb();
  authHeader = await authenticatedRequest();
  adminHeader = await adminRequest();
});

afterAll(async () => {
  await teardownTestDb(); // Teardown in memory MongoDB database and restore console spies
});

describe('GET /movies/reel-canon', () => {
  it('should get all movies which are in the Reel Canon', async () => {
    await Movie.create(Array.from({ length: 5 }, () => movieFixture()));
    await Movie.create(movieFixture({ isReelCanon: false }));

    const response = await request(app).get('/movies/reel-canon');

    expect(response.status).toBe(200);
    expect(response.body.movies.length).toBe(5);
    response.body.movies.forEach((movie) => {
      expect(movie).toHaveProperty('title');
      expect(movie).toHaveProperty('year');
      expect(movie).toHaveProperty('director');
      expect(movie).toHaveProperty('imdbId');
      expect(movie.isReelCanon).toBe(true);
    });
  });
});

describe('GET /movies/search?query', () => {
  it('should return a single movie matching the search query if title is unique', async () => {
    const movie = await Movie.create(movieFixture());

    const response = await request(app)
      .get(`/movies/search?title=${movie.title}`)
      .set(authHeader) // This is where the authHelper functions are implemented
      .expect(200);

    expect(response.body.movies[0].title).toBe(movie.title);
  });

  it('should return an array of movies if title is not unique', async () => {
    const movie = await Movie.create(movieFixture({ title: 'sametitle' }));
    await Movie.create(movieFixture({ title: 'sametitle' }));

    const response = await request(app)
      .get(`/movies/search?title=${movie.title}`)
      .set(authHeader)
      .expect(200);

    expect(response.body.movies.length).toBe(2);
    expect(response.body.movies[0].title).toStrictEqual(response.body.movies[1].title);
  });

  it('should fail if the user is not logged in', async () => {
    const movie = await Movie.create(movieFixture());

    const response = await request(app).get(`/movies/search?title=${movie.title}`).expect(401);

    expect(response.body.message).toBe('Access denied. No token provided.');
  });

  it('should return empty array if the movie does not exist', async () => {
    await Movie.create(movieFixture());

    const response = await request(app).get('/movies/search?title=wrongtitle').set(authHeader);
    expect(response.body.movies).toEqual([]);
  });

  it('should fail if the query is not title', async () => {
    const movie = await Movie.create(movieFixture());

    const response = await request(app)
      .get(`/movies/search?someotherquery=${movie.title}`)
      .set(authHeader)
      .expect(400);

    expect(response.body.message).toBe('Title search parameter required');
  });
});

describe('POST /movies/', () => {
  it('should create a new movie when authenticated', async () => {
    const movieData = movieFixture();

    const response = await request(app)
      .post('/movies/')
      .set(authHeader)
      .send(movieData)
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      message: 'Movie created successfully',
      movie: {
        title: movieData.title,
        imdbId: movieData.imdbId,
      },
    });
  });

  it('should add a createdBy field with current user', async () => {
    const user = await User.findOne({});
    const movieData = movieFixture({ createdBy: user.id });

    const response = await request(app)
      .post('/movies/')
      .set(authHeader)
      .send(movieData)
      .expect(201);

    // Check that the response includes createdBy
    expect(response.body.movie.createdBy).toBe(user.id);
  });

  it('should always create movie with isReelCanon false', async () => {
    const movieData = movieFixture({ isReelCanon: true }); // Try to set as Reel Canon

    const response = await request(app)
      .post('/movies/')
      .set(authHeader)
      .send(movieData)
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      message: 'Movie created successfully',
      movie: {
        title: movieData.title,
        imdbId: movieData.imdbId,
        isReelCanon: false, // Should be forced to false
      },
    });
  });

  it('should fail to create movie when not authenticated', async () => {
    const movieData = movieFixture();

    const response = await request(app).post('/movies/').send(movieData).expect(401);

    expect(response.body).toMatchObject({
      message: 'Access denied. No token provided.',
    });
  });

  it('should fail to create movie with duplicate imdbId', async () => {
    const existingMovie = await Movie.create(movieFixture());
    const duplicateMovieData = movieFixture({ imdbId: existingMovie.imdbId });

    const response = await request(app)
      .post('/movies/')
      .set(authHeader)
      .send(duplicateMovieData)
      .expect(409);

    expect(response.body).toMatchObject({
      success: false,
    });
  });
});

describe('PATCH /movies/:imdbId', () => {
  it('should update a movie poster when admin', async () => {
    const movie = await Movie.create(movieFixture());
    const newPoster = 'https://example.com/new-poster.jpg';

    const response = await request(app)
      .patch(`/movies/${movie.imdbId}`)
      .set(adminHeader)
      .send({ poster: newPoster })
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      message: 'Movie poster updated successfully',
      movie: {
        poster: newPoster,
      },
    });
  });

  it('should fail to update poster with invalid URL', async () => {
    const movie = await Movie.create(movieFixture());

    const response = await request(app)
      .patch(`/movies/${movie.imdbId}`)
      .set(adminHeader)
      .send({ poster: 'notvalidurl-.com' })
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      message: 'Invalid URL format for poster',
    });
  });

  it('should fail to update a nonexistent movie', async () => {
    const response = await request(app)
      .patch(`/movies/tt00000000`)
      .set(adminHeader)
      .send({ poster: 'https://example.com/poster.jpg' })
      .expect(404);

    expect(response.body).toMatchObject({
      success: false,
      message: 'Movie not found',
    });
  });
});
describe('DELETE /movies/:imdbId', () => {
  it('should delete a users own movie when not Reel Canon', async () => {
    const user = await User.findOne({});

    const movie = await Movie.create(movieFixture({ createdBy: user.id, isReelCanon: false }));

    const response = await request(app)
      .delete(`/movies/${movie.imdbId}`)
      .set(authHeader)
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      message: 'Movie deleted successfully',
    });

    // Verify movie is actually deleted:
    const deletedMovie = await Movie.findOne({ imdbId: movie.imdbId });
    expect(deletedMovie).toBeNull();
  });

  it('should fail to delete Reel Canon movie', async () => {
    const movie = await Movie.create(movieFixture());

    const response = await request(app)
      .delete(`/movies/${movie.imdbId}`)
      .set(authHeader)
      .expect(403);

    expect(response.body).toMatchObject({
      success: false,
      message: 'Reel Canon movies cannot be deleted',
    });

    // Verify movie still exists
    const existingMovie = await Movie.findOne({ imdbId: movie.imdbId });
    expect(existingMovie).not.toBeNull();
  });

  it('should fail to delete non-existent movie', async () => {
    const response = await request(app).delete('/movies/tt9999999').set(authHeader).expect(404);

    expect(response.body).toMatchObject({
      success: false,
      message: 'Movie not found',
    });
  });
});
