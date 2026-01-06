/* eslint-disable import/no-mutable-exports */
// Functions for setting up, clearing and tearing down in memory MongoDB for testing
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';

// Declare mongoServer globally so it can be used by all functions
let mongoServer;
// Declare console spies to mock log and error outputs during tests
export let consoleLogSpy; // Import in tests to access mocked console log
export let consoleErrorSpy; // Import in tests to access mocked console error

// Setup function to run before all tests to start in memory MongoDB and setup console spies
export async function setupTestDb() {
  // Mock console log and error outputs to prevent cluttering console and catch specific logs if needed
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  // Start in memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  // Get connection string and connect mongoose to in memory db
  const uri = mongoServer.getUri();
  // Connect mongoose to in memory MongoDB
  await mongoose.connect(uri);
}

// Function for clearing all data from database between tests
export async function clearTestDb() {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

// Function to run after all tests to teardown in memory MongoDB and restore console spies
export async function teardownTestDb() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
  // Restore console spies
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
}
