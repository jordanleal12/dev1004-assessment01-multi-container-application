import { describe, it, expect } from "vitest";
import { render, screen } from "../testUtils";
import Footer from "../../components/Footer";

// Basic test to check test setup is working correctly
describe("Footer", () => {
  it("renders footer text", () => {
    render(<Footer />);
    // screen.getByText searches whole rendered component for the text (case insensitive with i)
    expect(screen.getByText(/about us/i)).toBeInTheDocument();
  });
});
