import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext.jsx";
import { useCart } from "../../../../context/CartContext.jsx";
import "./NavigationBar.css";
import pizzaWebLogo from "../../../../assets/images/Pizzaweb-logo.svg";

import Button from "../../../ui/Button/Button.jsx";
import CartSidebar from "../../CartSidebar/CartSidebar.jsx";
import { Modal } from "../../../Modal/Modal/Modal.jsx"; // This is your dialog-based modal

const NavigationBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const location = useLocation();
  const { user } = useAuth();
  const { getCartItemCount } = useCart();

  const cartItemCount = getCartItemCount();

  // Ref for the auth modal (always rendered)
  const signInRef = React.useRef(null);

  // Function to open the Sign In modal
  const openSignInModal = () => {
    document.body.style.overflow = "hidden";
    signInRef.current?.showModal();
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <header className="navbar">
      {/* AUTH MODAL – ALWAYS RENDERED (hidden until opened) */}
      <Modal
        ref={signInRef}
        window="SignIn" // Starts on Sign In tab
        redirectPath={location.pathname} // So user returns here after login
      />

      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-row-start">
          <Link to="/">
            <img src={pizzaWebLogo} alt="Pizzaweb logo" />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="navbar-links">
          <ul>
            <li>
              <Link to="/menu">Menu</Link>
            </li>
            <li>
              <Link to="/create-pizza">Create your own pizza</Link>
            </li>
            <li>
              <Link to="/about">About us</Link>
            </li>
          </ul>
        </nav>

        {/* Desktop Right Side – User + Cart */}
        <div className="navbar-row-end">
          {/* User Button */}
          {user ? (
            <Button
              url="/user"
              text={user.username}
              imageUrl="./user-icon.svg"
            />
          ) : (
            <Button
              onClick={openSignInModal}
              text="Sign in"
              imageUrl="./user-icon.svg"
            />
          )}

          {/* Cart Button */}
          <button
            className="nav-cart-button"
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
          >
            <img src="/SVGRepo_shopping_cart.svg" alt="Cart" />
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="mobile-navbar-column-end">
          <button
            className="nav-cart-button"
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
          >
            <img src="/SVGRepo_shopping_cart.svg" alt="Cart" />
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </button>

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
                  <Link to="/create-pizza">Create your own pizza</Link>
                </li>
                <li>
                  <Link to="/about">About us</Link>
                </li>
              </ul>
            </nav>

            <div className="mobile-menu-column-end">
              {user ? (
                <Button
                  url="/user"
                  text={user.username}
                  imageUrl="./user-icon.svg"
                />
              ) : (
                <Button
                  text="Sign in"
                  imageUrl="./user-icon.svg"
                  onClick={openSignInModal} // Works perfectly on mobile too
                />
              )}
            </div>
          </div>
        )}

        {/* Cart Sidebar */}
        <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </header>
  );
};

export default NavigationBar;
