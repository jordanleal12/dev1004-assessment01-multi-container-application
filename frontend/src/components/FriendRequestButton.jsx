import { memo, useState } from "react";
import styles from "./styles/Navbar.module.scss";
import MyFriendRequests from "./modals/FriendRequests";
import usePendingRequestCount from "../utilities/customHooks/usePendingRequestCount";
// import { useAuthContext } from "../../contexts/useAuthContext";

function FriendRequestButton() {
  const [showModal, setShowModal] = useState(false);

  const pendingRequestCount = usePendingRequestCount();

  return (
    <>
      <button className={styles.friendRequestButton} onClick={() => setShowModal(true)}>
        Friend Requests
        {pendingRequestCount > 0 && <div className={styles.badge}>{pendingRequestCount}</div>}
      </button>

      <MyFriendRequests isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

export default memo(FriendRequestButton);
