import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { clearTestDb, setupTestDb, teardownTestDb } from '../setup/testDb';
import { movieFixture, reelProgressFixture, userFixture } from '../setup/fixtures';
import { app } from '../../server';
import User from '../../models/User';
import { adminRequest, authenticatedRequest } from '../setup/authHelper';
import Movie from '../../models/Movie';

describe('ReelProgress Routes', () => {
  // set up the empty authHeader variable
  let authHeader;
  let adminHeader;

  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  // before each request, set the authHeader variable using the authenticatedRequest helper function
  // Check the authHelper file for full functionality and usage details
  beforeEach(async () => {
    await clearTestDb();
    authHeader = await authenticatedRequest();
    adminHeader = await adminRequest();
  });

  describe('GET /reel-progress', () => {
    it('should return user reelProgress when authenticated', async () => {
      // Find user from authenticatedRequest
      const user = await User.findOne({});
      // add reelProgress records using fixture
      user.reelProgress = reelProgressFixture(2);
      await user.save();

      const response = await request(app).get('/reel-progress').set(authHeader).expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Reel Progress records found',
      });
      expect(response.body.reelProgress).toHaveLength(2);
      response.body.reelProgress.forEach((record) => {
        expect(record).toHaveProperty('movie');
        expect(record).toHaveProperty('rating');
        expect(record).toHaveProperty('isWatched');
        expect(Object.keys(record)).toEqual(['movie', 'rating', 'isWatched']);
      });
    });

    it('should return 404 message when user has no reelProgress', async () => {
      // Find user from authenticatedRequest
      await User.findOne({});

      const response = await request(app).get('/reel-progress').set(authHeader).expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'No Reel Progress records found',
      });
    });
  });

  describe('POST /reel-progress', () => {
    it('should create new reelProgress record when valid data', async () => {
      // Create a movie with a valid ID
      const movie = await Movie.create(movieFixture());

      // create new reelProgress from fixture with valid movie ID
      const newReelProgress = await reelProgressFixture(1, { movie: movie.id })[0]; // Always creates an array, so just get the first one

      const response = await request(app)
        .post('/reel-progress')
        .set(authHeader)
        .send(newReelProgress)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('added to your Reel Progress'),
        addedMovieId: newReelProgress.movie.toString(),
      });
    });
    it('should return 409 when movie already in reelProgress', async () => {
      // Create movie with valid ID
      const movie = await Movie.create(movieFixture());
      // Find the user we want to have a record
      const user = await User.findOne({});

      // Create new reelProgress with valid movieId
      const newReelProgress = await reelProgressFixture(1, { movie: movie.id })[0];

      // Update user's reelProgress
      user.reelProgress = newReelProgress;
      await user.save();

      // attempt to send again
      const response = await request(app)
        .post('/reel-progress')
        .set(authHeader)
        .send(newReelProgress)
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Movie already in your reel',
      });
    });

    it('should return 404 when movie not found', async () => {
      // create reel progress with fixture (invalid random id)
      const newReelProgress = reelProgressFixture()[0];

      const response = await request(app)
        .post('/reel-progress')
        .set(authHeader)
        .send(newReelProgress)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Movie not found',
      });
    });

    it('should return 400 when invalid fields provided', async () => {
      // Create movie with valid id
      const movie = await Movie.create(movieFixture());
      const badFields = {
        movie: movie.id,
        rating: 4,
        thisFieldIsJunk: 'should fail',
        anotherJunkField: 'should also fail',
      };

      const response = await request(app)
        .post('/reel-progress')
        .set(authHeader)
        .send(badFields)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Unexpected field(s) in reelProgress: thisFieldIsJunk, anotherJunkField',
        expectedFields: ['movie', 'rating', 'isWatched'],
      });
    });
  });

  describe('PATCH /reel-progress/:movieId', () => {
    it('should update rating for existing movie', async () => {
      // setup user with existing record
      const user = await User.findOne({});
      user.reelProgress = reelProgressFixture();
      await user.save();

      const movieId = user.reelProgress[0].movie; // Get the actual movie ID
      const newRating = { rating: 3 };

      const response = await request(app)
        .patch(`/reel-progress/${movieId}`)
        .set(authHeader)
        .send(newRating)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Rating updated',
      });
    });

    it('should return 404 when movie not in user reelProgress', async () => {
      // correct rating
      const rating = { rating: 4 };
      // create fake id
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .patch(`/reel-progress/${fakeId}`)
        .set(authHeader)
        .send(rating)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Movie not found in your Reel Progress',
      });
    });

    it('should return 400 when no rating provided', async () => {
      // create user with existing record
      const user = await User.findOne({});
      user.reelProgress = reelProgressFixture();
      await user.save();

      const movieId = user.reelProgress[0].movie; // Get the actual movie ID
      // Send rating outside of check constraint
      const missingRating = {};

      const response = await request(app)
        .patch(`/reel-progress/${movieId}`)
        .set(authHeader)
        .send(missingRating)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Rating is required',
      });
    });

    it('should return 400 when invalid rating provided', async () => {
      // create user with existing record
      const user = await User.findOne({});
      user.reelProgress = reelProgressFixture();
      await user.save();

      const movieId = user.reelProgress[0].movie; // Get the actual movie ID
      // Send rating outside of check constraint
      const invalidRating = { rating: 10 };

      const response = await request(app)
        .patch(`/reel-progress/${movieId}`)
        .set(authHeader)
        .send(invalidRating)
        .expect(400);

      // expect schema validation to trigger error handler:
      expect(response.body).toMatchObject({
        success: false,
        message: 'Schema validation failed',
        errors: expect.arrayContaining([expect.stringMatching(/rating|min|max/)]), // Should mention rating constraints
      });
    });

    it('should return 400 when invalid fields provided', async () => {
      // Create movie with valid id
      const movie = await Movie.create(movieFixture());

      const badFields = {
        rating: 4,
        thisFieldIsJunk: 'should fail',
        anotherJunkField: 'should also fail',
      };

      const response = await request(app)
        .patch(`/reel-progress/${movie.id}`)
        .set(authHeader)
        .send(badFields)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Unexpected field(s) in reelProgress: thisFieldIsJunk, anotherJunkField',
        expectedFields: ['movie', 'rating', 'isWatched'],
      });
    });
  });

  describe('DELETE /reel-progress/:movieId', () => {
    it('should remove movie from user reelProgress', async () => {
      // create user with existing record
      const user = await User.findOne({});
      user.reelProgress = reelProgressFixture();
      await user.save();

      const movieId = user.reelProgress[0].movie; // Get the actual movie ID

      const response = await request(app)
        .delete(`/reel-progress/${movieId}`)
        .set(authHeader)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Reel Progress record deleted successfully',
      });
    });

    it('should return 404 when movie not in user reelProgress', async () => {
      // create fake id
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/reel-progress/${fakeId}`)
        .set(authHeader)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Movie not found in your Reel Progress',
      });
    });
  });

  describe('Admin ReelProgress Controller', () => {
    describe('GET /reel-progress/admin', () => {
      // This test is quite database intensive, database actions are not always performed sequentially
      // therefore I have made some custom data fields to ensure users records are displayed
      // and nested in the correct userid

      it('should return only users with reelProgress records when admin', async () => {
        // Create 3 movies (force sequential to avoid parallel processing timeouts)
        const movie1 = await Movie.create(movieFixture());
        const movie2 = await Movie.create(movieFixture());
        const movie3 = await Movie.create(movieFixture());

        // create user with multiple valid records
        const user1 = await User.create({
          ...userFixture(),
          reelProgress: [
            { ...reelProgressFixture()[0], movie: movie1.id },
            { ...reelProgressFixture()[0], movie: movie2.id },
          ],
        });

        // create user with one record
        const user2 = await User.create({
          ...userFixture(),
          reelProgress: reelProgressFixture(1, { movie: movie3.id }),
        });

        // create user with no records
        await User.create(userFixture());

        const response = await request(app)
          .get('/reel-progress/admin')
          .set(adminHeader)
          .expect(200);

        // Create a data group grouped by the userId
        const user1Data = response.body.reelProgressData.find(
          (user) => user._id.toString() === user1._id.toString(), // eslint-disable-line no-underscore-dangle
        );

        // Create another data group grouped by userId
        const user2Data = response.body.reelProgressData.find(
          (user) => user._id.toString() === user2._id.toString(), // eslint-disable-line no-underscore-dangle
        );

        // Check data groups lengths are expected
        expect(user1Data.reelProgress).toHaveLength(2);
        expect(user2Data.reelProgress).toHaveLength(1);

        // Data is flattened on response, can't check for exact object and stay dry, check length of objects instead
        expect(response.body.success).toBe(true);
        expect(response.body.reelProgressData).toHaveLength(2); // Should only see users with reelProgress records
      });

      it('should return 403 when non-admin user', async () => {
        // The simplest test ever
        const response = await request(app).get('/reel-progress/admin').set(authHeader).expect(403);

        expect(response.body).toMatchObject({
          success: false,
          message: 'Admin access required',
        });
      });
    });

    describe('DELETE /reel-progress/admin/queries', () => {
      it('should delete any user reelProgress record when admin', async () => {
        // Create a valid movie
        const movie = await Movie.create(movieFixture());

        // Create a user with valid reelProgress
        const user = await User.create({
          ...userFixture(),
          reelProgress: reelProgressFixture(1, { movie: movie.id }),
        });

        // Admin deletes it
        const response = await request(app)
          .delete(`/reel-progress/admin/queries?userId=${user.id}&movieId=${movie.id}`)
          .set(adminHeader)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          message: 'User Reel Progress record deleted successfully',
        });

        // Verify it's actually gone
        const updatedUser = await User.findById(user.id);
        expect(updatedUser.reelProgress).toHaveLength(0);
      });

      it('should return 400 when userId query param is missing', async () => {
        // Create a valid movie
        const movie = await Movie.create(movieFixture());

        // Create a user with valid reelProgress
        await User.create({
          ...userFixture(),
          reelProgress: reelProgressFixture(1, { movie: movie.id }),
        });

        // Admin deletes it
        const response = await request(app)
          .delete(`/reel-progress/admin/queries?movieId=${movie.id}`)
          .set(adminHeader)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          message: 'Both userId and movieId query parameters required',
        });
      });

      it('should return 400 when movieId query param is missing', async () => {
        // Create a valid movie
        const movie = await Movie.create(movieFixture());

        // Create a user with valid reelProgress
        const user = await User.create({
          ...userFixture(),
          reelProgress: reelProgressFixture(1, { movie: movie.id }),
        });

        // Admin deletes it
        const response = await request(app)
          .delete(`/reel-progress/admin/queries?userId=${user.id}`)
          .set(adminHeader)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          message: 'Both userId and movieId query parameters required',
        });
      });

      it('should return 404 when user not found', async () => {
        // Create a valid movie
        const movie = await Movie.create(movieFixture());

        // create fake userId
        const fakeUserId = new mongoose.Types.ObjectId();

        // Admin attempts to delete random users movie
        const response = await request(app)
          .delete(`/reel-progress/admin/queries?userId=${fakeUserId}&movieId=${movie.id}`)
          .set(adminHeader)
          .expect(404);

        expect(response.body).toMatchObject({
          success: false,
          message: `User not found with id: ${fakeUserId}`,
        });
      });

      it('should return 404 when movie not in user reelProgress', async () => {
        // Create a user with NO reelProgress
        const user = await User.create(userFixture());

        // create fake movieId
        const fakeMovieId = new mongoose.Types.ObjectId();

        // Admin attempts to delete movie not in user's reelProgress
        const response = await request(app)
          .delete(`/reel-progress/admin/queries?userId=${user.id}&movieId=${fakeMovieId}`)
          .set(adminHeader)
          .expect(404);

        expect(response.body).toMatchObject({
          success: false,
          message: `User has no Reel Progress record for movie with id: ${fakeMovieId}`,
        });
      });
      it('should return 403 when non-admin user', async () => {
        // Create a valid movie
        const movie = await Movie.create(movieFixture());

        // Create a user with valid reelProgress
        const user = await User.create({
          ...userFixture(),
          reelProgress: reelProgressFixture(1, { movie: movie.id }),
        });

        // Set to non admin user
        const response = await request(app)
          .delete(`/reel-progress/admin/queries?userId=${user.id}&movieId=${movie.id}`)
          .set(authHeader)
          .expect(403);

        expect(response.body).toMatchObject({
          success: false,
          message: 'Admin access required',
        });
      });
    });
  });
});
