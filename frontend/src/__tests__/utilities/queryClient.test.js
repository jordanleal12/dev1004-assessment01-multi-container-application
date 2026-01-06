import { QueryClient } from "@tanstack/react-query";
import { queryClient } from "../../utilities/constants/queryClient";
import { describe, it, expect, vi } from "vitest";

describe("queryClient instance", () => {
  // Test that queryClient is a custom instance of QueryClient class
  it("should be an instance of QueryClient class", () => {
    expect(queryClient).toBeInstanceOf(QueryClient);
  });
});

// Test that custom retry logic for queries and mutations works as expected
describe("queryClient retry logic", () => {
  const retryQuery = queryClient.getDefaultOptions().queries.retry;
  const retryMutation = queryClient.getDefaultOptions().mutations.retry;
  // Test 4xx query errors do not retry
  it.each([[400], [401], [403], [404], [409]])("should not retry %i query errors", (code) => {
    // retry function in queryClient takes failureCount and error object
    expect(retryQuery(0, { status: code })).toBe(false);
  });
  // Test 5xx query errors retry up to 2 times
  it.each([[500], [502], [503]])("should retry %i query errors up to 2 times", (code) => {
    expect(retryQuery(0, { status: code })).toBe(true);
    expect(retryQuery(1, { status: code })).toBe(false);
  });
  // Test mutation with null status retries once
  it("should retry mutation with null status once", () => {
    expect(retryMutation(0, { status: null })).toBe(true);
    expect(retryMutation(1, { status: null })).toBe(false);
  });
  // Test mutation timeout errors retry once
  it("should retry mutation timeout errors once", () => {
    expect(retryMutation(0, { message: "Request has timed out." })).toBe(true);
    expect(retryMutation(1, { message: "Request has timed out." })).toBe(false);
  });
  // Test other mutation errors do not retry
  it("should not retry other mutation errors", () => {
    expect(retryMutation(0, { status: 400 })).toBe(false);
    expect(retryMutation(0, { status: 500 })).toBe(false);
  });
});

// Test that onError handler console errors
describe("queryClient onError handling", () => {
  // Test that query error handler logs expected error
  it("should log formatted query error to console", () => {
    vi.spyOn(console, "error").mockImplementation(() => {}); // Mock console.error
    const { onError } = queryClient.getDefaultOptions().queries;
    const fakeError = { response: { status: 500, data: { message: "Server error" } } };
    onError(fakeError);
    expect(console.error).toHaveBeenCalledWith(
      "API Query Error:",
      expect.objectContaining({ message: "Server error", status: 500 })
    );
    vi.restoreAllMocks(); // Restore console.error
  });
  // Test that mutation error handler logs expected error
  it("should log formatted mutation error to console", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { onError } = queryClient.getDefaultOptions().mutations;
    const fakeError = { response: { status: null, data: { message: "Network error" } } };
    onError(fakeError);
    expect(console.error).toHaveBeenCalledWith(
      "API Mutation Error:",
      expect.objectContaining({ message: "Network error", status: null })
    );
    vi.restoreAllMocks();
  });
});
