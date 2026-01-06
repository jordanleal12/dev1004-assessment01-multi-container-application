// Error message component that only renders when an error is passed as a prop and exists
import styles from "../styles/ErrorMessage.module.scss";

export default function ErrorMessage({
  error,
  className = null,
  onRetry,
  showDetailedErrors = true,
}) {
  // Don't render anything if there's no error
  if (!error) return null;

  // Declare default message and empty detailed errors array
  let errorMessage = "An unexpected error occurred";
  let detailedErrors = [];

  // If ErrorMessage is given a string, e.g. <ErrorMessage error="Simple error message" />
  if (typeof error === "string") {
    errorMessage = error;
  } else if (error?.message) {
    // Errors passed in from apiServices after being processed by handleApiError
    errorMessage = error.message;
    detailedErrors = error.errors || []; // Keep default empty array if no attached errors
  }
  // role="alert" & aria-live="polite" are for screen reader accessibility
  return (
    <div className={className || styles.errorContainer} role="alert" aria-live="polite">
      <div>
        <p>{errorMessage}</p>
        {/* Render list of detailed errors if exists and showDetailedErrors not set to false */}
        {showDetailedErrors && detailedErrors.length > 0 && (
          <ul>
            {detailedErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}
      </div>
      {/* Optional retry button, only renders when onRetry passed as prop */}
      {onRetry && (
        <button type="button" onClick={onRetry} aria-label="Retry request">
          Try Again
        </button>
      )}
    </div>
  );
}
