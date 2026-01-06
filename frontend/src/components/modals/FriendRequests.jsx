import { useState } from "react";
import CustomModal from "./CustomModal";
import { useAuthContext } from "../../contexts/useAuthContext";
import { useAllFriendships, useAllUsers, useUpdateFriendship } from "../../utilities/customHooks";
import styles from "../styles/Modals.module.scss";
import LoadingSpinner from "../common/LoadingScreenOverlay";
import toast from "react-hot-toast";
import DeleteFriendship from "./DeleteFriendship";
import ErrorMessage from "../common/ErrorMessage";

export default function MyFriendRequests({ isOpen, onClose }) {
  const { user, isLoading: currentUserLoading } = useAuthContext();
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
  const { mutate: acceptRequest, isPending } = useUpdateFriendship();

  const [activeTab, setActiveTab] = useState("received");
  const [selectedFriendship, setSelectedFriendship] = useState(null);

  // Create a consistent user ID
  const userId = user?._id || user?.id;

  if (!user || currentUserLoading || usersLoading || friendshipsLoading) {
    return <LoadingSpinner />;
  }

  // Create a lookup table for all friendships (users are occasionally in the wrong order)
  const usersLookup = users?.users?.reduce((account, user) => {
    account[user?._id] = user;
    return account;
  }, {});

  const getFriendFromFriendship = (friendship) => {
    if (!friendship || !user) return null;
    const friendId = friendship.user1 === userId ? friendship.user2 : friendship.user1;
    return usersLookup?.[friendId];
  };

  // Helper function to get friend user from friendship
  const receivedRequests =
    friendships?.friendships?.filter(
      (friendship) => !friendship.friendRequestAccepted && friendship.requesterUserId !== userId
    ) || [];

  const sentRequests =
    friendships?.friendships?.filter(
      (friendship) => !friendship.friendRequestAccepted && friendship.requesterUserId === userId
    ) || [];

  const currentRequests = activeTab === "received" ? receivedRequests : sentRequests;

  const handleAcceptRequest = (friendship) => {
    acceptRequest(friendship.requesterUserId, {
      onSuccess: () => {
        toast.success(`You and ${getFriendFromFriendship(friendship)?.username} are now friends!`);
      },
      onError: () => {
        toast.error("Failed to accept friend request. Please try again.");
      },
    });
  };

  if (!isOpen) return null;

  if (friendshipsError || usersError) {
    const handleRetry = () => {
      if (friendshipsError) refetchFriendships();
      if (usersError) refetchUsers();
    };
    return (
      <CustomModal isOpen={isOpen} onRequestClose={onClose}>
        <button onClick={onClose} className={styles.closeButton}>
          x
        </button>
        <ErrorMessage error={friendshipsError || usersError} onRetry={handleRetry} />
      </CustomModal>
    );
  }

  return (
    <>
      <CustomModal isOpen={isOpen} onRequestClose={onClose}>
        <button onClick={onClose} className={styles.closeButton}>
          x
        </button>
        <section className={styles.modalForm}>
          {activeTab === "received" ? (
            <h1>Received Friend Requests</h1>
          ) : (
            <h1>Sent Friend Requests</h1>
          )}
          <div className={styles.modalTabs}>
            <button className={styles.smallModalButton} onClick={() => setActiveTab("received")}>
              Received ({receivedRequests.length || 0})
            </button>
            <button className={styles.smallModalButton} onClick={() => setActiveTab("sent")}>
              Sent ({sentRequests.length || 0})
            </button>
          </div>

          <table className={styles.friendsTable}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Username</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRequests.map((friendship) => {
                const friendUser = getFriendFromFriendship(friendship);
                return (
                  <tr key={friendship._id} className={styles.requestTableRow}>
                    <td className={styles.colUsername}>{friendUser?.username || "Unknown user"}</td>
                    <td className={styles.colEmail}>Pending</td>
                    <td className={styles.colActions}>
                      {activeTab === "received" ? (
                        <>
                          <button
                            className={styles.acceptButton}
                            onClick={() => handleAcceptRequest(friendship)}
                          >
                            {isPending ? "Processing..." : "Accept"}
                          </button>
                          <button
                            className={styles.declineButton}
                            onClick={() => setSelectedFriendship(friendship)}
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <button
                          className={styles.declineButton}
                          onClick={() => setSelectedFriendship(friendship)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {currentRequests.length === 0 && (
                <tr>
                  <td colSpan="4" className={styles.noRequests}>
                    No {activeTab} requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </CustomModal>
      <DeleteFriendship
        isOpen={!!selectedFriendship}
        onClose={() => setSelectedFriendship(null)}
        friendUser={getFriendFromFriendship(selectedFriendship)}
        isPendingRequest
      />
    </>
  );
}
