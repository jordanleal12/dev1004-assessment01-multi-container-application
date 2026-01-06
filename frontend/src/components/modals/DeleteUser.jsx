import clsx from "clsx";
import CustomModal from "./CustomModal";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Modals.module.scss";
import { useAuthContext } from "../../contexts/useAuthContext";
import { useDeleteCurrentUser } from "../../utilities/customHooks";
import { useState } from "react";

function DeleteUser({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { mutate: deleteUser, isPending } = useDeleteCurrentUser();

  const handleDeleteConfirm = () => {
    deleteUser(undefined, {
      onSuccess: () => {
        logout();
        toast.success("Your account has been permanently deleted. Come back anytime!");
        navigate("/");
        onClose();
        setShowConfirmation(false);
      },
      onError: () => {
        toast.error("Failed to delete account. Please try again.");
        setShowConfirmation(false);
      },
    });
  };

  const handleClose = () => {
    setShowConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <CustomModal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={!isPending}
      shouldCloseOnEsc={!isPending}
    >
      <button type="button" onClick={onClose} className={styles.closeButton} disabled={isPending}>
        x
      </button>
      <section className={styles.modalForm}>
        <h1>Delete Account</h1>
        <article className={styles.generalMessage}>
          {!showConfirmation ? (
            <>
              <p>This action will permanently delete your account and all associated data.</p>
              <div className={styles.buttonSection}>
                <button type="button" className={styles.cancelButton} onClick={handleClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmation(true)}
                  className={styles.deleteButton}
                >
                  Delete Account
                </button>
              </div>
            </>
          ) : (
            <>
              <p>
                <strong>Are you sure?</strong> This action cannot be undone.
              </p>
              <div className={styles.buttonSection}>
                <button type="button" onClick={handleClose} className={clsx(styles.cancelButton)}>
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isPending}
                  className={clsx(styles.deleteButton, isPending && styles.buttonLoading)}
                >
                  {isPending ? "Deleting..." : "Yes, Delete My Account"}
                </button>
              </div>
            </>
          )}
        </article>
      </section>
    </CustomModal>
  );
}

export default DeleteUser;
