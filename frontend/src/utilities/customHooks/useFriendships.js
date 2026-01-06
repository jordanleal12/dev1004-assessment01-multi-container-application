import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../constants/queryClient";
import {
  getAllFriendships,
  createFriendship,
  updateFriendship,
  deleteFriendship,
} from "../services/apiServices";

// Create tanstack QUERY custom hook to GET ALL existing friendships
export const useAllFriendships = (options = {}) =>
  useQuery({
    queryKey: ["all-friendships"],
    queryFn: getAllFriendships,
    ...options,
  });

// Create tanstack MUTATION custom hook to CREATE new friendship (send friend request)
export const useCreateFriendship = () =>
  useMutation({
    mutationFn: createFriendship,
    onSuccess: () => {
      // Invalidate and refetch all friendships after creating a new one
      queryClient.invalidateQueries({ queryKey: ["all-friendships"] });
    },
  });

// Create tanstack MUTATION custom hook to UPDATE friendship (accept friend request)
export const useUpdateFriendship = () =>
  useMutation({
    mutationFn: updateFriendship,
    onSuccess: () => {
      // Invalidate and refetch all friendships after updating one
      queryClient.invalidateQueries({ queryKey: ["all-friendships"] });
    },
  });

// Create tanstack MUTATION custom hook to DELETE friendship (delete or unfriend existing friendship)
export const useDeleteFriendship = () =>
  useMutation({
    mutationFn: deleteFriendship,
    onSuccess: () => {
      // Invalidate and refetch all friendships after deleting one
      queryClient.invalidateQueries({ queryKey: ["all-friendships"] });
    },
  });
