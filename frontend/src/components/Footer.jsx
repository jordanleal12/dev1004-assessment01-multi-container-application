import { useState } from "react";
import ContactUs from "./modals/ContactUs";
import AboutUs from "./modals/AboutUs";
import Terms from "./modals/TermsOfUse";
import styles from "../components/styles/Footer.module.scss";

function Footer() {
  const [showContact, setShowContact] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <footer className={styles.footer}>
      <section className={styles.footerLinks}>
        <button onClick={() => setShowAboutUs(true)} className={styles.footerButtons}>
          About Us
        </button>
        <button onClick={() => setShowTerms(true)} className={styles.footerButtons}>
          Terms of Use
        </button>
        <button onClick={() => setShowContact(true)} className={styles.footerButtons}>
          Contact Us
        </button>

        <ContactUs isOpen={showContact} onClose={() => setShowContact(false)} />
        <AboutUs isOpen={showAboutUs} onClose={() => setShowAboutUs(false)} />
        <Terms isOpen={showTerms} onClose={() => setShowTerms(false)} />
      </section>

      <section className={styles.footerCopyright}>
        <p>
          &copy; 2025 The Century Screening Room. Licensed under{" "}
          <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer">
            MIT License
          </a>
          .
        </p>
      </section>

      <div className={styles.footerSpacer} />
    </footer>
  );
}

export default Footer;
