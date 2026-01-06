import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import Friendship from '../../models/Friendship';
import User from '../../models/User';
import { clearTestDb, setupTestDb, teardownTestDb } from '../setup/testDb';
import { userFixture } from '../setup/fixtures';

// Empty variables to be assigned in beforeAll hooks
let user1;
let user2;

// Runs before all tests in file
beforeAll(async () => {
  await setupTestDb(); // Set up in memory MongoDB database and console spies
});
// Runs before each test in file
beforeEach(async () => {
  await clearTestDb(); // Clear database before each test
  // Create two users for testing
  [user1, user2] = await User.create(Array.from({ length: 2 }, () => userFixture()));
});
// Runs after all tests in file
afterAll(async () => {
  await teardownTestDb(); // Teardown in memory MongoDB database and restore console spies
});

// Test that built in and custom schema validations work correctly
describe('Friendship model schema validation works correctly', () => {
  it('should create a valid friendship instance', async () => {
    const friendship = await Friendship.create({
      user1: user1.id,
      user2: user2.id,
      requesterUserId: user1.id,
      friendRequestAccepted: true,
    });

    expect(friendship).toBeDefined(); // Check creation succeeded
    // Check that user1 and user2 where assigned to friendship (sort to avoid order issues)
    // eslint-disable-next-line no-underscore-dangle
    expect([friendship.user1, friendship.user2]).toEqual([user1._id, user2._id].sort());
    expect(friendship.friendRequestAccepted).toBe(true); // Check set to true correctly
    expect(friendship.createdAt).toBeDefined(); // Check timestamps created
    expect(friendship.updatedAt).toBeDefined();
  });
  // Test default value for friendRequestAccepted
  it('should default friendRequestAccepted to false if not given', async () => {
    const friendship = await Friendship.create({
      user1: user1.id,
      user2: user2.id,
      requesterUserId: user1.id,
      // friendRequestAccepted not provided - should default to false
    });

    expect(friendship.friendRequestAccepted).toBe(false);
  });
  // Test missing fields trigger expected validation errors and messages
  it('should trigger schema validation errors when missing required fields', async () => {
    // Create friendship with missing user1 and expect validation error
    await expect(Friendship.create({ user2: user2.id, requesterUserId: user2.id })).rejects.toThrow(
      expect.objectContaining({
        name: 'ValidationError',
        message: 'Friendship validation failed: user1: Path `user1` is required.',
      }),
    );

    // Create friendship with missing user2 and expect validation error
    await expect(Friendship.create({ user1: user1.id, requesterUserId: user1.id })).rejects.toThrow(
      expect.objectContaining({
        name: 'ValidationError',
        message: 'Friendship validation failed: user2: Path `user2` is required.',
      }),
    );

    // Create friendship with missing requesterUserId and expect validation error
    await expect(Friendship.create({ user1: user1.id, user2: user2.id })).rejects.toThrow(
      expect.objectContaining({
        name: 'ValidationError',
        message:
          'Friendship validation failed: requesterUserId: Path `requesterUserId` is required.',
      }),
    );
  });
  // Test self-friendship attempt triggers expected validation error
  it('should reject friendship with same user (user1 === user2)', async () => {
    await expect(
      Friendship.create({ user1: user1.id, user2: user1.id, requesterUserId: user1.id }),
    ).rejects.toThrow(
      expect.objectContaining({
        name: 'ValidationError',
        message: 'Friendship validation failed: user1: Cannot create friendship with yourself',
      }),
    );
  });
});
// Test that user IDs are automatically ordered when saved to db
describe('Friendship Model pre save hook correctly orders user IDs', () => {
  it('should automatically order user IDs by smallest to largest', async () => {
    // Create with IDs in any order
    const sortedIds = [user1.id, user2.id].sort(); // Sort ids
    const friendship = await Friendship.create({
      user1: sortedIds[1], // larger ID first
      user2: sortedIds[0], // smaller ID second
      requesterUserId: user2.id,
    });

    // Should be reordered to user1 < user2
    expect(friendship.user1 < friendship.user2).toBe(true);
  });
});

