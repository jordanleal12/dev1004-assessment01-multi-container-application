// usePendingRequestCount.js
import { useAuthContext } from "../../contexts/useAuthContext";
import { useAllFriendships } from "./useFriendships";

export default function usePendingRequestCount() {
  const { user } = useAuthContext();

  // Refetch every minute automatically
  const { data } = useAllFriendships({
    refetchInterval: 30000,
  });

  if (!user?.id) return 0; // <-- guard clause

  // Count pending requests where current user is NOT the requester
  const pendingCount =
    data?.friendships?.filter(
      (f) => !f.friendRequestAccepted && f.requesterUserId.toString() !== user.id.toString()
    ).length || 0;

  return pendingCount;
}
