import LeaderboardPodium from "../../components/common/LeaderboardPodium";
import RankingList from "./RankingList";
import { useLeaderboard } from "../../utilities/customHooks";
import styles from "./Leaderboard.module.scss";
import LoadingSpinner from "../../components/common/LoadingScreenOverlay";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function Leaderboard() {
  const { data, isLoading, error, refetch } = useLeaderboard();
  const topRankings = data?.reelProgressData?.slice(0, 3).map((e) => e._id) || [];

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <section className={styles.leaderboard}>
        <div className={styles.errorWrapper}>
          <ErrorMessage error={error} onRetry={refetch} />
        </div>
      </section>
    );
  }

  return (
    <main className={styles.leaderboard}>
      <article className={styles.title}>
        <h1>Leaderboard</h1>
      </article>
      <article className={styles.featureContainer}>
        <LeaderboardPodium className={styles.podium} rankings={topRankings} />
        <RankingList className={styles.list} title="Ranking List" />
      </article>
    </main>
  );
}
