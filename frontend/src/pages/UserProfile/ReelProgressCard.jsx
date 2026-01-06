import { useAuthContext } from "../../contexts/useAuthContext";
import { useUserReelProgress } from "../../utilities/customHooks";
import LoadingSpinner from "../../components/common/LoadingScreenOverlay";
import styles from "./UserComponents.module.scss";
import { motion } from "framer-motion";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function ReelProgressCard({ className }) {
  const { isAuthenticated } = useAuthContext();

  const { data, isLoading, error, refetch } = useUserReelProgress({
    enabled: isAuthenticated,
  });

  if (isLoading || !data) return <LoadingSpinner />;

  if (error) {
    return (
      <section className={className}>
        <ErrorMessage error={error} onRetry={refetch} />
      </section>
    );
  }

  const progress = data.reelProgress.length;
  const progressPercentage = Math.min(progress, 100);

  return (
    <section className={className}>
      <article className={styles.cardBorder}>
        <h2>Your Reel Progress</h2>

        <div className={styles.verticalProgressContainer}>
          <article className={styles.progressTrack}>
            <motion.div
              className={styles.progressFill}
              initial={{ height: "0%" }}
              animate={{ height: `${progressPercentage}%` }}
              transition={{
                duration: 5,
                ease: "easeOut",
                delay: 2,
              }}
            />
          </article>
          <div className={styles.progressContent}>
            <h2>{progress}/100 Reel Canon Movies Watched!</h2>
            <div className={styles.percentage}>Your Popcorn Meter is at {progressPercentage}%!</div>
          </div>
        </div>
      </article>
    </section>
  );
}
