import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import Button from "../Button/Button";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
      <header className="navbar">
        <div class="navbar-container">
          <div className="navbar-row-start">
            <Link to="/">
              <img src="/Pizzaweb-logo.svg" alt="Pizzaweb logo" />
            </Link>
          </div>

          {/* CENTER LINKS (DESKTOP) */}
          <nav className="navbar-links">
            <ul>
              <li>
                <Link to="/menu"> Menu </Link>
              </li>
              <li>
                <Link to="/omapizza">Luo oma pizza</Link>
              </li>
              <li>
                <Link to="/about">About us</Link>
              </li>
            </ul>
          </nav>

          <div className="navbar-row-end">
            <Button
              url={"/login"}
              text={"Sign in"}
              imageUrl={"./user-icon.svg"}
            />
            <Link to="/cart">
              <img src="/SVGRepo_shopping_cart.svg" alt="Shopping cart icon" />
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button className="menuButton" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <img
                className="close-icon"
                src="./close-light.svg"
                alt="close button"
              />
            ) : (
              <img src="./hamburger-menu.svg" alt="hamburger menu" />
            )}
          </button>
          {/* MOBILE MENU DROPDOWN */}
          {menuOpen && (
            <div className="mobileMenu">
              <nav>
                <ul>
                  <li>
                    <Link to="/menu"> Menu </Link>
                  </li>
                  <li>
                    <Link to="/omapizza">Luo oma pizza</Link>
                  </li>
                  <li>
                    <Link to="/about">About us</Link>
                  </li>
                </ul>
              </nav>

              <div className="mobile-navbar-column-end">
                <ul>
                  <li>
                    <Button
                      url={"/login"}
                      text={"Sign in"}
                      imageUrl={"./user-icon.svg"}
                    />
                  </li>
                  <li>
                    <Link to="/cart">
                      <img
                        src="/SVGRepo_shopping_cart.svg"
                        alt="Shopping cart icon"
                      />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

export default Navbar;
