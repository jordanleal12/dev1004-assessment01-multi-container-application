import { useState } from "react";
import ContactUs from "../../components/modals/ContactUs";
import JossImg from "../../assets/images/Joss.jpg";
import JordanImg from "../../assets/images/Jordan.jpg";
import NhiImg from "../../assets/images/Nhi.png";
import GitHubLogo from "../../assets/images/github-mark-white.png";
import styles from "./About.module.scss";

export default function About() {
  const [showContact, setShowContact] = useState(false);

  return (
    <main className={styles.aboutPage}>
      <h1>Everything, Everyone, All At Once!</h1>

      <section className={styles.aboutTheSite}>
        <h2>The Century Screening Room</h2>
        <p>
          The Century Screening Room is a social movie collection platform built around the
          foundational goal of completing a curated list of 100 hand picked movies by our developer
          Joss, known as "The Reel Canon". Users can register and create their own profile to track
          their progress of watched movies via a Reel Score, mark them as watched and then rate the
          movies.
        </p>
        <p>
          Whether you're a movie enthusiast, a competitor, a collector, someone who loves movies, or
          simple hate the feeling of being stuck choosing the next movie to watch, the Reel Canon
          offers 100 movies to choose from! Connect with friends and share your movie experiences
          and compete to see who can complete the 100 movies first! Check your ranking to see how
          you compare amongst other users on the Leaderboard.
        </p>
        <p>
          This is the very first release version of The Century Screening Room. Stay tuned for more
          exciting features and updates!
        </p>
      </section>

      <section className={styles.aboutUs}>
        <article className={styles.aboutCard}>
          <h2>Joss</h2>
          <img src={JossImg} alt="Joss" />
          <p>
            Joss is an all rounder, but had a big influence on the Reel Canon and the user
            experience site-wide!
          </p>
          <a href="https://github.com/truth-josstice" target="_blank">
            <img className={styles.gitHubLogo} src={GitHubLogo} alt="GitHub Logo white" />{" "}
            truth-josstice on GitHub
          </a>
        </article>

        <article className={styles.aboutCard}>
          <h2>Jordan</h2>
          <img src={JordanImg} alt="Jordan" />
          <p>
            Jordan is a tester and framework dynamo, making the granular components that help this
            site run in the background!
          </p>
          <a href="https://github.com/jordanleal12" target="_blank">
            <img className={styles.gitHubLogo} src={GitHubLogo} alt="GitHub Logo white" />{" "}
            jordanleal12 on GitHub
          </a>
        </article>

        <article className={styles.aboutCard}>
          <h2>Nhi</h2>
          <img src={NhiImg} alt="Nhi" />
          <p>
            Nhi is enthusiastic and loves styling! She helped finesse the final colours and theming
            for this site!
          </p>
          <a href="https://github.com/lulu-codes" target="_blank">
            <img className={styles.gitHubLogo} src={GitHubLogo} alt="GitHub Logo white" /> lulucodes
            on GitHub
          </a>
        </article>
      </section>

      <section className={styles.contactUs}>
        <h2>Get In Touch</h2>
        <p>
          Wondering why these 100 movies? Want to know what's coming in the future updates for the
          site? Want to know how we managed to pull this off as beginner devs?
        </p>
        <p>Get in touch with us below!</p>
        <p>
          P.S: Joss is the curator of the list of 100 movies in the Reel Canon, so if you didn't
          enjoy the list, you have some suggestions, or you just want to talk movies...let us know
          and blame him! 😂
        </p>
        <button className={styles.contactButton} onClick={() => setShowContact(true)}>
          Contact Us
        </button>
        <ContactUs isOpen={showContact} onClose={() => setShowContact(false)} />
      </section>
    </main>
  );
}
