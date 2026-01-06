import { useAllMovies } from "../../utilities/customHooks/useMovies";
import { useUserReelProgress } from "../../utilities/customHooks/useReelProgress";
import { useAuthContext } from "../../contexts/useAuthContext";
import ErrorMessage from "../../components/common/ErrorMessage";
import MovieCard from "./MovieCard";
import styles from "./ReelCanon.module.scss";
import LoadingSpinner from "../../components/common/LoadingScreenOverlay";
import { useMemo, useState, useEffect } from "react";

export default function ReelCanon() {
  const {
    data: canon,
    isLoading: canonLoading,
    error: canonError,
    refetch: refetchCanon,
  } = useAllMovies();

  const { user, isAuthenticated } = useAuthContext();

  const {
    data: rpResponse,
    isLoading: progressLoading,
    error: progressError,
    refetch: refetchProgress,
  } = useUserReelProgress({
    enabled: isAuthenticated,
  });

  // useState to manage how many movieCards are initially visible
  const [visibleCount, setVisibleCount] = useState(30);

  // Create a lookup object for any existing progress records
  const progressMap = useMemo(() => {
    const map = {};
    if (rpResponse?.reelProgress) {
      rpResponse.reelProgress.forEach((p) => {
        map[p.movie] = {
          isRevealed: p.isWatched,
          rating: p.rating,
        };
      });
    }
    return map;
  }, [rpResponse?.reelProgress]);

  // Create array of movies with isRevealed status for display
  const movies = useMemo(
    () =>
      (canon?.movies ?? []).map((m) => {
        const prog = progressMap[m._id];
        return {
          ...m,
          isRevealed: !!prog?.isRevealed,
          rating: prog?.rating ?? undefined,
        };
      }),
    [canon?.movies, progressMap]
  );

  // This useEffect loads the movies over time, starting at 30 movies.
  useEffect(() => {
    if (visibleCount < movies.length) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => Math.min(prev + 20, movies.length));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, movies.length]);

  if (canonError) {
    return <ErrorMessage error={canonError} onRetry={refetchCanon} />;
  }

  if (isAuthenticated && progressError && progressError.status !== 404) {
    return <ErrorMessage error={progressError} onRetry={refetchProgress} />;
  }

  if (canonLoading || progressLoading) return <LoadingSpinner />;

  return (
    <main>
      <section className={styles.reelCanon}>
        <article className={styles.title}>
          <h1>The Reel Canon</h1>
          {!isAuthenticated ? (
            <h2>Sign In or Register to Start Your Film Journey!</h2>
          ) : (
            <h2>
              {isAuthenticated ? `Welcome ${user.username}! ` : ""}
              <br />
              The Reel Canon is 100 Curated Films to Start Your Celluloid Exploration!
            </h2>
          )}
        </article>

        <section className={styles.grid}>
          {movies.slice(0, visibleCount).map((movie, i) => (
            <MovieCard key={movie._id} movie={movie} index={i} totalMovies={movies.length} />
          ))}
        </section>

        {visibleCount < movies.length && <LoadingSpinner />}
      </section>
    </main>
  );
}
