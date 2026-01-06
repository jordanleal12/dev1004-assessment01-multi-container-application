import { Routes, Route } from "react-router-dom";
import {
  HOME,
  PROFILE,
  LEADERBOARD,
  REGISTER,
  REEL_CANON,
  ABOUT,
} from "./utilities/constants/routes";
import { Home, UserProfile, Leaderboard, Register, ReelCanon, About } from "./pages";
import "./styles/App.css";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/common/ErrorFallback";

// ErrrorBoundary fallback component can be replaced with custom component for each route if needed
export default function App() {
  return (
    <>
      <Routes>
        <Route
          path={HOME}
          element={
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Home />
            </ErrorBoundary>
          }
        />

        <Route
          path={PROFILE}
          element={
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <UserProfile />
            </ErrorBoundary>
          }
        />

        <Route
          path={LEADERBOARD}
          element={
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Leaderboard />
            </ErrorBoundary>
          }
        />

        <Route
          path={REGISTER}
          element={
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Register />
            </ErrorBoundary>
          }
        />

        <Route
          path={REEL_CANON}
          element={
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <ReelCanon />
            </ErrorBoundary>
          }
        />

        <Route
          path={ABOUT}
          element={
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <About />
            </ErrorBoundary>
          }
        />
      </Routes>
    </>
  );
}
