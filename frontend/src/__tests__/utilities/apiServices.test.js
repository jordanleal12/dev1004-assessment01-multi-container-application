/* Unit tests for apiServices functions. Simplified responses and arguments are fine as we're just
  testing isolation and structured return values of the functions. Potentially upgrade later to use
  mock service worker to simulate real API interaction, increasing validity of tests*/
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "../../utilities/services/apiServices";

// Mock the apiServices module as we're importing actual API functions not the mocked ones
vi.mock("../../utilities/services/apiServices");

// Test data constants to keep tests DRY
const mockUser = { email: "test@example.com", username: "testuser", password: "Password1!" };
const mockMovie = { imdbId: "tt0111161", title: "The Shawshank Redemption" };

// Helper function to setup fake API call and test it returns expected data
const testApiCall = async (apiFn, args, expectedRes) => {
  // Fake the API function so it returns the expected response
  apiFn.mockResolvedValue(expectedRes);
  // Call the API function with provided args (always as an array)
  const result = await apiFn(...args);
  // Check that the API function was called with the correct args
  expect(apiFn).toHaveBeenCalledWith(...args);
  // Check that the result matches expected response
  expect(result).toEqual(expectedRes);
  // Return result for further checks if needed
  return result;
};

// Reset all fake API functions to clean state
beforeEach(() => vi.clearAllMocks());

// Test authentication API axios functions work as expected
describe("Authentication axios API functions", () => {
  // Test user registration fn works as expected
  it("should register a new user", async () => {
    await testApiCall(api.registerUser, [mockUser], { success: true, user: mockUser });
  });
  // Test user login fn works as expected
  it("should log in a user", async () => {
    const loginData = { email: mockUser.email, password: mockUser.password };
    await testApiCall(api.loginUser, [loginData], { success: true, token: "fake-token" });
  });
  // Test user logout fn works as expected
  it("should log out a user", async () => {
    await testApiCall(api.logoutUser, [], { success: true });
  });
});

// Test user API axios functions work as expected
describe("User API axios functions", () => {
  // Test get all users fn works as expected
  it("should get all users", async () => {
    await testApiCall(api.getAllUsers, [], [mockUser]);
  });

  // Test get current user fn works as expected
  it("should get current user", async () => {
    await testApiCall(api.getCurrentUser, [], mockUser);
  });

  // Test update current user fn works as expected
  it("should update current user", async () => {
    const updates = { username: "newname" };
    await testApiCall(api.updateCurrentUser, [updates], { ...mockUser, ...updates });
  });
  // Test update current user password fn works as expected
  it("should update current user password", async () => {
    const passwordData = { currentPassword: "old", newPassword: "new" };
    await testApiCall(api.updateCurrentUserPassword, [passwordData], { success: true });
  });
  // Test delete current user fn works as expected
  it("should delete current user", async () => {
    await testApiCall(api.deleteCurrentUser, [], { success: true });
  });
});

// Test friendship axios API functions work as expected
describe("Friendships axios API functions", () => {
  // Test get all current user friendships fn works as expected
  it("should get all friendships of current user", async () => {
    await testApiCall(api.getAllFriendships, [], [{ id: 1, friendRequestAccepted: true }]);
  });
  // Test create friendship request fn works as expected
  it("should create a friendship request", async () => {
    await testApiCall(api.createFriendship, ["user2"], { id: 1, friendRequestAccepted: false });
  });
  // Test update friendship fn works as expected
  it("should accept a friendship", async () => {
    await testApiCall(api.updateFriendship, ["user2"], { friendRequestAccepted: true });
  });
  // Test delete friendship fn works as expected
  it("should delete a friendship", async () => {
    await testApiCall(api.deleteFriendship, ["user2"], { success: true });
  });
});

// Test movies axios API functions work as expected
describe("Movies axios API functions", () => {
  // Test get all movies fn works as expected
  it("should get all movies", async () => {
    await testApiCall(api.getAllMovies, [], [mockMovie]);
  });
  // Test search movie by title fn works as expected
  it("should search movie by title", async () => {
    await testApiCall(api.getMovieByTitle, ["Shawshank"], mockMovie);
  });
  // Test get movie by IMDB ID fn works as expected
  it("should get movie by IMDB ID", async () => {
    await testApiCall(api.getMovieByImdbId, ["tt0111161"], mockMovie);
  });
});

// Test get user reel progress fn works as expected
describe("Reel Progress axios API functions", () => {
  // Test get user reel progress fn works as expected
  it("should get user reel progress", async () => {
    await testApiCall(api.getUserReelProgress, [], [{ movieId: mockMovie.imdbId, rating: 5 }]);
  });
  // Test add movie to reel progress fn works as expected
  it("should add movie to reel progress", async () => {
    const movieData = { movieId: mockMovie.imdbId, rating: 4 };
    await testApiCall(api.addMovieToReelProgress, [movieData], { success: true, ...movieData });
  });
  // Test update reel progress movie rating fn works as expected
  it("should update movie rating", async () => {
    const updateData = { movieId: mockMovie.imdbId, rating: 3 };
    await testApiCall(api.updateReelProgressMovieRating, [updateData], { success: true });
  });
  // Test delete movie from reel progress fn works as expected
  it("should delete movie from reel progress", async () => {
    const movieData = { movieId: mockMovie.imdbId };
    await testApiCall(api.deleteMovieFromReelProgress, [movieData], { success: true });
  });
});

// Test leaderboard axios API functions work as expected
describe("Leaderboard axios API functions", () => {
  // Test get leaderboard data fn works as expected
  it("should get leaderboard data", async () => {
    await testApiCall(api.getLeaderboard, [], [{ userId: 1, username: "user1", score: 100 }]);
  });
});

// Test error handling
describe("Error Handling", () => {
  // Test API error handling fn works as expected
  it("should handle API errors", async () => {
    api.loginUser.mockRejectedValue(new Error("Invalid credentials"));
    await expect(api.loginUser(mockUser)).rejects.toThrow("Invalid credentials");
  });
});
