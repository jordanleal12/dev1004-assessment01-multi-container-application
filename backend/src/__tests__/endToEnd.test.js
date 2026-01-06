// End to end testing for current defined endpoints
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../server';
import { setupTestDb, clearTestDb, teardownTestDb } from './setup/testDb';
import User from '../models/User';
import Movie from '../models/Movie';
import Friendship from '../models/Friendship';
import { userFixture, movieFixture, reelProgressFixture, getAuthToken } from './setup/fixtures';

// Global user variables to be assigned and/or used in tests
let userData = userFixture();
let user;
let userToken;
const adminUserData = userFixture({ isAdmin: true });
let adminUser;
let adminToken;
let otherUserData;
let otherUser;
let otherUserToken;
let user1;
let user2;

// Global movie variables to be assigned and/or used in tests
let reelCanon;

beforeAll(async () => {
  await setupTestDb(); // Set up in memory MongoDB database and console spies
  reelCanon = await Movie.create(Array.from({ length: 10 }, () => movieFixture()));
});

afterAll(async () => {
  await clearTestDb(); // Clear database after all tests
  await teardownTestDb(); // Teardown in memory MongoDB database and restore console spies
});

// ------------------------------------------------------------------------------------------------
// Tests for creating a new non-admin user and accessing user routes
//-------------------------------------------------------------------------------------------------
describe('Creating a new non-admin user and accessing user routes', () => {
  // Create array of invalid data objects to test creating user with invalid data
  const badData = [
    { username: 'a' }, // Too short
    { email: 'notanemail' }, // Invalid email format
    { shortPassword: '123' }, // Too short
    { password: 'ONLYUPPERCASE1!' }, // No lowercase letters
    { password: 'onlylowercase1!' }, // No uppercase letters
    { password: 'NoNumbers!' }, // No numbers
    { password: 'NoSpecialChar1' }, // No special characters
  ];
  // For each invalid data object attempt to register user and expect 400 response
  it.each([badData])('should reject invalid registration data: %o', async (invalidData) => {
    const badUserData = userFixture(invalidData);
    const res = await request(app).post('/auth/register').send(badUserData);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('errors');
  });
  // Test valid user registration and update global user variables for use in other tests
  it('should register a new user', async () => {
    // userData = userFixture(); // Assign user data to global variable
    const res = await request(app).post('/auth/register').send(userData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      message: 'User registration complete',
      token: expect.any(String),
      user: {
        id: expect.any(String),
        username: userData.username,
        email: userData.email,
      },
    });
    // Verify user is in database
    user = await User.findById(res.body.user.id);
    expect(user).not.toBeNull();
    expect(user.email).toBe(userData.email);
    // Assign token for use in later tests
    userToken = { Authorization: `Bearer ${res.body.token}` };
  });
  // Test accessing a login required route after registration
  it('should allow access to users profile after registration', async () => {
    const res = await request(app).get('/users/my-profile').set(userToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        isAdmin: false,
      },
    });
  });
  // Test logging out the user (doesn't appear to do anything right now)
  it('should log out the user', async () => {
    const res = await request(app).post('/auth/logout').set(userToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Log out successful',
    });
  });

  // Test user can access get all users route
  it('should allow user to get all users', async () => {
    const res = await request(app).get('/users').set(userToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      users: expect.any(Array),
    });
    expect(res.body.users.length).toBe(1); // Only one user (self) in database at this point
  });

  // Test user can update their profile
  it('should allow user to update their profile', async () => {
    const updatedData = {
      username: 'updatedusername',
      email: 'updatedemail@example.com',
    };
    const res = await request(app).put('/users/my-profile').set(userToken).send(updatedData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      user: {
        username: updatedData.username,
        email: updatedData.email,
      },
    });
    // Verify changes in database
    const updatedUser = await User.findById(user.id);
    expect(updatedUser.username).toBe(updatedData.username);
    expect(updatedUser.email).toBe(updatedData.email);
    userData = { ...userData, ...updatedData }; // Update global userData for later tests
  });

  // Test user can update their password
  it('should allow user to update their password', async () => {
    const newPassword = 'NewPassword1!';
    const res = await request(app)
      .put('/users/my-profile/update-password')
      .set(userToken)
      .send({ currentPassword: userData.password, newPassword });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Password updated successfully',
    });
    // Verify user can login with new password
    const loginRes = await request(app).post('/auth/login').send({
      email: userData.email,
      password: newPassword,
    });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    // Update global userData with new password for later tests
    userData.password = newPassword;
  });

  // Test user cannot access admin protected routes
  it('should prevent non-admin user from accessing admin routes', async () => {
    // Check 'get user by ID' route
    let res = await request(app).get(`/users/${user.id}`).set(userToken);
    expect(res.statusCode).toBe(403);
    // Check 'update user by ID' route
    const username = 'ImAHacker';
    res = await request(app).put(`/users/${user.id}`).set(userToken).send({ username });
    expect(res.statusCode).toBe(403);
    // Check 'delete user by ID' route
    res = await request(app).delete(`/users/${user.id}`).set(userToken);
    expect(res.statusCode).toBe(403);
  });
});

