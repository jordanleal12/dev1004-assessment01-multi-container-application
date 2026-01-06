import { useMemo } from "react";
import { useAuthContext } from "../../contexts/useAuthContext";
import { useAllMovies, useUserReelProgress } from "../../utilities/customHooks";
import { getFavouriteGenreStats } from "../../utilities/helpers/favouriteGenres";
import LoadingSpinner from "../../components/common/LoadingScreenOverlay";
import styles from "./UserComponents.module.scss";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function UserInfoCard({ className }) {
  const {
    data: canon,
    isLoading: moviesLoading,
    error: movieError,
    refetch: refetchMovies,
  } = useAllMovies();
  const { user, isAuthenticated } = useAuthContext();
  const {
    data: userRp,
    isLoading: rpLoading,
    error: reelProgressError,
    refetch: refetchReelProgress,
  } = useUserReelProgress({ enabled: isAuthenticated });

  const topGenres = useMemo(() => {
    if (!userRp?.reelProgress || !canon?.movies) return [];
    return getFavouriteGenreStats(userRp.reelProgress, canon.movies);
  }, [userRp, canon?.movies]);

  const movieTitleMap = {};
  (canon?.movies ?? []).forEach((movie) => {
    movieTitleMap[movie._id] = movie.title;
  });

  const watchedMovies = (userRp?.reelProgress ?? []).map((progress) => ({
    title: movieTitleMap[progress.movie] || "Unknown Movie",
    rating: progress.rating,
    movieId: progress.movie,
  }));

  if (moviesLoading || rpLoading) return <LoadingSpinner />;

  if (movieError || reelProgressError) {
    const handleRetry = () => {
      if (movieError) refetchMovies();
      if (reelProgressError) refetchReelProgress();
    };
    return (
      <section className={className}>
        <ErrorMessage error={movieError || reelProgressError} onRetry={handleRetry} />
      </section>
    );
  }

  return (
    <section className={className}>
      <article className={styles.cardBorder}>
        <h2>Your Cinematic Info</h2>
        <h3>Username: {user.username}</h3>
        <h3>Email: {user.email}</h3>
        <h3>Your Top 5 Favourite Genres:</h3>
        {topGenres.length > 0 ? (
          topGenres.map((genre) => <div key={genre}>{genre}</div>)
        ) : (
          <div>You haven't rated any movies yet!</div>
        )}
        <div>
          <h3>Movies Watched</h3>
          {watchedMovies.length === 0 ? (
            <p>No movies watched yet!</p>
          ) : (
            <ul>
              {watchedMovies.map((movie) => (
                <li key={movie.movieId}>
                  <strong>{movie.title}</strong> - Rating: {movie.rating}/5 stars.
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </section>
  );
}
