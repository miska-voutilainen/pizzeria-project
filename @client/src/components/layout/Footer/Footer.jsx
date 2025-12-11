import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <>
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
                <Link to="/create-pizza">Create your own pizza</Link>
              </li>
              <li>
                <Link to="/about">About us</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="footer-copyright">
          <small>
            Copyright ©2025 All rights reserved | Project Group Sex{" "}
          </small>
        </div>
      </footer>
    </>
  );
};

export default Footer;
