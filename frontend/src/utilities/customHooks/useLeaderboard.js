import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "../services/apiServices";

// Create tanstack fetch custom hook to GET leaderboard data
export const useLeaderboard = () =>
  useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboard,
  });
