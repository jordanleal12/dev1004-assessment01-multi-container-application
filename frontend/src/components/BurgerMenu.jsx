import { bubble as Menu } from "react-burger-menu";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/images/navbarlogo215px.png";
import Login from "./modals/Login";
import Logout from "./modals/Logout";
import "../components/styles/BurgerMenu.scss";
import { useAuthContext } from "../contexts/useAuthContext";
import { ROUTES } from "../utilities/constants/routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faTrophy,
  faPlayCircle,
  faInfoCircle,
  faSignInAlt,
  faSignOutAlt,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

export default function BurgerMenu() {
  const { isAuthenticated } = useAuthContext();
  const [showLogin, setShowLogin] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Event handler to open login modal and close menu on click
  const handleLoginClick = () => {
    setShowLogin(true);
    setMenuOpen(false);
  };
  // Event handler to open logout modal and close menu on click
  const handleLogoutClick = () => {
    setShowLogout(true);
    setMenuOpen(false);
  };
  // Update menu open state on state change
  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };
  // Event handler to change menu state to closed
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <Menu isOpen={menuOpen} onStateChange={handleStateChange} width={350}>
      <NavLink to={ROUTES.HOME} onClick={closeMenu}>
        <FontAwesomeIcon icon={faHome} />
        Home
      </NavLink>
      {isAuthenticated && (
        <NavLink to={ROUTES.PROFILE} onClick={closeMenu}>
          <FontAwesomeIcon icon={faUser} />
          My Profile
        </NavLink>
      )}
      <NavLink to={ROUTES.LEADERBOARD} onClick={closeMenu}>
        <FontAwesomeIcon icon={faTrophy} />
        Leaderboard
      </NavLink>
      <NavLink to={ROUTES.REEL_CANON} onClick={closeMenu}>
        <FontAwesomeIcon icon={faPlayCircle} />
        The Reel Canon
      </NavLink>
      <NavLink to={ROUTES.ABOUT} onClick={closeMenu}>
        <FontAwesomeIcon icon={faInfoCircle} />
        About
      </NavLink>
      {isAuthenticated || (
        <NavLink to={ROUTES.REGISTER} onClick={closeMenu}>
          <FontAwesomeIcon icon={faUserPlus} />
          Register
        </NavLink>
      )}
      {isAuthenticated && (
        <a href="#" role="button" onClick={handleLogoutClick}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          Logout
        </a>
      )}
      {!isAuthenticated && (
        <a href="#" role="button" onClick={handleLoginClick}>
          <FontAwesomeIcon icon={faSignInAlt} />
          Login
        </a>
      )}
      <Login isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <Logout isOpen={showLogout} onClose={() => setShowLogout(false)} />
      <img src={logo} alt="Logo" />
      <p>&copy; 2025 The Century Screening Room.</p>
    </Menu>
  );
}
