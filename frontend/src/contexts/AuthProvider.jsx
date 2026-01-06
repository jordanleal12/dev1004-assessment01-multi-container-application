import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logoutUser } from "../utilities/services/apiServices";
import { AuthContext } from "./useAuthContext"; // Have to import as jsx file exports component only
import LoadingSpinner from "../components/common/LoadingScreenOverlay";

// 'children' is special jsx prop representing every nested component inside AuthProvider
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user; // Convert user to boolean, equivalent to Boolean(user)
  /* useQueryClient hook accesses the QueryClient instance (tanstack's cache manager), allowing us
  to invalidate cached queries forcing refetch after login/logout, and/or clear cached data */
  const queryClient = useQueryClient();

  useEffect(() => {
    /* Runs when AuthProvider mounts (when app first loads) and if JWT token is still saved and
    valid, saves user data back to user state, so user doesn't have to login when re-opening app */
    const authCheck = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setIsLoading(false); // No token means no auth check needed
        return;
      }
      try {
        const userData = await getCurrentUser();
        setUser(userData?.user || userData); // Set user data if token is valid
      } catch (error) {
        // If token invalid/expired backend will return 401 (causing frontend to throw error)
        console.error(`Error occurred during authentication: ${error}`);
        localStorage.removeItem("authToken"); // Remove invalid/expired token so user can re-login
        setUser(null); // Clear any cached user state
      } finally {
        setIsLoading(false); // Runs no matter what to indicate auth check is finished
      }
    };

    authCheck();
  }, []); // Empty dependency array means useEffect only runs on mount (app load)

  // Login function that can be used by components to log user in and set user state + token
  const login = (userData, token) => {
    localStorage.setItem("authToken", token);
    setUser(userData?.user || userData);
  };

  // Logout function that can be used by components to log user out and clear user state + token
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error(`Error occurred during logout: ${error}`);
    } finally {
      setUser(null);
      localStorage.removeItem("authToken");
      queryClient.clear(); // Clear all cached data on logout for security
    }
  };

  // Update user function that can be used by components to update user state
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  // Auth data and functions that can be accessed by all components wrapped in AuthProvider
  const value = {
    user, // Current user data (if logged in else null)
    isAuthenticated, // Boolean value that's true if logged in else false
    isLoading, // Boolean value that's true while auth check is in progress
    login, // Function to use in components to log user in: login(userData, token)
    logout, // Function to use in components to log user out: logout()
    updateUser, // Function to use in components to update user data: updateUser(updatedUserData)
  };

  // While auth check is happening, render this. Render app after it finishes.
  if (isLoading) return <LoadingSpinner />;

  // Provide auth data and functions to all nested components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
