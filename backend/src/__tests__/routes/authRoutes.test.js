import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { app } from '../../server';
import User from '../../models/User';
import { userFixture } from '../setup/fixtures';
import { clearTestDb, setupTestDb, teardownTestDb } from '../setup/testDb';

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

describe('POST /auth/register', () => {
  it('should register a new user with valid user data', async () => {
    const userData = userFixture();
    const response = await request(app).post('/auth/register').send(userData).expect(201);

    expect(response.body).toMatchObject({
      success: true,
      message: 'User registration complete',
      token: expect.any(String),
      // isAdmin should not be included by default
      user: {
        username: userData.username,
        email: userData.email,
      },
    });
    expect(response.body.user.isAdmin).toBeUndefined();
  });

  it('should register user as admin when isAdmin is true', async () => {
    const adminData = userFixture({ isAdmin: true });

    const response = await request(app).post('/auth/register').send(adminData).expect(201);

    expect(response.body.user.isAdmin).toBe(true);
  });

  it('should reject duplicate email with ambiguous message', async () => {
    const existingUser = await User.create(userFixture());
    const newUser = userFixture({
      username: 'differentusername',
      email: existingUser.email,
    });

    const response = await request(app).post('/auth/register').send(newUser).expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch('Email or username already exists');
  });

  it('should reject duplicate username with ambiguous message', async () => {
    const existingUser = await User.create(userFixture());
    const newUser = userFixture({
      username: existingUser.username,
      email: 'differenteemail@emal.com',
    });

    const response = await request(app).post('/auth/register').send(newUser).expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch('Email or username already exists');
  });
});

describe('POST /auth/login', () => {
  it('should successfully login with correct credentials', async () => {
    const userData = userFixture();
    await User.create(userData);

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      message: 'Login successful!',
      token: expect.any(String),
      user: {
        username: userData.username,
        email: userData.email,
      },
    });
  });

  it('should reject invalid password with ambiguous error', async () => {
    const userData = userFixture();
    await User.create(userData);

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: userData.email,
        password: 'wrongpassword',
      })
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Authentication failed: Incorrect email or password',
    });
  });

  it('should reject non-existent email with ambiguous error', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'anypassword',
      })
      .expect(401);

    expect(response.body.message).toContain('Incorrect email or password');
  });

  it('should reject login with missing email', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ password: 'Password123!' })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Email and password are required',
    });
  });

  it('should reject login with missing password', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'email@example.com' })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Email and password are required',
    });
  });

  it('should reject login with both required fields missing', async () => {
    const response = await request(app).post('/auth/login').send({}).expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Email and password are required',
    });
  });
});

describe('POST /auth/logout', () => {
  it('should return success response', async () => {
    const response = await request(app).post('/auth/logout').expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'Log out successful',
    });
  });
});
