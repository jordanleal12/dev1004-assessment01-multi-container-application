import { AnimatePresence, motion } from "framer-motion";
import styles from "../styles/LoadingScreenOverlay.module.scss";

export default function LoadingSpinner() {
  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className={styles.filmContainer}>
          <motion.div
            className={styles.filmReel}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            🎬
          </motion.div>
          <motion.p
            className={styles.loadingText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Preparing your reel...
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