// ------------------------------------------------------------------------------------------------
// Tests for user using friendships endpoints
//-------------------------------------------------------------------------------------------------
describe('Accessing friendship endpoints as a non-admin user', () => {
  // Create another user and their token for testing
  beforeAll(async () => {
    otherUserData = userFixture();
    otherUser = await User.create(otherUserData);
    otherUserToken = { Authorization: `Bearer ${await getAuthToken(app, otherUserData)}` };
    [user1, user2] = [user.id, otherUser.id].sort();
  });

  // Test sending a friend request
  it('should allow user to send a friend request', async () => {
    const res = await request(app).post(`/friendships/${otherUser.id}`).set(userToken);
    // Check successful response and returned friendship document contains correct user ids
    expect(res.statusCode).toBe(201);
    expect(res.body.friendship.user1 === user1 && res.body.friendship.user2 === user2).toBe(true);
    // Check friendship document is in database, with correct requesterUserId and friendRequestAccepted false
    const friendshipInDb = await Friendship.findOne({ user1, user2 });
    expect(friendshipInDb).not.toBeNull();
    expect(friendshipInDb.requesterUserId.toString()).toBe(user.id);
    expect(friendshipInDb.friendRequestAccepted).toBe(false);
  });

  // Test accepting a friend request
  it('should allow user to accept a friend request', async () => {
    const res = await request(app).put(`/friendships/my-friends/${user.id}`).set(otherUserToken);
    // Check successful response and updated friendship document has friendRequestAccepted true
    expect(res.statusCode).toBe(200);
    expect(res.body.updatedFriendship.friendRequestAccepted === true).toBe(true);
    // Check friendship document in database has friendRequestAccepted true
    const updatedFriendshipInDb = await Friendship.findOne({ user1, user2 });
    expect(updatedFriendshipInDb.friendRequestAccepted).toBe(true);
  });

  // Test that user cannot access admin only get user friendships route
  it('should prevent non-admin user from accessing get all friendships route', async () => {
    const res = await request(app).get(`/friendships/`).set(userToken);
    expect(res.statusCode).toBe(403);
  });

  // Test that user cannot access admin only update friendship route
  it('should prevent non-admin user from accessing admin only update friendship route', async () => {
    const res = await request(app)
      .put(`/friendships/`)
      .set(userToken)
      .send({ recipientUserId: otherUser.id, requesterUserId: user.id });
    expect(res.statusCode).toBe(403);
  });

  // Test user can't access admin only remove friendship route
  it('should prevent non-admin user from accessing admin only remove friendship route', async () => {
    const res = await request(app)
      .delete(`/friendships/`)
      .set(userToken)
      .send({ recipientUserId: otherUser.id, requesterUserId: user.id });
    expect(res.statusCode).toBe(403);
  });

  // Test that user can delete a friendship associated with their user id
  it('should allow user to delete a friendship for themselves', async () => {
    const res = await request(app).delete(`/friendships/my-friends/${otherUser.id}`).set(userToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Friendship document deleted successfully',
      deletedFriendship: expect.any(Object),
    });
    // Verify friendship document is removed from database
    const deletedFriendship = await Friendship.findOne({ user1, user2 });
    expect(deletedFriendship).toBeNull();
  });
});

