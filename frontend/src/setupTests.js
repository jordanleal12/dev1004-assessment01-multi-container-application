import "@testing-library/jest-dom"; // Lets us use custom matchers from jest-dom
import { vi } from "vitest";

// Suppress console.error and console.warn to reduce stderr output in tests
beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});