// Test that unique composite keys are enforced by db regardless of order
describe('Friendship Model enforces unique composite keys', () => {
  it('should reject duplicate friendship if keys are same order', async () => {
    await Friendship.create({ user1: user1.id, user2: user2.id, requesterUserId: user1.id });

    // Try to create duplicate
    await expect(
      Friendship.create({ user1: user1.id, user2: user2.id, requesterUserId: user2.id }),
    ).rejects.toThrow(expect.objectContaining({ name: 'MongoServerError' }));
  });

  it('should reject duplicate friendship if keys are reversed', async () => {
    await Friendship.create({ user1: user1.id, user2: user2.id, requesterUserId: user1.id });

    // Try to create reverse duplicate (should be normalized to same order)
    await expect(
      Friendship.create({
        user1: user2.id, // reversed
        user2: user1.id, // reversed
        requesterUserId: user2.id,
      }),
    ).rejects.toThrow(expect.objectContaining({ name: 'MongoServerError' }));
  });
});

// Tests custom findBetween static method
describe('Friendship Model static method findBetween() should work as expected', () => {
  // Check it works to find existing friendship
  it('should find and return friendship between two users', async () => {
    const created = await Friendship.create({
      user1: user1.id,
      user2: user2.id,
      requesterUserId: user1.id,
    });
    // Return friendship document using static method
    const found = await Friendship.findBetween(user1.id, user2.id);
    // Check document exists and matches created
    expect(found).toBeDefined();
    expect(found.id).toBe(created.id);
  });
  // Check it works regardless of parameter order
  it('should find still find friendship if user order reversed', async () => {
    await Friendship.create({ user1: user1.id, user2: user2.id, requesterUserId: user1.id });
    // Return document with original and reversed order as parameters
    const found1 = await Friendship.findBetween(user1.id, user2.id);
    const found2 = await Friendship.findBetween(user2.id, user1.id);

    expect(found1).toBeDefined();
    expect(found2).toBeDefined();
    expect(found1.id).toBe(found2.id);
  });
  // Check it returns null if no friendship exists
  it('should return null if friendship does not exist', async () => {
    const found = await Friendship.findBetween(user1.id, user2.id);
    expect(found).toBeNull();
  });
});

// Tests custom areFriends static method
describe('Friendship Model static method areFriends() works as expected', () => {
  // Check it returns false if no friendship exists
  it('should return false if no friendship exists', async () => {
    const result = await Friendship.areFriends(user1.id, user2.id);
    expect(result).toBe(false);
  });
  // Check a pending but not accepted friendship still returns false
  it('should return false if friendship is pending (not accepted)', async () => {
    await Friendship.create({
      user1: user1.id,
      user2: user2.id,
      requesterUserId: user1.id,
      friendRequestAccepted: false,
    });

    const result = await Friendship.areFriends(user1.id, user2.id);
    expect(result).toBe(false);
  });
  // Check an accepted friendship returns true
  it('should return true for existing accepted friendship', async () => {
    await Friendship.create({
      user1: user1.id,
      user2: user2.id,
      requesterUserId: user1.id,
      friendRequestAccepted: true,
    });

    const result = await Friendship.areFriends(user1.id, user2.id);
    expect(result).toBe(true);
  });
  // Check it works regardless of parameter order
  it('should return true when ids out of order', async () => {
    await Friendship.create({
      user1: user1.id,
      user2: user2.id,
      requesterUserId: user1.id,
      friendRequestAccepted: true,
    });

    const result1 = await Friendship.areFriends(user1.id, user2.id);
    const result2 = await Friendship.areFriends(user2.id, user1.id);

    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });
});

// Test friendship creation, update and accept, and method use together
describe('Friendship Model integration tests', () => {
  it('should simulate full friendship request and acceptance', async () => {
    // Create friendship request with default pending status
    const friendship = await Friendship.create({
      user1: user1.id,
      user2: user2.id,
      requesterUserId: user1.id,
    });
    // Check accepted defaults to false
    expect(friendship.friendRequestAccepted).toBe(false);

    // Check areFriends returns false while pending
    let areFriends = await Friendship.areFriends(user1.id, user2.id);
    expect(areFriends).toBe(false);

    // Update friendRequestAccepted to true to simulate acceptance
    friendship.friendRequestAccepted = true;
    await friendship.save();

    // Check areFriends now returns true
    areFriends = await Friendship.areFriends(user1.id, user2.id);
    expect(areFriends).toBe(true);

    // Verify friendship can be found from either direction
    const found1 = await Friendship.findBetween(user1.id, user2.id);
    const found2 = await Friendship.findBetween(user2.id, user1.id);
    expect(found1.id).toBe(found2.id);
  });
});
