// src/components/layout/Navigation/NavigationBar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import "./NavigationBar.css";
import Button from "../../ui/Button/Button.jsx";
import {Modal} from "../../authModal/Modal/Modal.jsx";

const NavigationBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
    const signInRef = React.useRef(null);
    const openModal = () => {
        document.body.style.overflow = "hidden";
        signInRef.current.showModal ()
    }

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <header className="navbar">
        <Modal ref={signInRef}/>
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-row-start">
          <Link to="/">
            <img src="/Pizzaweb-logo.svg" alt="Pizzaweb logo" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="navbar-links">
          <ul>
            <li>
              <Link to="/menu">Menu</Link>
            </li>
            <li>
              <Link to="/omapizza">Luo oma pizza</Link>
            </li>
            <li>
              <Link to="/about">About us</Link>
            </li>
          </ul>
        </nav>

        {/* Desktop Right Side */}
        <div className="navbar-row-end">
          {/* USER BUTTON — Logged in */}
          {user ? (
            // <Link to="/user" className="user-profile-button">
            //   <span className="user-name">{user.username}</span>
            //   <svg
            //     className="user-icon"
            //     viewBox="0 0 24 24"
            //     width="24"
            //     height="24"
            //     stroke="currentColor"
            //     fill="none"
            //   >
            //     <circle cx="12" cy="7" r="4" />
            //     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            //   </svg>
            // </Link>
            <Button
              url={"/user"}
              text={user.username}
              imageUrl={"./user-icon.svg"}
            />
          ) : (
            /* SIGN IN — Not logged in */
            // <Link to="/login" className="signin-button">
            //   <span>Sign innnn</span>
            //   <img src="/user-icon.svg" alt="" className="signin-icon" />
            // </Link>
            <Button
              onClick={() => openModal()}
              text={"Sign in"}
              imageUrl={"./user-icon.svg"}
            />
          )}

          <Link to="/cart" className="cart-link">
            <img src="/SVGRepo_shopping_cart.svg" alt="Cart" />
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="mobile-navbar-column-end">
          <Link to="/cart">
            <img src="/SVGRepo_shopping_cart.svg" alt="Cart" />
          </Link>
          <button
            className="menuButton"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <img className="close-icon" src="./close-light.svg" alt="Close" />
            ) : (
              <img src="./hamburger-menu.svg" alt="Menu" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mobileMenu">
            <nav>
              <ul>
                <li>
                  <Link to="/menu">Menu</Link>
                </li>
                <li>
                  <Link to="/omapizza">Luo oma pizza</Link>
                </li>
                <li>
                  <Link to="/about">About us</Link>
                </li>
              </ul>
            </nav>

            <div className="mobile-menu-column-end">
              {user ? (
                // <Link to="/user" className="mobile-user-profile-button">
                //   <span>{user.username}</span>
                //   <svg
                //     className="user-icon"
                //     viewBox="0 0 24 24"
                //     width="24"
                //     height="24"
                //     stroke="currentColor"
                //     fill="none"
                //   >
                //     <circle cx="12" cy="7" r="4" />
                //     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                //   </svg>
                // </Link>
                <Button
                  url={"/user"}
                  text={user.username}
                  imageUrl={"./user-icon.svg"}
                />
              ) : (
                // <Link to="/login" className="mobile-signin-button">
                //   <span>Sign in</span>
                //   <img src="/user-icon.svg" alt="" />
                // </Link>
                <Button
                  text={"Sign in"}
                  imageUrl={"./user-icon.svg"}
                  onClick={() => openModal()}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavigationBar;
