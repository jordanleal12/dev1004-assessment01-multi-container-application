// Only jest and expect import required, others imported for clarity
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../server';
import { setupTestDb, clearTestDb, teardownTestDb, consoleErrorSpy } from './setup/testDb';
import errorHandler from '../utils/errorHandler';

beforeAll(async () => {
  await setupTestDb(); // Set up in memory MongoDB database and console spies
});

beforeEach(async () => {
  await clearTestDb(); // Clear database before each test
});

// Runs after all tests in file
afterAll(async () => {
  await teardownTestDb(); // Teardown in memory MongoDB database and restore console spies
});

// A basic test to verify Jest is set up correctly
describe('Jest setup test', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });
});

// Tests to verify server is setup and exported correctly
describe('Server Basic Setup Works', () => {
  it('should export an express app', () => {
    expect(app).toBeDefined(); // Check app instance exists
    expect(typeof app).toBe('function'); // Express apps are functions
  });
});

// Tests for endpoints in server.js
describe('Empty and Invalid Server Endpoints Work', () => {
  it('should return 200 for GET /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
  it('should 404 for invalid routes', async () => {
    const res = await request(app).get('/some-random-route');
    expect(res.statusCode).toBe(404);
  });
});

// Tests for health endpoint. Only basic tests, database connection tests will be in databaseHealth.test.js
describe('Health Check Endpoint Works in Test and Development Environment Only', () => {
  // Test in test environment
  it('should return 200 and correct json properties in test environment', async () => {
    const res = await request(app).get('/database-health');
    expect(res.statusCode).toBe(200);
    const properties = ['readyState', 'dbName', 'dbModels', 'dbHost', 'dbPort', 'dbUser'];
    properties.forEach((prop) => {
      expect(res.body).toHaveProperty(prop);
    });
  });

  // it('should return 200 in development environment', async () => {
  //   process.env.NODE_ENV = 'development';
  //   // Reset cache so we can reload with dev database
  //   jest.resetModules();
  //   const { app: devApp, connectToDatabase, databaseURL } = await import('../server');
  //   const { databaseDisconnector } = await import('../config/database');
  //   await connectToDatabase(databaseURL);
  //   const res = await request(devApp).get('/database-health');
  //   expect(res.statusCode).toBe(200);
  //   await databaseDisconnector();
  //   process.env.NODE_ENV = 'test';
  // });

  // Simulate production environment
  it('should return 404 in production environment', async () => {
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    const { app: prodApp } = await import('../server');
    const res = await request(prodApp).get('/database-health');
    expect(res.statusCode).toBe(404);
    process.env.NODE_ENV = 'test';
  });
});

// Tests to check middleware configuration is set up correctly
describe('Middleware is configured correctly', () => {
  // Test helmet middleware is active by checking for security headers
  it('should have helmet default security headers set', async () => {
    const res = await request(app).get('/');
    // Array of security headers that should be applied by helmet
    const helmetHeaders = [
      'content-security-policy',
      'cross-origin-opener-policy',
      'cross-origin-resource-policy',
      'origin-agent-cluster',
      'referrer-policy',
      'strict-transport-security',
      'x-content-type-options',
      'x-dns-prefetch-control',
      'x-download-options',
      'x-frame-options',
      'x-permitted-cross-domain-policies',
    ];
    helmetHeaders.forEach((header) => {
      expect(res.headers).toHaveProperty(header);
    });
  });

  // Test that JSON parsing middleware is working correctly
  it('should correctly parse JSON request bodies', async () => {
    const sentData = { testKey: 'testValue' };
    const res = await request(app)
      .post('/echo')
      .send(sentData)
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ receivedData: sentData });
  });

  // Test CORS allows requests from allowed origins. Replace 'deployedApp' with actual front end
  const allowedOrigins = ['http://localhost:3000', 'https://the-reel-canon.netlify.app'];
  it.each(allowedOrigins)('should allow CORS requests from %s', async (origin) => {
    const res = await request(app).get('/').set('Origin', origin);
    expect(res.headers['access-control-allow-origin']).toBe(origin);
  });

  // Test CORS blocks requests from any other origins
  it('should block CORS requests not in allowed origins', async () => {
    const res = await request(app).get('/').set('Origin', 'http://some-random-site.com');
    expect(res.headers['access-control-allow-origin']).toBeFalsy();
  });
});

