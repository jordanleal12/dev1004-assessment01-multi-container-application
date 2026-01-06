import { useEffect, useState } from "react";
import clsx from "clsx";
import styles from "../styles/StarRating.module.scss";

export default function StarRating({ initialRating = 0, onRatingChange, isSubmitting = false }) {
  // Set up a state for rating using UI
  const [rating, setRating] = useState(initialRating);
  // Set up a state to light up stars as you hover
  const [hover, setHover] = useState(0);
  // Set up a state where movies are just rated, just to avoid repeat ratings
  const [justRated, setJustRated] = useState(false);

  // Set the initial rating to the initial rating of the movie (default to 0 if rating is null)
  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  // rating handler!
  const handleRating = async (newRating) => {
    setRating(newRating);
    setJustRated(true);

    if (onRatingChange) {
      await onRatingChange(newRating);
    }

    setTimeout(() => setJustRated(false), 2000);
  };

  let statusText = "Rate this movie";
  if (rating > 0) statusText = `${rating} stars!`;

  return (
    <div className={styles.starRating}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={clsx(
            styles.star,
            star <= (hover || rating) && styles.filled,
            isSubmitting && styles.disabled,
            justRated && styles.justRated
          )}
          onClick={() => !isSubmitting && handleRating(star)}
          onMouseEnter={() => !isSubmitting && setHover(star)}
          onMouseLeave={() => !isSubmitting && setHover(0)}
          disabled={isSubmitting}
          type="button"
        >
          ⭐
        </button>
      ))}
      <br />
      <p className={clsx(styles.ratingText, justRated && styles.success)}>{statusText}</p>
    </div>
  );
}
