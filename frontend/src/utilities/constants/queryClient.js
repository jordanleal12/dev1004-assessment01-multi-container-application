import { QueryClient } from "@tanstack/react-query";
import { handleApiError } from "../helpers/errorHandler";

// Configure global Tanstack Query settings for API calls used in custom hooks
export const queryClient = new QueryClient({
  defaultOptions: {
    // Globally applied to all queries (GET requests) by default
    queries: {
      retry: (failureCount, err) => {
        // 400-500 errors are client mistakes (like bad input) so don't retry
        if (err?.status >= 400 && err?.status < 500) return false;
        // Retry once for network errors (faster feedback when backend is down)
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000, // Automatic refreshes won't trigger for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus (like tab switch)
      // Global query error handling (currently just formats then console errors)
      onError: (err) => {
        console.error("API Query Error:", handleApiError(err));
      },
    },
    // Globally applied to all mutations (POST/PUT/DELETE requests) by default
    mutations: {
      retry: (failureCount, err) => {
        // Errors with null should be network errors so retry once
        if (err?.status === null) return failureCount < 1;
        // Timeout message, retry once
        if (err?.message?.includes("timed out")) return failureCount < 1;
        // Don't retry any other errors (strict for mutations)
        return false;
      },
      // Global mutation error handling
      onError: (err) => {
        console.error("API Mutation Error:", handleApiError(err));
      },
    },
  },
});
