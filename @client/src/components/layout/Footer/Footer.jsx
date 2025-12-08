import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="footer-logo">
        <Link to="/">
          <img src="/Pizzaweb-logo.svg" alt="Pizzaweb logo" />
        </Link>
      </div>
      <div className="footer-nav-links">
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
      </div>
      <div className="footer-copyright">
        <small>Copyright ©2025 All right served | Project Grupp Sex </small>
      </div>
    </footer>
  );
};

export default Footer;
