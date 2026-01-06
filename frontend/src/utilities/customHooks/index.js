// AUTH CUSTOM HOOKS
import { useRegisterUser, useLoginUser, useLogoutUser } from "./useAuth";
// FRIENDSHIP CUSTOM HOOKS
import {
  useAllFriendships,
  useCreateFriendship,
  useUpdateFriendship,
  useDeleteFriendship,
} from "./useFriendships";
// LEADERBOARD CUSTOM HOOK
import { useLeaderboard } from "./useLeaderboard";
// MOVIE CUSTOM HOOKS
import { useAllMovies, useMovieByTitle, useMovieByImdbId } from "./useMovies";
// REEL PROGRESS CUSTOM HOOKS
import {
  useUserReelProgress,
  useAddMovieToReelProgress,
  useUpdateReelProgressMovieRating,
  useDeleteMovieFromReelProgress,
} from "./useReelProgress";
// USER CUSTOM HOOKS
import {
  useAllUsers,
  useCurrentUser,
  useUpdateCurrentUser,
  useUpdateCurrentUserPassword,
  useDeleteCurrentUser,
} from "./useUsers";

export {
  // AUTH EXPORTS
  useRegisterUser,
  useLoginUser,
  useLogoutUser,
  // FRIENDSHIP EXPORTS
  useAllFriendships,
  useCreateFriendship,
  useUpdateFriendship,
  useDeleteFriendship,
  // LEADERBOARD EXPORT
  useLeaderboard,
  // MOVIE EXPORTS
  useAllMovies,
  useMovieByTitle,
  useMovieByImdbId,
  // REEL PROGRESS EXPORTS
  useUserReelProgress,
  useAddMovieToReelProgress,
  useUpdateReelProgressMovieRating,
  useDeleteMovieFromReelProgress,
  // USER EXPORTS
  useAllUsers,
  useCurrentUser,
  useUpdateCurrentUser,
  useUpdateCurrentUserPassword,
  useDeleteCurrentUser,
};
