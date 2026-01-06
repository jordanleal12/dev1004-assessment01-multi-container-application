import { useState } from "react";
import { useAuthContext } from "../../contexts/useAuthContext";
import { useAllFriendships, useAllUsers } from "../../utilities/customHooks";
import styles from "./UserComponents.module.scss";
import DeleteFriendship from "../../components/modals/DeleteFriendship";
import LoadingSpinner from "../../components/common/LoadingScreenOverlay";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function FriendsCard({ className }) {
  const { user } = useAuthContext();
  const {
    data: friendships,
    isLoading: friendshipsLoading,
    error: friendshipsError,
    refetch: refetchFriendships,
  } = useAllFriendships();
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useAllUsers();
  const [selectedFriendship, setSelectedFriendship] = useState(null);

  const userId = user?.id || user?._id;

  if (usersLoading || friendshipsLoading) return <LoadingSpinner />;

  // Create a lookup table for all friendships (users are occasionally in the wrong order)
  const usersLookup = users?.users?.reduce((account, user) => {
    account[user?._id] = user;
    return account;
  }, {});

  // Helper function to get friend user from friendship
  const getFriendFromFriendship = (friendship) => {
    if (!friendship || !user) return null;
    const friendId = friendship.user1 === userId ? friendship.user2 : friendship.user1;
    return usersLookup?.[friendId];
  };

  const selectedFriendUser = selectedFriendship
    ? getFriendFromFriendship(selectedFriendship)
    : null;

  if (usersError || friendshipsError) {
    const handleRetry = () => {
      if (usersError) refetchUsers();
      if (friendshipsError) refetchFriendships();
    };
    return (
      <section className={className}>
        <ErrorMessage error={usersError || friendshipsError} onRetry={handleRetry} />
      </section>
    );
  }

  return (
    <section className={className}>
      <article className={styles.cardBorder}>
        <h2>Your Friendships</h2>
        <table className={styles.friendsTable}>
          <thead className={styles.tableHeader}>
            <tr>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {friendships.friendships
              .filter((f) => f.friendRequestAccepted)
              .map((friendship) => {
                const friendUser = getFriendFromFriendship(friendship);
                return (
                  <tr key={friendship._id} className={styles.tableRow}>
                    <td className={styles.colUsername}>{friendUser?.username || "Unknown user"}</td>
                    <td className={styles.colActions}>
                      <button
                        className={styles.unfriendButton}
                        onClick={() => setSelectedFriendship(friendship)}
                      >
                        Unfriend
                      </button>
                    </td>
                  </tr>
                );
              })}
            {friendships.friendships.filter((f) => f.friendRequestAccepted).length === 0 && (
              <tr>
                <td colSpan="4" className={styles.noRequests}>
                  No friendships yet!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </article>
      <DeleteFriendship
        isOpen={!!selectedFriendship}
        onClose={() => setSelectedFriendship(null)}
        friendUser={selectedFriendUser}
        isPendingRequest={false}
      />
    </section>
  );
}
