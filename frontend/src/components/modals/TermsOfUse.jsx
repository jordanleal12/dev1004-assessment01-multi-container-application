import CustomModal from "./CustomModal";
import styles from "../styles/Modals.module.scss";
import GitHubLogo from "../../assets/images/github-mark-white.png";

function Terms({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    // Modal
    <CustomModal isOpen={isOpen} onRequestClose={onClose}>
      {/* Close button :D */}
      <button
        type="button"
        onClick={onClose}
        className={styles.closeButton}
        aria-label="Close pop-up"
      >
        {" "}
        x{" "}
      </button>
      <section className={styles.modalForm}>
        <section>
          <h2>Terms of Use</h2>
          <h1>Be Kind, Be Fair, Have Fun!</h1>
          <article className={styles.generalMessage}>
            <p>
              This site is intended for purely educational purposes, and at this stage of
              development is maintained by three student developers, please use the site with care.
            </p>
            <p>
              If anyone acts unkindly towards other users, or ourselves, we reserve the right to
              barr access to the site.
            </p>
            <p>Mainly just be nice and chill and you'll be fine!</p>
          </article>
        </section>
        <section>
          <h2>Contributing</h2>
          <article className={styles.generalMessage}>
            <h3>If you'd like to contribute, please read below:</h3>
            <ul>
              <li>
                <b>Branching and Forking:</b>
              </li>
              <li>
                Fork the repository and create feature branches from main using descriptive names
                (feature/user-auth, fix/rating-bug)
              </li>
              <li>
                <b>Conventional Commits:</b>
              </li>
              <li>
                Follow conventional commit format (feat:, fix:, docs:, style:, refactor:, test:,
                chore:) for clear commit history
              </li>
              <li>
                <b>Pull Requests:</b>
              </li>
              <li>
                Pull requests with no explanation will not be merged, please leave detailed comments
                in your code!
              </li>
              <li>
                <b>Issues:</b>
              </li>
              <li>Issues must be clear and concise, vague issues are non-issues!</li>
            </ul>
            <p>Then head over to our team's GitHub and reach out!</p>
            <a
              href="https://github.com/CoderAcademy-DEV-MERN-Group"
              target="_blank"
              className={styles.navItem}
            >
              <img className={styles.gitHubLogo} src={GitHubLogo} alt="GitHub Logo white" />{" "}
              Joss-Nhi-Jordan GitHub Organization
            </a>
          </article>
        </section>
      </section>
    </CustomModal>
  );
}

export default Terms;
