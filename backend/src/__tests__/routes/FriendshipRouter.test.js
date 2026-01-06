import mongoose from 'mongoose';
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../../server';
import { setupTestDb, clearTestDb, teardownTestDb } from '../setup/testDb';
import User from '../../models/User';
import Friendship from '../../models/Friendship';
import { userFixture, getAuthToken, friendshipFixture } from '../setup/fixtures';
import { adminRequest, authenticatedRequest } from '../setup/authHelper';

// set up the empty authHeader variable
let consoleSpy;
let authHeader;
let adminHeader;

beforeAll(async () => {
  await setupTestDb();
  consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(async () => {
  await teardownTestDb();
  consoleSpy.mockRestore();
});

beforeEach(async () => {
  await clearTestDb();
  authHeader = await authenticatedRequest();
  adminHeader = await adminRequest();
});

// Test admin route for getting all friendships
describe('GET /friendships route for getting all friendships works', () => {
  // Test that it returns a successful response for admin user
  it('should return 200 and list of friendships for admin user', async () => {
    const response = await request(app).get('/friendships').set(adminHeader);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('friendships');
    expect(Array.isArray(response.body.friendships)).toBe(true);
  });
  // Test that it returns a 403 forbidden response for non-admin user
  it('should return 403 for non-admin user', async () => {
    const response = await request(app).get('/friendships').set(authHeader);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Admin access required');
  });
});

// Test user route for getting own friendships
describe('GET /friendships/my-friends', () => {
  // Test that it doesn't work without token
  it('should return 401 if no token provided', async () => {
    const response = await request(app).get('/friendships/my-friends');
    expect(response.status).toBe(401);
  });
  // Test that it returns a successful response for authenticated user
  it('should return 200 and list of friendships for authenticated user', async () => {
    const userData = userFixture();
    await User.create(userData);
    const token = await getAuthToken(app, userData);
    const response = await request(app)
      .get('/friendships/my-friends')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('friendships');
    expect(Array.isArray(response.body.friendships)).toBe(true);
  });
  // Test that admins can access other users' friendships
  it('should allow admin to get friendships for a specific user by userId', async () => {
    const user = await User.create(userFixture());
    const user2 = await User.create(userFixture());
    await Friendship.create(
      friendshipFixture({
        user1: user.id,
        user2: user2.id,
        requesterUserId: user.id,
      }),
    );
    const response = await request(app).get(`/friendships/${user.id}`).set(adminHeader);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('friendships');
    expect(Array.isArray(response.body.friendships)).toBe(true);
    expect(response.body.friendships.length).toBe(1);
  });
});

// Test creating a friendship endpoint works correctly
describe('POST /friendships route for creating a friendship works', () => {
  // Test that it doesn't work without token
  it('should return 401 if no token provided', async () => {
    const recipientUser = userFixture();
    const response = await request(app).post(`/friendships/${recipientUser.id}`);
    expect(response.status).toBe(401);
  });
  // Test that it returns 400 if recipient user does not exist
  it('should return 400 if recipient user does not exist', async () => {
    const recipientUserId = new mongoose.Types.ObjectId();
    // call the endpoint with a valid but non-existent user id parameter
    const response = await request(app).post(`/friendships/${recipientUserId}`).set(authHeader);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Provided recipient user does not exist',
    });
  });

  // Test that it creates a friendship successfully
  it('should create a friendship successfully', async () => {
    const user = userFixture();
    const user1 = await User.create(user);
    const token = await getAuthToken(app, user);
    const recipientUser = await User.create(userFixture());
    const sortedUserIds = [user1.id, recipientUser.id].sort();
    const response = await request(app)
      .post(`/friendships/${recipientUser.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Friend request sent successfully',
      friendship: {
        user1: sortedUserIds[0],
        user2: sortedUserIds[1],
        requesterUserId: user1.id,
        friendRequestAccepted: false,
      },
    });
  });
});

// Test that user route for accepting a friend request works
describe('PUT /friendships/my-friends/:id route for accepting a friend request works', () => {
  // Test that friendship can successfully be updated to accepted
  it('should successfully update a friend request to accepted', async () => {
    const userData = userFixture();
    const user = await User.create(userData);
    const token = await getAuthToken(app, userData);
    const user2 = await User.create(userFixture());
    const [user1Id, user2Id] = [user.id, user2.id].sort(); // (1,2)/(2,1)
    await Friendship.create(
      friendshipFixture({
        user1: user.id,
        user2: user2.id,
        requesterUserId: user2.id,
      }),
    );
    const response = await request(app)
      .put(`/friendships/my-friends/${user2.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Friend request accepted successfully',
      updatedFriendship: {
        user1: user1Id,
        user2: user2Id,
        requesterUserId: user2.id,
        friendRequestAccepted: true,
      },
    });
  });

  // Test that it returns 400 if no pending friendship found
  it('should return 400 if no pending friendship found to accept', async () => {
    const userData = userFixture();
    await User.create(userData);
    const token = await getAuthToken(app, userData);
    const user2 = await User.create(userFixture());
    const response = await request(app)
      .put(`/friendships/my-friends/${user2.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Pending friendship document not found with provided parameters',
    });
  });

  // Test that an admin can accept a friend request on behalf of a user
  it('should allow admin to accept a friend request on behalf of a user', async () => {
    const user2 = await User.create(userFixture());
    const userData = userFixture();
    const user = await User.create(userData);
    const [user1Id, user2Id] = [user.id, user2.id].sort(); // (1,2)/(2,1)
    await Friendship.create(
      friendshipFixture({
        user1: user.id,
        user2: user2.id,
        requesterUserId: user2.id,
      }),
    );
    const response = await request(app)
      .put(`/friendships/`)
      .set(adminHeader)
      .send({ recipientUserId: user.id, requesterUserId: user2.id });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Friend request accepted successfully',
      updatedFriendship: {
        user1: user1Id,
        user2: user2Id,
        requesterUserId: user2.id,
        friendRequestAccepted: true,
      },
    });
  });

  // Test that it returns 400 if admin forgets to provide response body
  it('should return 400 if admin forgets to provide request body', async () => {
    const response = await request(app).put(`/friendships/`).set(adminHeader).send({});
    expect(response.status).toBe(400);
  });
});

// Test that user route for deleting a friend request works
describe('DELETE /friendships/my-friends/:otherUserId route for deleting a friendship document', () => {
  // Test that friendship can successfully be updated to accepted
  it('should successfully delete a friendship', async () => {
    const userData = userFixture();
    const user = await User.create(userData);
    const token = await getAuthToken(app, userData);
    const user2 = await User.create(userFixture());
    const [user1Id, user2Id] = [user.id, user2.id].sort(); // (1,2)/(2,1)
    await Friendship.create(
      friendshipFixture({
        user1: user.id,
        user2: user2.id,
        requesterUserId: user2.id,
      }),
    );
    const response = await request(app)
      .delete(`/friendships/my-friends/${user2.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Friendship document deleted successfully',
      deletedFriendship: {
        user1: user1Id,
        user2: user2Id,
        requesterUserId: user2.id,
        friendRequestAccepted: false,
      },
    });
  });

  // Test that it returns 400 if no existing friendship found
  it('should return 400 if no existing friendship found to delete', async () => {
    const userData = userFixture();
    await User.create(userData);
    const token = await getAuthToken(app, userData);
    const user2 = await User.create(userFixture());
    const response = await request(app)
      .delete(`/friendships/my-friends/${user2.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Friendship document not found with provided parameters',
    });
  });

  // Test that an admin can delete a friendship on behalf of other users
  it('should allow admin to delete a friendship on behalf of another user', async () => {
    const user2 = await User.create(userFixture());
    const userData = userFixture();
    const user = await User.create(userData);
    await Friendship.create(
      friendshipFixture({
        user1: user.id,
        user2: user2.id,
        requesterUserId: user2.id,
      }),
    );
    const [user1Id, user2Id] = [user.id, user2.id].sort(); // (1,2)/(2,1)
    const response = await request(app)
      .delete(`/friendships/`)
      .set(adminHeader)
      .send({ userId: user.id, otherUserId: user2.id });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Friendship document deleted successfully',
      deletedFriendship: {
        user1: user1Id,
        user2: user2Id,
        requesterUserId: user2.id,
        friendRequestAccepted: false,
      },
    });
  });

  // Test that it returns 400 if admin forgets to provide response body
  it('should return 400 if admin forgets to provide request body', async () => {
    const response = await request(app).put(`/friendships/`).set(adminHeader).send({});
    expect(response.status).toBe(400);
  });
});
