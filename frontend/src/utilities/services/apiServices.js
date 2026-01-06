import axios from "axios";
import { handleApiError } from "../helpers/errorHandler";
import API from "../constants/apiEndpoints";

// Create a custom axios instance with custom configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Will set url depending on run command
  timeout: 5000, // 5 seconds timeout for requests to prevent hanging
  headers: { "Content-Type": "application/json" }, // Defaults headers to JSON format
});

/*
{ This is the full axios response object
  data: { ... }, <- The actual backend response data from our API
  status: 201,
  statusText: 'Created',
  headers: { ... },
  config: { ... },
  request: { ... }
}
*/

// Reusable wrapper so we don't have to repeat try-catch in every api call
const callApi = async (fn, errMsg) => {
  try {
    const res = await fn();
    return res.data;
  } catch (err) {
    console.error(`${errMsg}: ${err}`);
    throw handleApiError(err);
  }
};

// ------------------------------------------------------------------------------------------------
// INTERCEPTORS
// Setup interceptors (like middleware) for requests and responses to handle auth token automatically
// Request interceptor adds JWT token from localStorage to header if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for removing JWT token on logout
api.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes("/auth/logout")) {
      localStorage.removeItem("authToken");
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
    }
    return Promise.reject(error);
  }
);

// ------------------------------------------------------------------------------------------------
// AUTH ROUTES

// Register a new user
export const registerUser = async (userBodyData) =>
  callApi(() => api.post(API.REGISTER, userBodyData), "Error registering user");

// Login an existing user
export const loginUser = async (userBodyData) =>
  callApi(() => api.post(API.LOGIN, userBodyData), "Error logging in user");

// Logout current user
export const logoutUser = async () => callApi(() => api.post(API.LOGOUT), "Error logging out user");

// ------------------------------------------------------------------------------------------------
// USER ROUTES

// Get all users
export const getAllUsers = async () =>
  callApi(() => api.get(API.ALL_USERS), "Error fetching users");

// Get current logged-in user details
export const getCurrentUser = async () =>
  callApi(() => api.get(API.CURRENT_USER), "Error fetching current user");

// Update current logged-in user details
export const updateCurrentUser = async (updateBodyData) =>
  callApi(() => api.put(API.CURRENT_USER, updateBodyData), "Error updating current user");

// Update current logged-in user password
export const updateCurrentUserPassword = async (passwordBodyData) =>
  callApi(
    () => api.put(API.UPDATE_PASSWORD, passwordBodyData),
    "Error updating current user password"
  );

// Delete current logged-in user
export const deleteCurrentUser = async () =>
  callApi(() => api.delete(API.CURRENT_USER), "Error deleting current user");

// ------------------------------------------------------------------------------------------------
// FRIENDSHIP ROUTES

// Get all friendship documents for logged-in user
export const getAllFriendships = async () =>
  callApi(() => api.get(API.USER_FRIENDSHIPS), "Error fetching friendships");

// Create new pending friendship document (send friend request)
export const createFriendship = async (recipientUserId) =>
  callApi(() => api.post(API.ADD_FRIENDSHIP(recipientUserId)), "Error creating friendship");

// Update existing pending friendship document (accept friend request)
export const updateFriendship = async (requesterUserId) =>
  callApi(() => api.put(API.UPDATE_USER_FRIENDSHIP(requesterUserId)), "Error updating friendship");

// Delete existing friendship document (unfriend or reject friend request)
export const deleteFriendship = async (otherUserId) =>
  callApi(() => api.delete(API.UPDATE_USER_FRIENDSHIP(otherUserId)), "Error deleting friendship");

// ------------------------------------------------------------------------------------------------
// MOVIES ROUTES

// Get all reel-canon movies
export const getAllMovies = async () =>
  callApi(() => api.get(API.REEL_CANON), "Error fetching movies");

// Get a single movie by title query
export const getMovieByTitle = async (title) =>
  callApi(() => api.get(API.MOVIE_SEARCH, { params: { title } }), "Error fetching movie by title");

// Get a single movie by IMDB ID
export const getMovieByImdbId = async (imdbId) =>
  callApi(() => api.get(API.MOVIE_BY_IMDB_ID(imdbId)), "Error fetching movie by IMDB ID");

// ------------------------------------------------------------------------------------------------
// REEL-PROGRESS ROUTES

// Get reel-progress array for logged in user
export const getUserReelProgress = async () => {
  try {
    const res = await api.get("/reel-progress");
    return res.data;
  } catch (err) {
    // If 404, return empty array (no reel progress exists yet)
    if (err.response?.status === 404) {
      return { reelProgress: [] };
    }
    console.error(`Error fetching user reel-progress: ${err}`);
    throw handleApiError(err);
  }
};

// Update reel-progress by adding a new movie to reel-progress array
export const addMovieToReelProgress = async (movieBodyData) =>
  callApi(
    () => api.post(API.REEL_PROGRESS, movieBodyData),
    "Error adding movie to user reel-progress"
  );

// Update rating of movie in reel-progress array for logged in user
export const updateReelProgressMovieRating = async ({ movieId, rating }) =>
  callApi(
    () => api.patch(API.REEL_PROGRESS_BY_MOVIE(movieId), { rating }),
    "Error updating movie rating in user reel-progress"
  );

// Delete movie from reel-progress array for logged in user
export const deleteMovieFromReelProgress = async ({ movieId }) =>
  callApi(
    () => api.delete(API.REEL_PROGRESS_BY_MOVIE(movieId)),
    "Error deleting movie from user reel-progress"
  );

// ------------------------------------------------------------------------------------------------
// LEADERBOARD ROUTE

// Get leaderboard data for all users
export const getLeaderboard = async () =>
  callApi(() => api.get(API.LEADERBOARD), "Error fetching leaderboard data");
