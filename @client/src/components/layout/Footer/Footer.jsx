import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import MapModal from "../../Modal/mapModal/MapModal.jsx";

const Footer = () => {
  const mapRef = React.useRef(null);

  const openMap = () => {
    if (mapRef.current && typeof mapRef.current.showModal === "function") {
      document.body.style.overflow = "hidden";
      mapRef.current.showModal();
    }
  };

  const closeMap = () => {
    if (mapRef.current && typeof mapRef.current.close === "function") {
      mapRef.current.close();
      document.body.style.overflow = "";
    }
  };

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

        {/* Temporary button to open MapModal */}
        <div style={{ marginTop: "12px" }}>
          <button className="temporary-map-button" onClick={openMap}>
            Open Map (temp)
          </button>
        </div>

        <div className="footer-copyright">
          <small>
            Copyright ©2025 All rights reserved | Project Group Sex{" "}
          </small>
        </div>
      </footer>

      {/* Dialog instance for map modal (temporary) */}
      <dialog ref={mapRef} className="MapModal">
        <MapModal onClose={closeMap} />
      </dialog>
    </>
  );
};

export default Footer;
