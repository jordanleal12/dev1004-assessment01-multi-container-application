import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsers,
  getCurrentUser,
  updateCurrentUser,
  updateCurrentUserPassword,
  deleteCurrentUser,
} from "../services/apiServices";

// Create tanstack query custom hook to get all users
// useQuery calls your function (getAllUsers), returns { data, isLoading, error etc. }
export const useAllUsers = () =>
  useQuery({
    queryKey: ["all-users"],
    queryFn: getAllUsers,
  });

// Create tanstack custom hook to get current logged-in user document
export const useCurrentUser = () =>
  useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });

// Hooks for editing user data require useMutations not useQuery

// Create tanstack mutation custom hook to update current logged in user
export const useUpdateCurrentUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCurrentUser,
    // Invalidate and refetch current user after updating current user
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
};

// Create tanstack mutation custom hook to change current logged in user password
export const useUpdateCurrentUserPassword = () =>
  useMutation({
    mutationFn: updateCurrentUserPassword,
    // No need to invalidate and refetch user as password not in user data cache
  });

// Create tanstack mutation custom hook to delete current logged in user
export const useDeleteCurrentUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCurrentUser,
    onSuccess: () => {
      queryClient.clear(); // Clear all cache on user deletion
    },
  });
};
