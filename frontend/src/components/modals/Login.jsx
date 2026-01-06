/* eslint-disable react/jsx-props-no-spreading */
// React hook form provides form management without useState
import clsx from "clsx";
import CustomModal from "./CustomModal";
import { useForm } from "react-hook-form";
import styles from "../styles/Modals.module.scss";
import { useLoginUser } from "../../utilities/customHooks/useAuth";
import { useAuthContext } from "../../contexts/useAuthContext";
import toast from "react-hot-toast";
import ErrorMessage from "../common/ErrorMessage";

function Login({ isOpen, onClose }) {
  const { login: setGlobalAuth } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const { mutate: apiLogin, isPending, error: apiError } = useLoginUser();

  const onSubmit = (data) => {
    apiLogin(data, {
      onSuccess: (res) => {
        setGlobalAuth(res.user, res.token);
        toast.success("Login successful!");
        setTimeout(() => {
          onClose();
        }, 800);
      },
    });
  };
  if (!isOpen) return null;

  return (
    // Modal instead of Main
    <CustomModal isOpen={isOpen} onRequestClose={onClose}>
      {/* Close button :D */}
      <button
        type="button"
        onClick={onClose}
        className={styles.closeButton}
        aria-label="Close login pop-up"
      >
        {" "}
        x{" "}
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.modalForm}>
        <h1> Welcome Back! </h1>

        {/* fieldset for all form fields */}
        <fieldset className={styles.inputGroup}>
          {/* Legend for name of all fields */}
          <legend>Login Credentials</legend>
          <div className={styles.formField}>
            <label htmlFor="email">Email: </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email", {
                // Input validation rules go here!
                required: "Email is required", // Custom message for validation rule
                pattern: {
                  value: /^\S+@\S+$/i, // Check it is valid email format
                  message: "Please enter a valid email address",
                },
              })}
              // Conditional classes for styling appropriately
              className={clsx(
                styles.modalInput,
                errors.email && styles.inputError // shared error class for styling
              )}
            />

            {/* This runs when there are React Hook Form email errors! (Old code below) */}
            <ErrorMessage error={errors.email?.message} className={styles.errorMessage} />
          </div>
          <div className={styles.formField}>
            <label htmlFor="password">Password: </label>
            <input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8, // Same as backend requirements
                  message: "Password must be at least 8 characters",
                },
              })}
              className={clsx(
                styles.modalInput,
                errors.password && styles.inputError // shared error class for styling
              )}
            />
            {/* This runs when there are React Hook Form password errors (old code below) */}
            <ErrorMessage error={errors.password?.message} className={styles.errorMessage} />
          </div>
        </fieldset>
        {/* This runs when there are API errors! (Old code below) */}
        <ErrorMessage error={apiError} className={styles.apiError} />
        <button
          type="submit"
          disabled={isPending}
          className={clsx(styles.modalButton, isPending && styles.buttonLoading)}
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </CustomModal>
  );
}

export default Login;
