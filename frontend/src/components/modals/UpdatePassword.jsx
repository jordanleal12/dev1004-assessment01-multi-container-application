/* eslint-disable react/jsx-props-no-spreading */
// React hook form provides form management without useState
import clsx from "clsx";
import styles from "../styles/Modals.module.scss";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ErrorMessage from "../../components/common/ErrorMessage";
import CustomModal from "./CustomModal";
import { useUpdateCurrentUserPassword } from "../../utilities/customHooks/useUsers";
// import { useEffect } from "react";

export default function UpdatePassword({ isOpen, onClose }) {
  // Get current user

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm({
    mode: "onChange",
  });

  const watchNewPassword = watch("newPassword");

  // useUpdateUserPassword to compare current and update to new password
  const { mutate: updatePassword, isPending, error: apiError } = useUpdateCurrentUserPassword();

  const onSubmit = (data) => {
    if (!isDirty) {
      toast.error("No changes made");
      return;
    }
    const updatedPasswordData = {
      currentPassword: data.password,
      newPassword: data.newPassword,
    };
    updatePassword(updatedPasswordData, {
      onSuccess: () => {
        toast.success("Password updated successfully!");
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
        <h1> Update Password </h1>
        {/* fieldset semantic HTML for all form fields */}
        <fieldset className={styles.inputGroup}>
          {/* Legend for name of all fields */}
          <legend>Confirm Current and Enter New Password</legend>

          <div className={styles.formField}>
            <label htmlFor="password">Password: </label>
            <input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message: "Requires one uppercase, lowercase, number & special character.",
                },
              })}
              className={clsx(styles.modalInput, errors.password && styles.inputError)}
            />
            <br />

            <ErrorMessage error={errors.password?.message} className={styles.errorMessage} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="newPassword">New password: </label>
            <input
              id="newPassword"
              type="password"
              {...register("newPassword", {
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message: "Requires one uppercase, lowercase, number & special character.",
                },
              })}
              className={clsx(styles.modalInput, errors.newPassword && styles.inputError)}
            />
            <br />

            <ErrorMessage error={errors.newPassword?.message} className={styles.errorMessage} />
          </div>

          <div className={styles.formField}>
            <label htmlFor="confirmPassword">Confirm new password: </label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your new password",
                validate: (value) => value === watchNewPassword || "Passwords do not match",
              })}
              className={clsx(styles.modalInput, errors.confirmPassword && styles.inputError)}
            />
            <br />

            <ErrorMessage error={errors.confirmPassword?.message} className={styles.errorMessage} />
          </div>
        </fieldset>

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
          {isPending ? "Updating password..." : "Update Password"}
        </button>
      </form>
    </CustomModal>
  );
}