// ------------------------------------------------------------------------------------------------
// Tests for user using movies endpoints
//-------------------------------------------------------------------------------------------------
describe('Accessing movie endpoints as a non-admin user', () => {
  it('should allow user to get list of movies', async () => {
    const res = await request(app).get('/movies/reel-canon').set(userToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      movies: expect.any(Array),
    });
    expect(res.body.movies.length).toBe(10); // reelCanon movies created in beforeAll
  });

  // Search for a movie by title
  it('should allow user to search for a movie by title', async () => {
    const movie = reelCanon[0];
    const res = await request(app)
      .get(`/movies/search?title=${encodeURIComponent(movie.title)}`)
      .set(userToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: `Found 1 movie with title "${movie.title}"`,
      movies: expect.arrayContaining([expect.objectContaining({ title: movie.title })]),
    });
  });

  // Search for a movie by ImdbId
  it('should allow user to get a movie by imdbId', async () => {
    const movie = reelCanon[1];
    const res = await request(app).get(`/movies/${movie.imdbId}`).set(userToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Movie found',
      movie: expect.objectContaining({ imdbId: movie.imdbId }),
    });
  });

  // Check that user can't access admin only movie routes
  it('should prevent non-admin user from accessing admin only movie routes', async () => {
    // Test update movie route
    let res = await request(app)
      .patch(`/movies/${reelCanon[0].imdbId}`)
      .set(userToken)
      .send({ poster: 'http://newposter.url/poster.jpg' });
    expect(res.statusCode).toBe(403);
    // Test delete movie route
    res = await request(app).delete(`/movies/${reelCanon[0].imdbId}`).set(userToken);
    expect(res.statusCode).toBe(403);
  });

  // Test user can create and delete a non-reel-canon movie
  it('should allow user to create and delete a non-reel-canon movie', async () => {
    const newMovieData = movieFixture({ isReelCanon: false });
    // Create movie
    let res = await request(app).post('/movies/').set(userToken).send(newMovieData);
    expect(res.statusCode).toBe(201);
    expect(res.body.movie).toMatchObject({
      title: newMovieData.title,
      imdbId: newMovieData.imdbId,
      isReelCanon: false,
    });
    const createdMovieImdbId = res.body.movie.imdbId;
    // Delete movie
    res = await request(app).delete(`/movies/${createdMovieImdbId}`).set(userToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Movie deleted successfully',
      deletedMovie: expect.objectContaining({ imdbId: createdMovieImdbId }),
    });
    // Verify movie is removed from database
    const deletedMovie = await Movie.findOne({ imdbId: createdMovieImdbId });
    expect(deletedMovie).toBeNull();
  });

  // Test user cannot delete a reel-canon movie
  it('should prevent user from deleting a reel-canon movie', async () => {
    const reelCanonMovie = reelCanon[2];
    const res = await request(app).delete(`/movies/${reelCanonMovie.imdbId}`).set(userToken);
    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Reel Canon movies cannot be deleted',
    });
    // Verify movie is still in database
    const movieInDb = await Movie.findOne({ imdbId: reelCanonMovie.imdbId });
    expect(movieInDb).not.toBeNull();
  });

  // // After merging Joss latest updates to movies, check can only delete movies you created
  // it('should prevent user from deleting movies they did not create', async () => {
  //   // Create a non-reel-canon movie as otherUser
  //   const otherMovieData = movieFixture({ isReelCanon: false });
  //   let res = await request(app).post('/movies/').set(otherUserToken).send(otherMovieData);
  //   expect(res.statusCode).toBe(201);
  //   const otherMovieImdbId = res.body.movie.imdbId;
  //   // Attempt to delete otherUser's movie as user
  //   res = await request(app).delete(`/movies/${otherMovieImdbId}`).set(userToken);
  //   expect(res.statusCode).toBe(403);
  //   expect(res.body).toMatchObject({
  //     success: false,
  //     message: 'You do not have permission to delete this movie',
  //   });
  //   // Verify movie is still in database
  //   const movieInDb = await Movie.findOne({ imdbId: otherMovieImdbId });
  //   expect(movieInDb).not.toBeNull();
  // });
});

