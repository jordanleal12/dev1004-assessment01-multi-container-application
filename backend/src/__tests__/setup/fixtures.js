import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import request from 'supertest';

const { username, email } = faker.internet;

/* Takes optional 'overrides' object to replace any default values, defaults to empty object if not
provided. Spread operator replaces any default values if key matches, else adds new key/value pairs. */
export const userFixture = (overrides = {}) => ({
  username: username(),
  email: email().toLowerCase(),
  password: 'ExampleStrongPassword1!',
  isAdmin: false,
  ...overrides,
});
// Helper function for user fixture to generate an auth token from login route
export const getAuthToken = async (app, userData) => {
  const { token } = (
    await request(app)
      .post('/auth/login')
      .send({ email: userData.email, password: userData.password })
  ).body;
  return token;
};

// Since most movie data is not covered by default faker functions, I have used random
// and lorem methods, so I can test routes which get multiples.
export const movieFixture = (overrides = {}) => ({
  title: faker.lorem.words(3),
  year: faker.number.int({ min: 1920, max: 2023 }).toString(),
  director: faker.person.fullName(),
  genre: [faker.word.adjective(), faker.word.adjective()],
  plot: faker.lorem.sentences(1).substring(0, 200),
  actors: Array.from({ length: 3 }, () => faker.person.fullName()),
  imdbId: `tt${faker.number.int({ min: 1000000, max: 9999999 })}`,
  poster: faker.image.url(),
  isReelCanon: true,
  ...overrides,
});

const user1 = userFixture();
export const friendshipFixture = (overrides = {}) => ({
  user1: user1.id,
  user2: userFixture().id,
  requesterUserId: user1.id,
  ...overrides,
});

// Helper function to generate movie reelProgress data
export const reelProgressFixture = (count = 1, overrides = {}) => {
  return Array.from({ length: count }, () => ({
    movie: new mongoose.Types.ObjectId(),
    rating: faker.number.int({ min: 1, max: 5 }),
    isWatched: true,
    ...overrides,
  }));
};

// Alternative version if you want more control over each user's reelProgress count
export const usersWithReelProgressFixture = (
  userReelProgressCount = [
    { reelProgressCount: 5 },
    { reelProgressCount: 3 },
    { reelProgressCount: 8 },
  ],
) => {
  return userReelProgressCount.map((config) => {
    const reelProgress = reelProgressFixture(config.reelProgressCount);
    return userFixture({ reelProgress });
  });
};
