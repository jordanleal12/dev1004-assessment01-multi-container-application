// Only jest and expect import required, others imported for clarity
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../../server';
import { setupTestDb, clearTestDb, teardownTestDb } from '../setup/testDb';
import User from '../../models/User';
import { userFixture, getAuthToken } from '../setup/fixtures';
import { authenticatedRequest, adminRequest } from '../setup/authHelper';

// Empty variables to be assigned in beforeAll hooks
let authHeader;
let adminHeader;

beforeAll(async () => {
  await setupTestDb(); // Set up in memory MongoDB database and console spies
});

beforeEach(async () => {
  await clearTestDb(); // Clear database before each test
  authHeader = await authenticatedRequest(); // Get auth header for normal user
  adminHeader = await adminRequest(); // Get auth header for admin user
});

afterAll(async () => {
  await teardownTestDb(); // Teardown in memory MongoDB database and restore console spies
});

// Test admin endpoint for getting all users works correctly
describe('GET /users endpoint works correctly', () => {
  // Test for successful retrieval of all users
  it('should successfully get all users when users exist', async () => {
    // Create multiple users
    await User.create(Array.from({ length: 5 }, () => userFixture()));
    // Call get request to fetch all users. Use adminHeader for admin auth token
    const res = await request(app).get('/users').set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      users: expect.any(Array),
    });
    // 5 created + 1 each for authHeader and adminHeader in beforeEach
    expect(res.body.users.length).toBe(7);
  });
});

// Test admin endpoint for getting user by url params works correctly
describe('GET /users/:userID endpoint works correctly', () => {
  // Tests that id is used from params to get user profile
  it('should successfully get a user profile by ID', async () => {
    // Create user to be fetched
    const user = await User.create(userFixture());
    // Call get request to fetch a different user's profile using userId param and setting admin auth header
    const res = await request(app).get(`/users/${user.id}`).set(adminHeader);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      user: {
        _id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: false,
      },
    });
  });
  // Tests that a valid but non-existent ID returns 404
  it('should return 404 and message if no user found with given ID', async () => {
    // Valid ID type but doesn't exist in DB
    const fakeID = '64d2f0c2f0c2f0c2f0c2f0c2';
    // Call admin fetch route with fakeID using adminHeader for auth
    const res = await request(app).get(`/users/${fakeID}`).set(adminHeader);
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      message: `User with id ${fakeID} not found`,
    });
  });
  // Tests that invalid ID triggers cast error and is caught by error handling middleware
  it('should trigger cast error and be caught by middleware for invalid id type', async () => {
    // Call response with invalid id type using adminHeader for auth
    const res = await request(app).get('/users/1').set(adminHeader);
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Cast error: value (1) is not valid for _id',
    });
  });
});

// Test endpoint for getting own user profile by attached user works correctly
describe('GET /users/my-profile endpoint works correctly', () => {
  it('should successfully get the current user profile when authenticated', async () => {
    const userData = userFixture();
    const createdUser = await User.create(userData);
    const token = await getAuthToken(app, userData);
    // Attach token to header with .set method
    const res = await request(app).get('/users/my-profile').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      user: {
        _id: createdUser.id,
        username: userData.username,
        email: userData.email,
        isAdmin: false,
        reelProgress: [],
      },
    });
  });
  // Test for no token provided, should trigger 'verifyToken' middleware
  it('should return 401 and message if no token', async () => {
    await User.create(userFixture());
    const res = await request(app).get('/users/my-profile');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Access denied. No token provided.',
    });
  });
  // Test for invalid token provided, should trigger 'verifyToken' middleware
  it('should return 400 and message if invalid token', async () => {
    await User.create(userFixture());
    const res = await request(app)
      .get('/users/my-profile')
      .set('Authorization', 'Bearer invalidtoken123');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Invalid token',
    });
  });
});

// Test endpoint for updating user profile for current user works correctly
describe('PUT /users/my-profile endpoint works correctly', () => {
  // Test for successful profile update
  it('should successfully update the current user profile when authenticated', async () => {
    const userData = userFixture();
    const user = await User.create(userData);
    const token = await getAuthToken(app, userData);
    const updatedData = { username: 'random-name', email: 'random-email@example.com' };
    // Call put request with updated data
    const res = await request(app)
      .put('/users/my-profile')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      user: {
        _id: user.id,
        username: updatedData.username,
        email: updatedData.email,
      },
    });
  });
  // Test for no token provided, should trigger 'verifyToken' middleware
  it('should return 401 and message if no token', async () => {
    const res = await request(app).put('/users/my-profile').send({ username: 'newname' });
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Access denied. No token provided.',
    });
  });
});

