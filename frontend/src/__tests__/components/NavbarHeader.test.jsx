import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "../testUtils";
import NavbarHeader from "../../components/NavbarHeader";
import * as api from "../../utilities/services/apiServices";
import {
  HOME,
  PROFILE,
  LEADERBOARD,
  REEL_CANON,
  ABOUT,
  REGISTER,
} from "../../utilities/constants/routes";

// Mock useNavigate to track use of navigation in tests for nav links
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage cache to emulate setting, getting and removing JWT tokens
const fakeCache = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
// Override global window.localStorage with fakeCache mock
Object.defineProperty(window, "localStorage", { value: fakeCache });

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  fakeCache.getItem.mockReset();
  fakeCache.setItem.mockReset();
  fakeCache.removeItem.mockReset();
});

// Clear fake localStorage after each test
afterEach(() => {
  vi.clearAllTimers();
  fakeCache.clear();
});

// Test NavbarHeader behaviour when user is logged in
describe("Navbar behaviour for logged in user", () => {
  // Run before each test to simulate loaded NavbarHeader with logged in user
  beforeEach(async () => {
    fakeCache.getItem.mockReturnValue("fake-token");
    vi.mocked(api.getCurrentUser).mockResolvedValue({ id: 1, username: "testuser" });
    render(<NavbarHeader />);
    await waitFor(() => expect(screen.getByText(/Home/)).toBeInTheDocument());
  });
  // Test it renders all expected navigation links when logged in
  it("should render navigation links", () => {
    // Check that the navigation links are rendered in the NavbarHeader by looking for their text
    const navLinks = [/Home/, /My Profile/, /Leaderboard/, /The Reel Canon/, /About/];
    navLinks.forEach((regex) => expect(screen.getByText(regex)).toBeInTheDocument());
  });
  // Test it renders 'Sign Out' button when logged in but not 'Sign In' or 'Register'
  it("should render 'Sign Out' when user is logged in", async () => {
    // Sign out button should be rendered but not sign in or register button
    expect(screen.getByText(/Sign Out/)).toBeInTheDocument();
    expect(screen.queryByText(/Sign In/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Register/)).not.toBeInTheDocument();
  });
  // Test that clicking Sign Out button successfully loads modal
  it("should load modal for signing out when clicking 'Sign Out'", () => {
    // Check logout modal isn't currently shown
    expect(screen.queryByRole("heading", { name: /Log Out/ })).not.toBeInTheDocument();
    // Test button exists and loads modal
    const signOutButton = screen.getByText(/Sign Out/);
    expect(signOutButton).toBeInTheDocument();
    // Simulate clicking button
    fireEvent.click(signOutButton);
    // Check an element with a heading saying 'Log Out' is loaded
    expect(screen.getByRole("heading", { name: /Log Out/ })).toBeInTheDocument();
  });
});

// Test NavbarHeader behaviour when user is logged out
describe("Navbar behaviour for logged out user", () => {
  // Run before each test to simulate loaded NavbarHeader with logged out user
  beforeEach(async () => {
    fakeCache.getItem.mockReturnValue(null);
    render(<NavbarHeader />);
    await waitFor(() => expect(screen.getByText(/Home/)).toBeInTheDocument());
  });

  // Test it renders 'Sign In' and 'Register' buttons when not logged in
  it("should render 'Sign In' and 'Register' when user is not logged in", async () => {
    // Check 'Sign In' and 'Register' are rendered but not 'Sign Out' or 'User Profile'
    expect(screen.getByText(/Sign In/)).toBeInTheDocument();
    expect(screen.getByText(/Register/)).toBeInTheDocument();
    expect(screen.queryByText(/Sign Out/)).not.toBeInTheDocument();
    expect(screen.queryByText(/User Profile/)).not.toBeInTheDocument();
  });
  // Test that clicking Sign In button successfully loads modal
  it("should load modal for signing in when clicking 'Sign In'", async () => {
    // Check Sign In modal hasn't rendered yet
    expect(screen.queryByText(/Welcome Back!/)).not.toBeInTheDocument();
    // Check Sign In modal renders after being clicked
    const signInButton = screen.getByText(/Sign In/);
    fireEvent.click(signInButton);
    expect(screen.getByText(/Welcome Back!/)).toBeInTheDocument();
  });
  // Test that clicking Register button redirects to register page
  it("should redirect to register page when clicking 'Register'", async () => {
    const registerButton = screen.getByText(/Register/);
    fireEvent.click(registerButton);
    expect(mockNavigate).toHaveBeenCalledWith(REGISTER);
  });
});

// Test that all navigation links redirects to correct routes
describe("Navbar navigation links", () => {
  // Render NavbarHeader as logged in user before each test (user profile only shows if logged in)
  beforeEach(async () => {
    fakeCache.getItem.mockReturnValue("fake-token");
    vi.mocked(api.getCurrentUser).mockResolvedValue({ id: 1, username: "testuser" });
    render(<NavbarHeader />);
    await waitFor(() => expect(screen.getByText(/Home/)).toBeInTheDocument());
  });
  // Test each link correctly links to expected route
  it.each([
    ["Home", HOME],
    ["My Profile", PROFILE],
    ["Leaderboard", LEADERBOARD],
    ["The Reel Canon", REEL_CANON],
    ["About", ABOUT],
  ])("should have correct href for %s link", (name, href) => {
    const link = screen.getByRole("link", { name: new RegExp(name, "i") });
    expect(link).toHaveAttribute("href", href);
  });
});
