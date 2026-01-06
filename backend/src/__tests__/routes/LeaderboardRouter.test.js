import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { clearTestDb, setupTestDb, teardownTestDb } from '../setup/testDb';
import { app } from '../../server';
import { userFixture, usersWithReelProgressFixture } from '../setup/fixtures';
import User from '../../models/User';

beforeAll(async () => {
  await setupTestDb(); // Set up in memory MongoDB database and console spies
});

// before each request, clear the in memory MongoDB database
beforeEach(async () => {
  await clearTestDb();
});

afterAll(async () => {
  await teardownTestDb(); // Teardown in memory MongoDB database and restore console spies
});

describe('GET /leaderboard', () => {
  it('should get all reelProgress records', async () => {
    // Create user data with Reel Progress records
    const users = usersWithReelProgressFixture();
    // Create actual users in the database with the user data
    await Promise.all(users.map((userData) => User.create(userData)));

    const response = await request(app).get('/leaderboard').expect(200);

    expect(response.body.success).toBe(true); // Check success is true
    expect(response.body.reelProgressData).toHaveLength(3); // Check that the correct amount of users are found
    expect(response.body.message).toBe('Found 3 users with Reel Progress'); // Check correct message is sent in response
  });
  it('should return updatedAt with valid date', async () => {
    // Create user data with Reel Progress
    const users = usersWithReelProgressFixture();
    // Create actual users in the database with the user data
    await Promise.all(users.map((userData) => User.create(userData)));

    const response = await request(app).get('/leaderboard').expect(200);

    expect(response.body.updatedAt).toBeDefined(); // Expect updatedAt to have a value
    expect(new Date(response.body.updatedAt).toString()).not.toBe('Invalid date'); // Expect the date to be a valid date
  });
  it('should return results in descending order', async () => {
    // Create user data with reel progress records
    const users = usersWithReelProgressFixture();
    // Create actual users with the user data
    await Promise.all(users.map((userData) => User.create(userData)));

    const response = await request(app).get('/leaderboard').expect(200);

    // map the user reelProgress counts to an array (should be ordered already)
    const counts = response.body.reelProgressData.map((user) => user.reelProgressCount);

    expect(counts).toEqual([8, 5, 3]); // Expect results to be in correct order
  });
  it('should return a message if users exist but none have reelProgress records', async () => {
    // Create users without reel progress records
    await User.create(Array.from({ length: 3 }, () => userFixture()));

    const response = await request(app).get('/leaderboard').expect(200);

    expect(response.body.message).toBe('Leaderboard is empty - no users with reel progress yet');
  });
  it('should return an empty array if no users exist', async () => {
    const response = await request(app).get('/leaderboard').expect(200);
    expect(response.body.reelProgressData).toStrictEqual([]);
  });
});