// Test endpoint for updating user profile for admin updating another user works correctly
describe('PUT /users/:userId endpoint works correctly', () => {
  // Test update works for admin updating someone else's profile
  it('should allow admin to update different user profile', async () => {
    // Create user to be updated
    const user = await User.create(userFixture());
    // Data to be updated
    const updatedData = { username: 'random-name' };
    // Call put request to update other user's profile using userId param
    const res = await request(app).put(`/users/${user.id}`).set(adminHeader).send(updatedData);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      _id: user.id,
      username: updatedData.username,
    });
  });
  // Test for non admin trying to update another user's profile
  it("should return 403 and message if non-admin tries to update another user's profile", async () => {
    // Created non admin user has different token to authHeader
    const user = await User.create(userFixture());
    // Call res and attempt to update users profile using authHeader token
    const res = await request(app)
      .put(`/users/${user.id}`)
      .set(authHeader)
      .send({ username: 'newname' });
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Admin access required',
    });
  });
});

// Test endpoint for updating user password works for both user and admin
describe('PUT /users/my-profile/update-password endpoint works correctly', () => {
  // Test for successful password update
  it('should successfully update the current user password when authenticated', async () => {
    const userData = userFixture();
    await User.create(userData);
    const token = await getAuthToken(app, userData);
    const newPasswordData = { currentPassword: userData.password, newPassword: 'Newpassword1!' };
    // Call put request with new password data
    const res = await request(app)
      .put('/users/my-profile/update-password')
      .set('Authorization', `Bearer ${token}`)
      .send(newPasswordData);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Password updated successfully',
    });
    const user = await User.findOne({ email: userData.email }).exec();
    // Verify password is actually updated (hashed, so shouldn't match plain text)
    expect(user.password).not.toBe('Newpassword1!');
  });
  // Test for admin successfully updating another user's password (commented out for future discussion)
  // it("should allow admin to update another user's password", async () => {
  //   // Create other user to be updated
  //   const otherUser = await User.create(userFixture());
  //   const newPasswordData = { newPassword: 'Newpassword1!' };
  //   // Call put request using userId param and update password
  //   const res = await request(app)
  //     .put(`/users/${otherUser.id}/update-password`)
  //     .set(adminHeader)
  //     .send(newPasswordData);
  //   expect(res.status).toBe(200);
  //   expect(res.body).toMatchObject({
  //     success: true,
  //     message: 'Password updated successfully',
  //   });
  // });
  // Test that invalid password rejects update
  it('should return 401 and message if current password is incorrect', async () => {
    const userData = userFixture();
    await User.create(userData);
    const token = await getAuthToken(app, userData);
    const newPasswordData = { currentPassword: 'Wrongpassword1!', newPassword: 'Newpassword1!' };
    // Call put request with new password data
    const res = await request(app)
      .put('/users/my-profile/update-password')
      .set('Authorization', `Bearer ${token}`)
      .send(newPasswordData);
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Invalid current password',
    });
  });
  // Test it returns error message for invalid new password
  it('should return 400 and message if new password does not meet criteria', async () => {
    const userData = userFixture();
    await User.create(userData);
    const token = await getAuthToken(app, userData);
    const newPasswordData = { currentPassword: userData.password, newPassword: 'short' };
    // Call put request with new password data
    const res = await request(app)
      .put('/users/my-profile/update-password')
      .set('Authorization', `Bearer ${token}`)
      .send(newPasswordData);
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Schema validation failed',
    });
  });
});

// Test endpoint for deleting user profile works correctly
describe('DELETE /users/my-profile endpoint works correctly', () => {
  // Test for successful profile deletion
  it('should successfully delete the current user profile when authenticated', async () => {
    const userData = userFixture();
    const user = await User.create(userData);
    const token = await getAuthToken(app, userData);
    // Call delete request
    const res = await request(app)
      .delete('/users/my-profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'User profile deleted successfully',
    });
    // Verify user is actually deleted from DB
    const deletedUser = await User.findById(user.id).exec();
    expect(deletedUser).toBeNull();
  });
  // Test for admin deletion route
  it('should allow admin to delete another user profile', async () => {
    // Create other user to be deleted
    const otherUser = await User.create(userFixture());
    // Call delete request to delete other user's profile using userId param
    const res = await request(app).delete(`/users/${otherUser.id}`).set(adminHeader);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'User profile deleted successfully',
    });
    // Verify other user is actually deleted from DB
    const deletedUser = await User.findById(otherUser.id).exec();
    expect(deletedUser).toBeNull();
  });
  // Test for non admin trying to delete another user's profile
  it("should return 403 and message if non-admin tries to delete another user's profile", async () => {
    const otherUser = await User.create(userFixture());
    // Call delete request on otherUser using different non-admin authHeader JWT token
    const res = await request(app).delete(`/users/${otherUser.id}`).set(authHeader);
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Admin access required',
    });
  });
});
