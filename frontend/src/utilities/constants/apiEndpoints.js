// AUTH ENDPOINTS
export const REGISTER = "/auth/register";
export const LOGIN = "/auth/login";
export const LOGOUT = "/auth/logout";

// USER ENDPOINTS
export const ALL_USERS = "/users";
export const CURRENT_USER = "/users/my-profile";
export const UPDATE_PASSWORD = "/users/my-profile/update-password";

// FRIENDSHIP ENDPOINTS
export const USER_FRIENDSHIPS = "/friendships/my-friends";
export const FRIENDSHIPS = "/friendships";
// Encode userId to safely include in URL
export const ADD_FRIENDSHIP = (userId) => `${FRIENDSHIPS}/${encodeURIComponent(userId)}`;
// Encode requesterUserId to safely include in URL
export const UPDATE_USER_FRIENDSHIP = (requesterUserId) =>
  `${USER_FRIENDSHIPS}/${encodeURIComponent(requesterUserId)}`;

// MOVIES ENDPOINTS
export const REEL_CANON = "/movies/reel-canon";
export const MOVIE_SEARCH = "/movies/search";
export const MOVIES = "/movies";
// Encode imdbId to safely include in URL
export const MOVIE_BY_IMDB_ID = (imdbId) => `${MOVIES}/${encodeURIComponent(imdbId)}`;

// REEL-PROGRESS ENDPOINTS
export const REEL_PROGRESS = "/reel-progress";
// Encode movieId to safely include in URL
export const REEL_PROGRESS_BY_MOVIE = (movieId) =>
  `${REEL_PROGRESS}/${encodeURIComponent(movieId)}`;

// LEADERBOARD ENDPOINT
export const LEADERBOARD = "/leaderboard";

// ------------------------------------------------------------------------------------------------
// Export all as object for convenience
const API_ENDPOINTS = {
  // Auth
  REGISTER,
  LOGIN,
  LOGOUT,
  // User
  ALL_USERS,
  CURRENT_USER,
  UPDATE_PASSWORD,
  // Friendship
  USER_FRIENDSHIPS,
  FRIENDSHIPS,
  ADD_FRIENDSHIP,
  UPDATE_USER_FRIENDSHIP,
  // Movies
  REEL_CANON,
  MOVIE_SEARCH,
  MOVIES,
  MOVIE_BY_IMDB_ID,
  // Reel-progress
  REEL_PROGRESS,
  REEL_PROGRESS_BY_MOVIE,
  // Leaderboard
  LEADERBOARD,
};

export default API_ENDPOINTS;
