// src/components/layout/Navigation/NavigationBar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useCart } from "../../../context/CartContext.jsx";
import "./NavigationBar.css";
import Button from "../../ui/Button/Button.jsx";
import CartSidebar from "../CartSidebar/CartSidebar.jsx";
import { Modal } from "../../Modal/Modal/Modal.jsx"; // This is your dialog-based modal

const NavigationBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [modalWindow, setModalWindow] = useState(null);
  const location = useLocation();
  const { user } = useAuth();
  const { getCartItemCount } = useCart();

  const cartItemCount = getCartItemCount();
  const signInRef = React.useRef(null);
  const openModal = () => {
    document.body.style.overflow = "hidden";
    signInRef.current.showModal();
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <header className="navbar">
      <Modal
        ref={signInRef}
        window={modalWindow}
        setModalWindow={setModalWindow}
        isLoading2FA={false}
        twoFactorError={""}
        on2FASetupSubmit={() => {}}
        on2FADisableSubmit={() => {}}
      />
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
              <a
                className="make-your-own-pizza"
                onClick={() => setModalWindow("MakeYourOwnPizza")}
              >
                Luo oma pizza
              </a>
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
              onClick={() => setModalWindow("SignIn")}
              text={"Sign in"}
              imageUrl={"./user-icon.svg"}
            />
          )}

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
                  <Link to="/omapizza">Luo oma pizza</Link>
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
                  text={"Sign in"}
                  imageUrl={"./user-icon.svg"}
                  onClick={() => openModal()}
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