//-------------------------------------------------------------------------------------------------
// Tests for user using reel progress endpoints
//-------------------------------------------------------------------------------------------------
describe('Accessing reel progress endpoints as a non-admin user', () => {});
// Test user can add to reel progress
it('should allow user to add to their reel progress', async () => {
  const movie = reelCanon[3];
  const progressData = await reelProgressFixture(1, { movie: movie.id })[0];
  const res = await request(app).post('/reel-progress/').set(userToken).send(progressData);
  expect(res.statusCode).toBe(201);
  expect(res.body).toMatchObject({
    success: true,
    message: `${movie.title} added to your Reel Progress`,
    addedMovieId: progressData.movie,
  });
});

// Test user can get their reel progress
it('should allow user to get their reel progress', async () => {
  const res = await request(app).get('/reel-progress/').set(userToken);
  expect(res.statusCode).toBe(200);
  expect(res.body).toMatchObject({
    success: true,
    message: 'Reel Progress records found',
    reelProgress: [expect.objectContaining({ movie: reelCanon[3].id })],
  });
});

// Test a user can update their reel progress
it('should allow user to update their reel progress', async () => {
  const movie = reelCanon[3];
  const updatedProgressData = { rating: 4, isWatched: true };
  const res = await request(app)
    .patch(`/reel-progress/${movie.id}`)
    .set(userToken)
    .send(updatedProgressData);
  expect(res.statusCode).toBe(200);
  expect(res.body).toMatchObject({ success: true, message: `Rating updated` });
});

// Test a user can delete their reel progress
it('should allow user to delete their reel progress', async () => {
  const movie = reelCanon[3];
  const res = await request(app).delete(`/reel-progress/${movie.id}`).set(userToken);
  expect(res.statusCode).toBe(200);
  expect(res.body).toMatchObject({
    success: true,
    message: 'Reel Progress record deleted successfully',
  });
});

// Test user cannot access admin only reel progress routes
it('should prevent non-admin user from accessing admin only reel progress routes', async () => {
  let res = await request(app).get('/reel-progress/admin/').set(userToken);
  expect(res.statusCode).toBe(403);
  res = await request(app)
    .delete(`/reel-progress/admin/queries?userId=${user.id}&movieId=${reelCanon[0].id}`)
    .set(userToken);
  expect(res.statusCode).toBe(403);
});

//-------------------------------------------------------------------------------------------------
// Tests for deleting own profile
//-------------------------------------------------------------------------------------------------
describe('Deleting own profile as a non-admin user', () => {
  // Test user can delete their own profile
  it('should allow user to delete their own profile', async () => {
    const res = await request(app).delete('/users/my-profile').set(userToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'User profile deleted successfully',
      deletedUser: expect.objectContaining({ username: userData.username }),
    });
    // Verify user is removed from database
    const deletedUser = await User.findById(user.id);
    expect(deletedUser).toBeNull();
  });

  // Test that user cannot login after deleting their profile
  it('should not allow user to login after deleting their profile', async () => {
    const res = await request(app).post('/auth/login').send(userData);
    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Authentication failed: Incorrect email or password',
    });
  });

  // Test that user cannot access their routes after deleting their profile
  it('should prevent user from accessing their routes after deleting their profile', async () => {
    const res = await request(app).get('/users/my-profile').set(userToken);
    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      message: 'User no longer exists',
    });
  });
});

//-------------------------------------------------------------------------------------------------
// Tests for admin user creation and use of user admin endpoints
//-------------------------------------------------------------------------------------------------
describe('Creating and using an admin user for admin endpoints', () => {
  // Create admin user
  it('should register a new admin user', async () => {
    const res = await request(app).post('/auth/register').send(adminUserData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      message: 'User registration complete',
      token: expect.any(String),
      user: {
        id: expect.any(String),
        username: adminUserData.username,
        email: adminUserData.email,
        isAdmin: true,
      },
    });
    adminUser = await User.findById(res.body.user.id);
    expect(adminUser).not.toBeNull();
    expect(adminUser.isAdmin).toBe(true);
    // Assign token for use in later tests
    adminToken = { Authorization: `Bearer ${res.body.token}` };
  });

  // Test admin can access get user by ID route
  it('should allow admin to get a user by ID', async () => {
    const res = await request(app).get(`/users/${otherUser.id}`).set(adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      user: expect.objectContaining({ email: otherUser.email }),
    });
  });

  // Test admin can update user by ID route
  it('should allow admin to update a user by ID', async () => {
    const updatedData = { username: 'adminUpdatedUsername' };
    const res = await request(app).put(`/users/${otherUser.id}`).set(adminToken).send(updatedData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      user: expect.objectContaining({ username: updatedData.username }),
    });
    // Verify changes in database
    const updatedUser = await User.findById(otherUser.id);
    expect(updatedUser.username).toBe(updatedData.username);
    otherUser = updatedUser; // Update otherUser global variable for later tests
  });
});

