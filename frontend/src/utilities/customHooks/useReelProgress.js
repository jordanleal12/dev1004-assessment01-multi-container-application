import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserReelProgress,
  addMovieToReelProgress,
  updateReelProgressMovieRating,
  deleteMovieFromReelProgress,
} from "../services/apiServices";
import toast from "react-hot-toast";

// Create tanstack QUERY custom hook to GET user reel progress
export const useUserReelProgress = (options = {}) =>
  useQuery({
    queryKey: ["user-reel-progress"],
    queryFn: getUserReelProgress,
    ...options,
  });

// Create tanstack MUTATION custom hook to ADD new movie to user reel progress
export const useAddMovieToReelProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMovieToReelProgress,
    // Invalidate and refetch all reel progress and current user after creating a new entry
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reel-progress"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("Movie marked as watched!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Create tanstack MUTATION custom hook to UPDATE rating of movie in reel progress of logged in user
export const useUpdateReelProgressMovieRating = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReelProgressMovieRating,
    // Invalidate and refetch all reel progress and current user after updating an entry
    onSuccess: ({ newRating }) => {
      queryClient.invalidateQueries({ queryKey: ["user-reel-progress"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success(`Rating updated to ${newRating}!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Create tanstack MUTATION custom hook to DELETE movie from reel progress for logged in user
export const useDeleteMovieFromReelProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMovieFromReelProgress,
    // Invalidate and refetch all reel progress and current user after deleting an entry
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reel-progress"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("Movie removed from your Reel Progress!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
