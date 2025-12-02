import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/pages/Navbar.css";
import { ShoppingCart, Menu, X } from "lucide-react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="navbar">
        {/* LEFT SIDE */}
        <div className="leftSide">
          <Link to="/">
            <img
              src="https://s3.eu-north-1.amazonaws.com/mahalna.images/logo.png"
              alt="logo"
            />
          </Link>
        </div>

        {/* CENTER LINKS (DESKTOP) */}
        <div className="center">
          <Link to="/menu"> Menu </Link>
          <Link to="/omapizza">Luo oma pizza</Link>
          <Link to="/about">About us</Link>
        </div>

        {/* RIGHT SIDE (DESKTOP) */}
        <div className="rightSide">
          <Link to="/login">Sign in</Link>
          <Link to="/cart">
            <ShoppingCart size={24} />
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button className="menuButton" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {menuOpen && (
        <div className="mobileMenu">
          <Link to="/menu">🍕 Our Menu</Link>
          <Link to="/omapizza">Luo oma pizza</Link>
          <Link to="/about">About us</Link>
          <Link to="/login">Sign in</Link>
          <Link to="/cart">
            <ShoppingCart size={18} /> Cart
          </Link>
        </div>
      )}
    </>
  );
}

export default Navbar;
