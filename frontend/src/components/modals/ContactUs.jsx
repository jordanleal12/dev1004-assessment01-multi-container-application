import CustomModal from "./CustomModal";
import { useForm } from "@formspree/react";
import styles from "../styles/Modals.module.scss";

function ContactUs({ isOpen, onClose }) {
  const [state, handleSubmit, reset] = useForm("mblpvzov");

  const handleClose = () => {
    reset("mblpvzov");
    onClose();
  };

  if (state.succeeded) {
    return (
      <CustomModal isOpen={isOpen} onRequestClose={handleClose}>
        <p>
          Thanks for contacting us! We'll get back to you soon.
          <br />
        </p>
        <button onClick={handleClose} className={styles.closeButton}>
          {" "}
          x{" "}
        </button>
      </CustomModal>
    );
  }
  if (!isOpen) return null;

  return (
    <CustomModal isOpen={isOpen} onRequestClose={handleClose}>
      <button
        type="button"
        onClick={handleClose}
        className={styles.closeButton}
        aria-label="Close contact form pop-up"
      >
        {" "}
        x{" "}
      </button>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <h1> Contact Us! </h1>
        <fieldset className={styles.inputGroup}>
          <legend> What's on your mind? </legend>
          <p>
            <label htmlFor="email">Email: </label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.modalInput}
              required
              autoComplete="email"
            />
          </p>
          <p>
            <label htmlFor="message">Message: </label>
            <textarea
              id="message"
              name="message"
              type="text"
              className={styles.modalTextarea}
              required
              minLength="10"
            />
          </p>
        </fieldset>
        <button type="submit" className={styles.modalButton} disabled={state.submitting}>
          Submit
        </button>
      </form>
    </CustomModal>
  );
}

export default ContactUs;
