/* eslint-disable react/jsx-props-no-spreading */
// React hook form provides form management without useState
import clsx from "clsx";
import styles from "./Register.module.scss";
import { useForm } from "react-hook-form";
import { useRegisterUser } from "../../utilities/customHooks";
import { useAuthContext } from "../../contexts/useAuthContext";
import toast from "react-hot-toast";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useNavigate } from "react-router-dom";
import { HOME } from "../../utilities/constants/routes";

export default function Register() {
  // Get auth context for login function
  const { login: setGlobalAuth } = useAuthContext();

  // formState allows RHF to track which fields have errors and what they are
  const {
    register, // attaches form content
    handleSubmit, // runs when submitted
    formState: { errors }, // real-time validation error tracking
    watch, // to watch a particular value from a field in the form
  } = useForm({ mode: "onChange" });

  // Tanstack mutation hook for registering user
  const { mutate: registerAccount, isPending, error: apiError } = useRegisterUser();

  // Set up password watch for matching password check
  const watchPassword = watch("password");

  const navigate = useNavigate(); // Create navigate hook instance
  // What runs when the form is submitted and valid (handleSubmit automatically checks validation rules):
  const onSubmit = (data) => {
    const registrationData = {
      email: data.email,
      username: data.username,
      password: data.password,
    };
    registerAccount(registrationData, {
      onSuccess: (res) => {
        // Use auth context to login the user automatically after registration
        setGlobalAuth(res.user, res.token);
        toast.success("Registration successful! You are now logged in.");
        navigate(HOME); // Redirect to home page after success
      },
    });
  };

  return (
    // Main: the main content of this component
    <main className={styles.registerContainer}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.registerForm}>
        <h1> Join the Century Screening Room! </h1>
        {/* fieldset semantic HTML for all form fields */}
        <fieldset className={styles.inputGroup}>
          {/* Legend for name of all fields */}
          <legend>Account Details</legend>

          <div className={styles.inputField}>
            <label htmlFor="email">Email: </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email", {
                // Input validation rules go here!
                required: "Email is required", // Custom message for validation rule
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Check valid email
                  message: "Please enter a valid email address",
                },
              })}
              // Conditional classes for styling appropriately (like red border on error)
              className={clsx(styles.registerInput, errors.email && styles.inputError)}
            />
            <br />

            {/* This runs when there are react hook form email errors */}
            <ErrorMessage error={errors.email?.message} className={styles.errorMessage} />
          </div>

          <div className={styles.inputField}>
            <label htmlFor="username">Username: </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 2,
                  message: "Username must be at least 2 characters",
                },
              })}
              className={clsx(styles.registerInput, errors.username && styles.inputError)}
            />
            <br />

            {/* This runs when there are react hook form username errors */}
            <ErrorMessage error={errors.username?.message} className={styles.errorMessage} />
          </div>

          <div className={styles.inputField}>
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
              className={clsx(styles.registerInput, errors.password && styles.inputError)}
            />
            <br />

            <small id="passwordInstructions">
              Requires one uppercase, lowercase, number & special character.
            </small>
            <br />

            {/* This runs when there are react hook form password errors */}
            <ErrorMessage error={errors.password?.message} className={styles.errorMessage} />
          </div>

          <div className={styles.inputField}>
            <label htmlFor="confirmPassword">Confirm password: </label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => value === watchPassword || "Passwords do not match",
              })}
              className={clsx(styles.registerInput, errors.confirmPassword && styles.inputError)}
            />
            <br />

            {/* This runs when there are react hook form confirm password errors */}
            <ErrorMessage error={errors.confirmPassword?.message} className={styles.errorMessage} />
          </div>
        </fieldset>

        {/* This runs when there are API level errors */}
        <ErrorMessage error={apiError?.message} className={styles.apiError} />
        <br />

        <button
          type="submit"
          disabled={isPending}
          className={clsx(styles.registerButton, isPending && styles.loadingButton)}
        >
          {isPending ? "Setting up account" : "Register"}
        </button>
      </form>
    </main>
  );
}
