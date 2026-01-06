import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/images/navbarlogo215px.png";
import Login from "./modals/Login";
import Logout from "./modals/Logout";
import styles from "../components/styles/Navbar.module.scss";
import { useAuthContext } from "../contexts/useAuthContext";
import {
  HOME,
  PROFILE,
  LEADERBOARD,
  REGISTER,
  REEL_CANON,
  ABOUT,
} from "../utilities/constants/routes";
import FriendRequestButton from "./FriendRequestButton";

function Header() {
  const { isAuthenticated } = useAuthContext();
  const [showLogin, setShowLogin] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  return (
    <header className={styles.navbar}>
      {/* Logo */}
      <NavLink to="/" className={styles.logo} end>
        <img className={styles.logoImg} src={logo} alt="Logo" />
      </NavLink>

      {/* Link section */}
      <nav className={styles.pageLinks}>
        <NavLink
          to={HOME}
          className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
        >
          Home
        </NavLink>

        {isAuthenticated && (
          <NavLink
            to={PROFILE}
            className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
          >
            My Profile
          </NavLink>
        )}

        <NavLink
          to={LEADERBOARD}
          className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
        >
          Leaderboard
        </NavLink>

        <NavLink
          to={REEL_CANON}
          className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
        >
          The Reel Canon
        </NavLink>

        <NavLink
          to={ABOUT}
          className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
        >
          About
        </NavLink>
      </nav>

      {/* Modal Buttons only appear when authentication is in the correct state*/}

      <nav className={styles.modalButtons}>
        {isAuthenticated ? (
          <>
            <FriendRequestButton />
            <button onClick={() => setShowLogout(true)} className={styles.userStateButtons}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setShowLogin(true)} className={styles.userStateButtons}>
              Sign In
            </button>

            <button onClick={() => navigate(REGISTER)} className={styles.userStateButtons}>
              Register
            </button>
          </>
        )}
        <Login isOpen={showLogin} onClose={() => setShowLogin(false)} />
        <Logout isOpen={showLogout} onClose={() => setShowLogout(false)} />
      </nav>
    </header>
  );
}

export default Header;
