import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "../../ui/Button/Button";
import "./NavigationBar.css";

const NavigationBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <header className="navbar">
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
          <Button url="/login" text="Sign in" imageUrl="./user-icon.svg" />
          <Link to="/cart">
            <img src="/SVGRepo_shopping_cart.svg" alt="Shopping cart" />
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="mobile-navbar-column-end">
          <Link to="/cart">
            <img src="/SVGRepo_shopping_cart.svg" alt="Shopping cart" />
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

        {/* Mobile Menu Dropdown */}
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
              <Button url="/login" text="Sign in" imageUrl="./user-icon.svg" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavigationBar;
