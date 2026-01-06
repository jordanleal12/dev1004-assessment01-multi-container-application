import styles from "../styles/CardLoadingOverlay.module.scss";
import { motion } from "framer-motion";

export default function CardLoadingOverlay({ message = "Loading..." }) {
  return (
    <motion.div className={styles.loadingOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <section className={styles.loadingContent}>
        <article className={styles.starsContainer}>
          {["⭐", "🌟", "⭐"].map((star, index) => (
            <motion.span
              key={`star-${index + 1}`}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            >
              {star}
            </motion.span>
          ))}
        </article>
        <p>{message}</p>
      </section>
    </motion.div>
  );
}