// Tests to check database-dump route works for dev and test but not prod
describe('Database dump route works for dev & test, not prod', () => {
  // Test in test environment
  it('should return 200 and data object in test environment', async () => {
    const res = await request(app).get('/database-dump');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
  // Simulate development environment
  // it('should return 200 and data object in development environment', async () => {
  //   process.env.NODE_ENV = 'development';
  //   // Reset cache so we can reload with dev database
  //   jest.resetModules();
  //   const { app: devApp, connectToDatabase, databaseURL } = await import('../server');
  //   const { databaseDisconnector } = await import('../config/database');
  //   await connectToDatabase(databaseURL);
  //   const res = await request(devApp).get('/database-dump');
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toHaveProperty('data');
  //   await databaseDisconnector();
  //   process.env.NODE_ENV = 'test';
  // });
  // Simulate production environment
  it('should return 404 in production environment', async () => {
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    const { app: prodApp } = await import('../server');
    const res = await request(prodApp).get('/database-dump');
    expect(res.statusCode).toBe(404);
    process.env.NODE_ENV = 'test';
  });
});

// Test that error handling middleware works as intended
describe('Error handling middleware catches and process expected errors', () => {
  let req;
  let res;
  let next;
  beforeEach(() => {
    // Allows catching and reading of console.error and prevents output in terminal
    req = {};
    // Jest.fn() records calls and arguments for inspecting
    res = {
      // mockReturnThis returns object so we can chain methods like res.status().json()
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  // Test errors are logged to console
  it('should log error to console for any error', async () => {
    const err = new Error('Test error logging');
    Object.assign(err, { name: 'testError', code: 1234, stack: 'Error stack trace' });
    errorHandler(err, req, res, next);
    expect(consoleErrorSpy).toHaveBeenCalledWith('The following error occurred:', {
      name: err.name,
      code: err.code,
      message: err.message,
      stack: err.stack,
    });
  });

  // Test ValidationError handling
  it('should handle ValidationError correctly', async () => {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.errors = { err1: { message: 'Err1' }, err2: { message: 'Err2' } };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Schema validation failed',
      errors: ['Err1', 'Err2'],
    });
  });

  // Test Duplicate Key Error handling
  it('should handle Duplicate Key Error correctly', async () => {
    const err = new Error('Duplicate key error');
    Object.assign(err, { code: 11000, keyPattern: { email: 1, username: 1 } });
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Duplicate key violation',
      errors: ['User with field: email already exists', 'User with field: username already exists'],
    });
  });

  // Test CastError handling
  it('should handle CastError correctly', async () => {
    const err = new Error('Cast to invalid ObjectId failed');
    Object.assign(err, { name: 'CastError', value: 'invalid-id', path: '_id' });
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Cast error: value (invalid-id) is not valid for _id',
      errors: ['Cast to invalid ObjectId failed'],
    });
  });

  // Test JsonWebTokenError handling
  it('should handle JsonWebTokenError correctly', async () => {
    const err = new Error('Invalid token');
    err.name = 'JsonWebTokenError';
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is invalid. Please log in again.',
    });
  });

  // Test TokenExpiredError handling
  it('should handle TokenExpiredError correctly', async () => {
    const err = new Error('Token expired');
    err.name = 'TokenExpiredError';
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Your session has expired. Please log in again to refresh.',
    });
  });

  // Test Custom Error handling for created errors
  it('should handle custom created errors correctly', async () => {
    const err = new Error('Custom error occurred');
    err.statusCode = 418;
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Custom error occurred',
    });
  });

  // Test catch-all for unexpected errors
  it('should handle unexpected errors correctly', async () => {
    const err = new Error('Some random error');
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    });
  });
});
