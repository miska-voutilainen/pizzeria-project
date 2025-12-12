// src/components/layout/Navigation/NavigationBar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext.jsx";
import { useCart } from "../../../../context/CartContext.jsx";
import "./NavigationBar.css";
import useLanguage from "../../../../context/useLanguage.jsx";

import pizzaWebLogo from "../../../../assets/images/Pizzaweb-logo.svg";

import Button from "../../../ui/Button/Button.jsx";
import CartSidebar from "../../CartSidebar/CartSidebar.jsx";
import { Modal } from "../../../Modal/Modal/Modal.jsx"; // This is your dialog-based modal

const NavigationBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [modalWindow, setModalWindow] = useState(null);
  const location = useLocation();
  const { user } = useAuth();
  const { getCartItemCount } = useCart();
  const { t } = useLanguage();

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
      />
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-row-start">
          <Link to="/">
            <img src={pizzaWebLogo} alt="Pizzaweb logo" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="navbar-links">
          <ul>
            <li>
              <Link to="/menu">{t("navigation.menu")}</Link>
            </li>
            <li>
              <a
                className="make-your-own-pizza"
                onClick={() => setModalWindow("MakeYourOwnPizza")}
              >
                {t("products.makeYourOwn")}
              </a>
            </li>
            <li>
              <Link to="/about">{t("navigation.aboutUs")}</Link>
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
              text={t("auth.signIn")}
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
                  <Link to="/menu">{t("navigation.menu")}</Link>
                </li>
                <li>
                  <Link to="/omapizza">{t("products.makeYourOwn")}</Link>
                </li>
                <li>
                  <Link to="/about">{t("navigation.aboutUs")}</Link>
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
                  text={t("auth.signIn")}
                  imageUrl={"./user-icon.svg"}
                  onClick={() => setModalWindow("SignIn")}
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
