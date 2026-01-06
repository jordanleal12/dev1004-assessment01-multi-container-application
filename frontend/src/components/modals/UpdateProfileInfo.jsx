/* eslint-disable react/jsx-props-no-spreading */
// React hook form provides form management without useState
import clsx from "clsx";
import styles from "../styles/Modals.module.scss";
import { useForm } from "react-hook-form";
import { useAuthContext } from "../../contexts/useAuthContext";
import toast from "react-hot-toast";
import ErrorMessage from "../../components/common/ErrorMessage";
import CustomModal from "./CustomModal";
import { useUpdateCurrentUser } from "../../utilities/customHooks/useUsers";

export default function UpdateProfile({ isOpen, onClose }) {
  // Get current user
  const { user, updateUser } = useAuthContext();

  // formState allows RHF to track which fields have errors and what they are
  const {
    register, // attaches form content
    handleSubmit, // runs when submitted
    formState: { errors, isDirty }, // real-time validation error tracking & changes tracking
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: user?.email || "",
      username: user?.username || "",
    },
  });

  // useUpdateUser to update email or userName
  const { mutate: updateProfile, isPending, error: apiError } = useUpdateCurrentUser();

  const onSubmit = (data) => {
    if (!isDirty) {
      toast.error("No changes made");
      return;
    }

    updateProfile(data, {
      onSuccess: (res) => {
        updateUser(res.user);
        toast.success("Profile updated successfully!");
        onClose();
      },
    });
  };

  if (!isOpen) return null;

  return (
    // Main: the main content of this component
    <CustomModal isOpen={isOpen} onRequestClose={onClose}>
      {/* Close button :D */}
      <button
        type="button"
        onClick={onClose}
        className={styles.closeButton}
        aria-label="Close pop-up"
      >
        {" "}
        x{" "}
      </button>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.modalForm}>
        <h1> Update Username or Email </h1>
        {/* fieldset semantic HTML for all form fields */}
        <fieldset className={styles.inputGroup}>
          {/* Legend for name of all fields */}
          <legend>Account Details</legend>

          <div className={styles.formField}>
            <label htmlFor="email">Email: </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email", {
                // Input validation rules go here!
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Check valid email
                  message: "Please enter a valid email address",
                },
              })}
              // Conditional classes for styling appropriately (like red border on error)
              className={clsx(styles.modalInput, errors.email && styles.inputError)}
            />
            <br />

            {/* This runs when there are react hook form email errors */}
            <ErrorMessage error={errors.email?.message} className={styles.errorMessage} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="username">Username: </label>
            <input
              id="username"
              autoComplete="username"
              type="text"
              {...register("username", {
                minLength: {
                  value: 2,
                  message: "Username must be at least 2 characters",
                },
              })}
              className={clsx(styles.modalInput, errors.username && styles.inputError)}
            />
            <br />

            {/* This runs when there are react hook form username errors */}
            <ErrorMessage error={errors.username?.message} className={styles.errorMessage} />
          </div>
        </fieldset>

        {/* This runs when there are API level errors */}
        <ErrorMessage error={apiError} className={styles.apiError} />
        <br />

        <button
          type="submit"
          disabled={isPending || !isDirty}
          className={clsx(
            styles.modalButton,
            isPending && styles.buttonLoading,
            !isDirty && styles.buttonDisabled
          )}
        >
          {isPending ? "Updating profile..." : "Update"}
        </button>
      </form>
    </CustomModal>
  );
}
