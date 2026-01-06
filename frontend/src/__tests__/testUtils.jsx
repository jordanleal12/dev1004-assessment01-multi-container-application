/* eslint-disable react-refresh/only-export-components */

/* Test utility file that sets up custom render function with global providers and creates mock
vitest object that replaces real api calls from apiServices with vitest spies*/
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "../contexts/AuthProvider";
import { vi } from "vitest";

/* Vitest mock object that replaces real API calls from apiServices with vitest spies, running
 automatically when tests import from this file. Replaces the functions listed in the object, taking
 the path of the module as its first argument, then an arrow function that returns object of mocks. */
vi.mock("../utilities/services/apiServices", () => ({
  // vi.fn() creates fake spy function that tracks requests and can fake responses
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  getAllUsers: vi.fn(),
  getCurrentUser: vi.fn(),
  updateCurrentUser: vi.fn(),
  updateCurrentUserPassword: vi.fn(),
  deleteCurrentUser: vi.fn(),
  getAllFriendships: vi.fn(),
  createFriendship: vi.fn(),
  updateFriendship: vi.fn(),
  deleteFriendship: vi.fn(),
  getAllMovies: vi.fn(),
  getMovieByTitle: vi.fn(),
  getMovieByImdbId: vi.fn(),
  getUserReelProgress: vi.fn(),
  addMovieToReelProgress: vi.fn(),
  updateReelProgressMovieRating: vi.fn(),
  deleteMovieFromReelProgress: vi.fn(),
  getLeaderboard: vi.fn(),
}));

// Function to create new query client for each test with retry and refetching behaviour disabled
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        refetchInterval: false,
        refetchIntervalInBackground: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Wraps all children components (the ones being tested) with all providers/context we use in main
export function GlobalProviders({ children }) {
  const testQueryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={testQueryClient}>
      <AuthProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

/* Custom helper function to setup render options so we don't have to repeat each time. Accepts
 a test component to render, and an optional 'options' object. Render takes jsx as an argument
 and renders it as output for testing*/
function customRender(component, options) {
  // Render attaches component to be rendered to document.body (wrapped in GlobalProviders)
  return render(component, { wrapper: GlobalProviders, ...options });
}

// Lets us import custom render and other testing library functions from this file
export * from "@testing-library/react";
export { customRender as render };
