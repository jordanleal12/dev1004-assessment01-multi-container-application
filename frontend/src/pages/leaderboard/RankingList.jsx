import { useLeaderboard } from "../../utilities/customHooks";
import styles from "./Leaderboard.module.scss";
import LoadingSpinner from "../../components/common/LoadingScreenOverlay";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function RankingList({ title }) {
  const { data, isLoading, error } = useLeaderboard();
  const rankingData = data?.reelProgressData || [];

  const rankingTable = rankingData.map((user, index) => (
    <tr key={user._id}>
      <td>{index + 1}</td>
      <td>{user._id}</td>
      <td>{user.reelProgressCount}%</td>
    </tr>
  ));

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <section className={styles.rankings}>
        <ErrorMessage error={error} />
      </section>
    );
  }

  return (
    <section className={styles.rankings}>
      <h2>{title}</h2>
      <section className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Completion Percentage</th>
            </tr>
          </thead>
          <tbody>{rankingTable}</tbody>
        </table>
      </section>
    </section>
  );
}
