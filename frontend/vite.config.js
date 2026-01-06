import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  test: {
    globals: true, // Lets us use globals like "describe", "test" and "it"
    environment: "jsdom", // Lets us test DOM manipulation by simulating browser environment
    setupFiles: "./src/setupTests.js", // Global test setup
    testTimeout: 20000, // Increase test timeout to 20 seconds
    hookTimeout: 20000, // Increase hook timeout to 20 seconds
    // In CI (Docker), run tests sequentially to avoid resource contention
    // eslint-disable-next-line no-undef
    fileParallelism: process.env.CI !== "true",
  },
});
