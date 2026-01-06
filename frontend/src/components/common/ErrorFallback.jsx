import ErrorMessage from "./ErrorMessage";
// Fallback component that will render when a component within ErrorBoundary throws an unhandled error

// error is error object caught, resetErrorBoundary is function to reset the error boundary state
export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" aria-live="polite" className="error-fallback">
      <h2>Something went wrong.</h2>
      {/* Passing resetErrorBoundary means clicking retry will call function that re-renders */}
      <ErrorMessage error={error?.message} onRetry={resetErrorBoundary} />
    </div>
  );
}
