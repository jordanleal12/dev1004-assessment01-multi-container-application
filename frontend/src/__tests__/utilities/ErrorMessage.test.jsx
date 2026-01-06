import { render, screen, fireEvent } from "../testUtils";
import { describe, it, expect, vi, afterEach } from "vitest";
import ErrorMessage from "../../components/common/ErrorMessage";

afterEach(() => {
  vi.clearAllTimers();
});

// Tests that ErrorMessage component correctly uses and renders error messages passed as props
describe("ErrorMessage component conditionally renders errors passed as props", () => {
  // Test that it doesn't render without an error
  it("should not render when no error provided", () => {
    const error = null;
    // Destructure container from render result
    const { container } = render(<ErrorMessage error={error} />);
    // Matcher that is true if there's no child elements in container
    expect(container).toBeEmptyDOMElement();
  });
  // Test that it works being passed a custom string error message
  it("should render custom string error message", () => {
    render(<ErrorMessage error="Some random error" />);
    // screen.getByText looks for element with matching text content
    expect(screen.getByText("Some random error")).toBeInTheDocument();
  });
  // Test that it can accept and render an error object
  it("should render error message from error object", () => {
    const errorObj = { message: "Some custom message.", status: 404, errors: [] };
    render(<ErrorMessage error={errorObj} />);
    expect(screen.getByText("Some custom message.")).toBeInTheDocument();
  });
  // Test that it renders optional detailed errors array if attached
  it("should render detailed errors array when attached to error", () => {
    const errorObj = {
      message: "Validation failed.",
      status: 400,
      errors: ["Name is required.", "Email is invalid."],
    };
    render(<ErrorMessage error={errorObj} />);
    expect(screen.getByText("Validation failed.")).toBeInTheDocument();
    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is invalid.")).toBeInTheDocument();
  });
  // Test it doesn't render detailed errors if showDetailedErrors is false
  it("should not render detailed errors when showDetailedErrors is false", () => {
    const errorObj = {
      message: "Validation failed.",
      status: 400,
      errors: ["Name is required.", "Email is invalid."],
    };
    render(<ErrorMessage error={errorObj} showDetailedErrors={false} />);
    expect(screen.getByText("Validation failed.")).toBeInTheDocument();
    expect(screen.queryByText("Name is required.")).not.toBeInTheDocument();
    expect(screen.queryByText("Email is invalid.")).not.toBeInTheDocument();
  });
  // Test it renders a retry button that calls onRetry prop when clicked
  it("should render retry button and call onRetry when clicked", () => {
    const mockRetry = vi.fn();
    render(<ErrorMessage error="Network error" onRetry={mockRetry} />);
    const button = screen.getByRole("button", { name: /retry request/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
});
