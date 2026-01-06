import clsx from "clsx";
import CustomModal from "./CustomModal";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Modals.module.scss";
import { useLogoutUser } from "../../utilities/customHooks/useAuth";
import { useAuthContext } from "../../contexts/useAuthContext";

function Logout({ isOpen, onClose }) {
  const navigate = useNavigate();

  const { logout: contextLogout } = useAuthContext();

  const { mutateAsync: apiLogout, isPending } = useLogoutUser();

  const handleLogout = async () => {
    // ← make async
    try {
      await apiLogout(undefined); // ← await the mutation
      await contextLogout(); // ← await token removal
      toast.success("Logged out successfully!");
      onClose();
      navigate("/", { replace: true });
    } catch {
      await contextLogout(); // still remove token
      toast.error("Server error, but logged out locally.");
      onClose();
      navigate("/", { replace: true });
    }
  };
  if (!isOpen) return null;

  return (
    <CustomModal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={!isPending}
      shouldCloseOnEsc={!isPending}
    >
      <button type="button" onClick={onClose} className={styles.closeButton}>
        x
      </button>
      <section className={styles.modalForm}>
        <h1>Log Out</h1>
        <article className={styles.generalMessage}>
          <p>Are you sure you want to log out?</p>
        </article>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className={clsx(styles.modalButton, isPending && styles.buttonLoading)}
        >
          {isPending ? "Logging out..." : "Yes, Log Out"}
        </button>
      </section>
    </CustomModal>
  );
}

export default Logout;
