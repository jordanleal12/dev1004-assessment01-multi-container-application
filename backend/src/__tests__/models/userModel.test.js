import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import User from '../../models/User';
import { clearTestDb, setupTestDb, teardownTestDb } from '../setup/testDb';
import { userFixture } from '../setup/fixtures';

// Runs before all tests in file
beforeAll(async () => {
  await setupTestDb(); // Set up in memory MongoDB database and console spies
});
// Runs before each test in file
beforeEach(async () => {
  await clearTestDb(); // Clear database before each test
});
// Runs after all tests in file
afterAll(async () => {
  await teardownTestDb(); // Teardown in memory MongoDB database and restore console spies
});

// Tests for User model schema validation
describe('User Schema validation', () => {
  // Tests creating user with valid data works
  it('Create user with valid data and hash password before saving', async () => {
    const userData = userFixture();
    const testUser = await User.create(userData);
    const keys = ['username', 'email', 'isAdmin'];
    keys.forEach((key) => {
      expect(testUser[key]).toBe(userData[key]);
    });
    expect(testUser.password).not.toBe(userData.password);
    expect(testUser.password.length).toBeGreaterThan(20);
  });
  // Tests for rejecting weak passwords
  const passwordTests = [
    ['too short', 'Ab1!'],
    ['no lowercase', 'ABCD1234!'],
    ['no uppercase', 'abcd1234!'],
    ['no number', 'Abcdefgh!'],
    ['no symbol', 'Abcdefg1'],
  ];
  // Create a test for each invalid password case, '%s' replaced by first element in each array
  it.each(passwordTests)('should reject password for: %s', async (_, password) => {
    const userData = userFixture({ password });
    await expect(User.create(userData)).rejects.toThrow(
      expect.objectContaining({ name: 'ValidationError' }),
    );
  });
  // Test for rejecting incorrect email format
  it('should reject incorrect email format', async () => {
    const userData = userFixture({ email: 'invalid-email' });
    await expect(User.create(userData)).rejects.toThrow(
      expect.objectContaining({ name: 'ValidationError' }),
    );
  });
  // Test for rejecting duplicate usernames
  it('should reject duplicate username', async () => {
    const username = 'duplicateUser';
    const userData1 = userFixture({ username });
    const userData2 = userFixture({ username });

    await User.create(userData1);
    await expect(User.create(userData2)).rejects.toThrow(
      expect.objectContaining({ name: 'MongoServerError' }),
    );
  });
  // Test for rejecting duplicate emails
  it('should reject duplicate email', async () => {
    const email = 'someuser@email.com';
    // Create two user fixtures with identical email
    const [userData1, userData2] = [userFixture({ email }), userFixture({ email })];
    // Add first user to database
    await User.create(userData1);
    // Expect adding second user to throw MongoServerError for duplicate key
    await expect(User.create(userData2)).rejects.toThrow(
      expect.objectContaining({ name: 'MongoServerError' }),
    );
  });
});
