import { describe, it, expect } from "vitest";
import { handleApiError, statusMap } from "../../utilities/helpers/errorHandler";

// Tests that handleApiError function is correctly handling axios API errors
describe("handleApiError utility function wraps axios errors correctly", () => {
  // Test it uses message from response data if available
  it("should return custom message from response data if available", () => {
    const fakeErr = {
      response: { status: 404, data: { message: "Some custom message." } },
    };
    const wrappedErr = handleApiError(fakeErr);
    expect(wrappedErr).toEqual({ message: "Some custom message.", status: 404, errors: [] });
  });
  // Test it uses statusMap message if no message in response data
  describe("statusMap", () => {
    it.each([
      [400, statusMap[400]],
      [401, statusMap[401]],
      [403, statusMap[403]],
      [404, statusMap[404]],
      [409, statusMap[409]],
      [500, statusMap[500]],
      [502, statusMap[502]],
      [503, statusMap[503]],
    ])("should return message for %i status if no response message", (status, expectedMessage) => {
      expect(statusMap[status]).toBe(expectedMessage);
    });
  });
  // Test if server connection error (request made but no response) gives correct message
  it("should return connection error with request but no response", () => {
    const wrappedErr = handleApiError({ request: {} });
    expect(wrappedErr.message).toBe("Unable to connect to server. Check connection and try again");
  });
  // Test if timeout error gives correct message (axios sets code to ECONNABORTED)
  it("should return timeout error on timeout", () => {
    const wrappedErr = handleApiError({ code: "ECONNABORTED" });
    expect(wrappedErr.message).toBe("Request has timed out. Please try again.");
  });
  // Test if unknown error gives correct generic message
  it("should return generic message on unknown error", () => {
    const wrappedErr = handleApiError({});
    expect(wrappedErr.message).toBe("An unexpected error occurred. Please try again.");
  });
  // Test that errors with arrays attached have them included in the wrapped error
  it("should include errors array if it exists in response data", () => {
    const wrappedErr = handleApiError({
      response: {
        status: 400,
        data: { message: "Validation failed.", errors: ["Name is required.", "Email is invalid."] },
      },
    });
    expect(wrappedErr).toEqual({
      message: "Validation failed.",
      status: 400,
      errors: ["Name is required.", "Email is invalid."],
    });
  });
});