//-------------------------------------------------------------------------------------------------
// Tests for admin using movie admin endpoints
//-------------------------------------------------------------------------------------------------
describe('Accessing movie admin endpoints as an admin user', () => {
  // Test admin can update a movie poster
  it('should allow admin to update a movie poster', async () => {
    const updatedData = { poster: 'newPosterUrl.jpg' };
    const movie = reelCanon[4];
    const res = await request(app)
      .patch(`/movies/${movie.imdbId}`)
      .set(adminToken)
      .send(updatedData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Movie poster updated successfully',
      movie: expect.objectContaining({ imdbId: movie.imdbId, poster: updatedData.poster }),
    });
    // Check changes in database
    const updatedMovie = await Movie.findById(movie.id).exec();
    expect(updatedMovie.poster).toBe(updatedData.poster);
  });
});

//-------------------------------------------------------------------------------------------------
// Tests for admin using reel canon admin endpoints
//-------------------------------------------------------------------------------------------------
describe('Accessing reel canon admin endpoints as an admin user', () => {
  // Test admin can get all reels
  it('should allow admin to get all reels', async () => {
    const res = await request(app).get('/reel-progress/admin/').set(adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      reelProgressData: expect.any(Array),
    });
  });

  // Test admin can delete other users reels
  it('should allow admin to delete other users reels', async () => {
    // Add reel progress to other user to delete
    const reelToDelete = reelCanon[5];
    otherUser = await User.findByIdAndUpdate(
      otherUser.id,
      { $push: { reelProgress: { movie: reelToDelete.id, isWatched: true } } },
      { new: true, runValidators: true },
    );
    // Delete the reel progress as admin
    const res = await request(app)
      .delete(`/reel-progress/admin/queries?userId=${otherUser.id}&movieId=${reelToDelete.id}`)
      .set(adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'User Reel Progress record deleted successfully',
    });
  });
});

//-------------------------------------------------------------------------------------------------
// Test admin can delete user by ID route
//-------------------------------------------------------------------------------------------------
describe('Deleting a user by ID as an admin user', () => {
  it('should allow admin to delete a user by ID', async () => {
    const res = await request(app).delete(`/users/${otherUser.id}`).set(adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'User profile deleted successfully',
      deletedUser: expect.objectContaining({ email: otherUser.email }),
    });
    // Verify user is removed from database
    const deletedUser = await User.findById(otherUser.id);
    expect(deletedUser).toBeNull();
  });
});

//-------------------------------------------------------------------------------------------------
// Tests for admin deleting their own profile
//-------------------------------------------------------------------------------------------------
describe('Deleting own profile as an admin user', () => {
  // Test admin can delete their own profile
  it('should allow admin to delete their own profile', async () => {
    const res = await request(app).delete('/users/my-profile').set(adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'User profile deleted successfully',
      deletedUser: expect.objectContaining({ username: adminUserData.username }),
    });
    // Verify admin user is removed from database
    const deletedAdminUser = await User.findById(adminUser.id);
    expect(deletedAdminUser).toBeNull();
  });

  // Test that admin cannot login after deleting their profile
  it('should not allow admin to login after deleting their profile', async () => {
    const res = await request(app).post('/auth/login').send(adminUserData);
    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Authentication failed: Incorrect email or password',
    });
  });

  // Test admin cannot access admin routes after deleting their profile
  it('should prevent admin from accessing admin routes after deleting their profile', async () => {
    const res = await request(app).get('/users').set(adminToken);
    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      message: 'User no longer exists',
    });
  });
});

//-------------------------------------------------------------------------------------------------
