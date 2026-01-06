import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerUser, loginUser, logoutUser } from "../services/apiServices";

// Create tanstack mutation custom hook to register a new user
export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
    },
  });
};

// Create tanstack mutation custom hook to login an existing user
export const useLoginUser = () =>
  useMutation({
    mutationFn: loginUser,
  });

// Create tanstack mutation custom hook to logout current user
// Is this needed? Logout is just GET request with success message
export const useLogoutUser = () =>
  useMutation({
    mutationFn: logoutUser,
  });
