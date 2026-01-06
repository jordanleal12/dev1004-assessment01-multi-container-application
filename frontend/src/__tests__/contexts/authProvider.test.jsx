/* Unit tests for AuthProvider context and useAuthContext hook. Tests auth state management,
  localStorage token handling, and the login/logout/updateUser functions */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act, GlobalProviders } from "../testUtils";
import { useAuthContext } from "../../contexts/useAuthContext";
import * as api from "../../utilities/services/apiServices";

// Mock localStorage cache to emulate setting, getting and removing JWT tokens
const fakeCache = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
// Override global window.localStorage with fakeCache mock
Object.defineProperty(window, "localStorage", { value: fakeCache });

// Test data constants to keep tests DRY
const user = { id: 1, username: "testuser", email: "test@example.com" };
const token = "fake-jwt-token-12345";
// Helper function to render useAuthContext hook using GlobalProviders as wrapper to give context
const renderAuthHook = () => renderHook(() => useAuthContext(), { wrapper: GlobalProviders });

// Reset all mocks before each test to ensure clean state
beforeEach(() => vi.clearAllMocks());

// Clear fake localStorage cache after each test
afterEach(() => {
  fakeCache.clear();
  vi.clearAllTimers();
});

// Test that useAuthContext hook works correctly and enforces provider usage
describe("useAuthContext hook", () => {
  // Test that using useAuthContext throws error when used outside AuthProvider
  it("should throw error when used outside AuthProvider", () => {
    expect(() => renderHook(useAuthContext)).toThrow(
      "useAuthContext must be used within an AuthProvider"
    );
  });

  // Test that it returns auth context when used inside AuthProvider
  it("should return auth context when used inside AuthProvider", async () => {
    // No token as we're just testing context properties here
    fakeCache.getItem.mockReturnValue(null);
    // Wrapper function that wraps hook with AuthProvider (not using GlobalProviders to isolate)
    const { result } = renderAuthHook();
    // Wait for loading to finish before checking context values or it will be in loading state
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // Extract keys from context object and check they match expected keys
    const contextKeys = Object.keys(result.current);
    expect(contextKeys).toEqual([
      "user",
      "isAuthenticated",
      "isLoading",
      "login",
      "logout",
      "updateUser",
    ]);
  });
});

// Test app mount runs initial AuthProvider auth check correctly
describe("AuthProvider checks auth on mount", () => {
  // Test that user is set to null when no JWT in storage
  it("should set user to null when no token in localStorage", async () => {
    fakeCache.getItem.mockReturnValue(null);
    const { result } = renderAuthHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // User should be set to null and isAuthenticated should be false
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    // Api should only have been called if token existed
    expect(api.getCurrentUser).not.toHaveBeenCalled();
  });

  // Test that user is authenticated and user data set with valid JWT
  it("should authenticate and set user with valid token", async () => {
    // Add fake token to localStorage mock
    fakeCache.getItem.mockReturnValue(token);
    // Should call getCurrentUser with valid token and return user data so we fake API call and res
    vi.mocked(api.getCurrentUser).mockResolvedValue(user);
    const { result } = renderAuthHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // Check that getCurrentUser was called to validate token
    expect(api.getCurrentUser).toHaveBeenCalledTimes(1);
    // User should be set and authenticated
    expect(result.current.user).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
  });

  // Test that invalid/expired token is deleted and user set to null
  it("should clear token and set user to null with invalid token", async () => {
    fakeCache.getItem.mockReturnValue(token);
    // Token validation is done in backend, so fake API call to throw error for invalid token
    vi.mocked(api.getCurrentUser).mockRejectedValue(new Error("Token expired"));
    const { result } = renderAuthHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // User should be removed and isAuthenticated set to false
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    // Invalid token should have been removed from localStorage
    expect(fakeCache.removeItem).toHaveBeenCalledWith("authToken");
  });
});

// Test AuthProvider built in login function
describe("AuthProvider login function", () => {
  // Test that login saves JWT and assigns user data to state
  it("should save token to localStorage and set global user state when login is called", async () => {
    // Start with no token so we can test logging in
    fakeCache.getItem.mockReturnValue(null);
    const { result } = renderAuthHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // Call login function (act checks that all state updates are finished before moving on)
    act(() => result.current.login(user, token));
    // Check that token was saved to localStorage
    expect(fakeCache.setItem).toHaveBeenCalledWith("authToken", token);
    // Check that user state was updated
    expect(result.current.user).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
  });
});

// Test AuthProvider's built in logout function
describe("AuthProvider logout function", () => {
  // Test that logout clears token and user state
  it("should clear token from localStorage and delete global user state on logout", async () => {
    // Start with a logged in user to test logging out
    fakeCache.getItem.mockReturnValue(token);
    vi.mocked(api.getCurrentUser).mockResolvedValue(user);
    vi.mocked(api.logoutUser).mockResolvedValue({ success: true });
    const { result } = renderAuthHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);

    // Call logout function
    await act(async () => await result.current.logout());
    // Check that logoutUser API was called
    expect(api.logoutUser).toHaveBeenCalledTimes(1);
    // Check that user state was cleared
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    // Check that token was removed from localStorage
    expect(fakeCache.removeItem).toHaveBeenCalledWith("authToken");
  });
});

// Test AuthProvider's built in updateUser function
describe("AuthProvider updateUser function", () => {
  // Test that updateUser updates users global state correctly
  it("should update user global state with new user data", async () => {
    // Start with logged in user to test updating user data
    fakeCache.getItem.mockReturnValue(token);
    vi.mocked(api.getCurrentUser).mockResolvedValue(user);
    const { result } = renderAuthHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const updatedUser = { ...user, username: "updatedusername" };
    // Call updateUser function
    act(() => result.current.updateUser(updatedUser));
    // Check that user state was updated with new data
    expect(result.current.user).toEqual(updatedUser);
    expect(result.current.user.username).toBe("updatedusername");
  });
});
