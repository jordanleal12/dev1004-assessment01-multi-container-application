import { AnimatePresence, motion } from "framer-motion";
import { memo, useState } from "react";
import styles from "./MovieCard.module.scss";
import {
  useAddMovieToReelProgress,
  useDeleteMovieFromReelProgress,
  useUpdateReelProgressMovieRating,
} from "../../utilities/customHooks/useReelProgress";
import StarRating from "../../components/common/StarRating";
import CardLoadingOverlay from "../../components/common/CardLoadingOverlay";
import { useAuthContext } from "../../contexts/useAuthContext";

function MovieCard({ movie, index, totalMovies }) {
  const { isAuthenticated } = useAuthContext();
  const { mutate: updateRating, isPending: isUpdating } = useUpdateReelProgressMovieRating();
  const { mutate: markAsWatched, isPending: isMarkingWatched } = useAddMovieToReelProgress();
  const { mutate: removeFromWatched, isPending: isRemovingWatched } =
    useDeleteMovieFromReelProgress();

  const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  // Track if movie was already revealed when component mounted
  const [wasWatchedAlready, setWasWatchedAlready] = useState(movie.isRevealed);

  // Pastel background color based on index
  const startHue = 330;
  const endHue = 240;
  const hue = startHue + (((index / totalMovies) * (endHue + 360 - startHue)) % 360);
  const pastel = `hsl(${hue}, 70%, 85%)`;

  // Handlers
  const handleMarkAsWatched = () => {
    markAsWatched({
      movie: movie._id,
      isWatched: true,
      rating: null,
    });
  };

  const handleRatingChange = (newRating) => {
    updateRating({
      movieId: movie._id,
      rating: newRating,
    });
  };

  const handleRemoveFromWatched = () => {
    removeFromWatched({ movieId: movie._id });
    setWasWatchedAlready(false);
  };

  return (
    <motion.div
      className={styles.card}
      // Desktop hover effect only
      tabIndex={isTouchDevice ? 0 : undefined} // ← only on mobile
      whileHover={
        !isTouchDevice
          ? {
              scale: 1.8,
              zIndex: 50,
              rotateY: 5,
            }
          : {}
      }
      transition={{ type: "tween", duration: 0.3 }}
      style={{ transformOrigin: "center center" }}
    >
      {/* Undo button */}
      {movie.isRevealed && (
        <button className={styles.undoButton} onClick={handleRemoveFromWatched}>
          Unwatch
        </button>
      )}

      {/* Loading overlay */}
      {(isUpdating || isMarkingWatched || isRemovingWatched) && (
        <CardLoadingOverlay
          message={
            isMarkingWatched ? `Adding ${movie.title} to your Reel Progress...` : "Updating..."
          }
        />
      )}

      {/* Pastel background (fades out when revealed) */}
      <AnimatePresence>
        {!movie.isRevealed && (
          <motion.div
            className={styles.pastelBackground}
            style={{ backgroundColor: pastel }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          />
        )}
      </AnimatePresence>

      {/* Movie poster (fades in when revealed) */}
      <AnimatePresence>
        {movie.isRevealed && (
          <motion.div
            className={styles.poster}
            style={{ backgroundImage: `url(${movie.poster})` }}
            initial={!wasWatchedAlready ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: !wasWatchedAlready ? 2 : 0 }}
            loading="lazy"
          />
        )}
      </AnimatePresence>

      {/* Dark overlay for already-watched movies */}
      {wasWatchedAlready && <div className={styles.posterOverlay} />}

      {/* Main content */}
      <article className={styles.content}>
        <h3 className={`${styles.title} ${movie.isRevealed ? styles.revealedText : ""}`}>
          {movie.title}
        </h3>
        <p className={`${styles.year} ${movie.isRevealed ? styles.revealedText : ""}`}>
          {movie.year}
        </p>
        <p className={`${styles.genres} ${movie.isRevealed ? styles.revealedText : ""}`}>
          {movie.genre.join(", ")}
        </p>

        {movie.isRevealed && (
          <div className={styles.ratingSection}>
            <StarRating
              initialRating={movie.userRating || movie.rating || 0}
              onRatingChange={handleRatingChange}
              isSubmitting={isUpdating}
            />
          </div>
        )}
      </article>

      {/* Overlay with details + Mark as Watched button */}
      {!movie.isRevealed && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <p>
              <strong>Director</strong>
              <br />
              {movie.director}
            </p>
            <p>
              <strong>Starring</strong>
              <br />
              {movie.actors.join(", ")}
            </p>
            <p className={styles.plot}>{movie.plot || "No plot currently available"}</p>

            {isAuthenticated && (
              <button className={styles.markAsWatchedButton} onClick={handleMarkAsWatched}>
                Mark as Watched
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default memo(MovieCard);
