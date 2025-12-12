import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
// import MapModal from "../../Modal/mapModal/MapModal.jsx";
import LanguageSwitcher from "../../LanguageSwitcher/LanguageSwitcher.jsx";
import useLanguage from "../../../context/useLanguage.jsx";

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
  const { t } = useLanguage();
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
                <Link to="/menu">{t("footer.menu")}</Link>
              </li>
              <li>
                <Link to="/create-pizza">{t("footer.makeYourOwn")}</Link>
              </li>
              <li>
                <Link to="/about">{t("footer.aboutUs")}</Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Temporary button to open MapModal */}
        <div style={{ marginTop: "12px" }}>
          <button className="temporary-map-button" onClick={openMap}>
            {t("footer.openMap")}
          </button>
        </div>

        <div className="footer-copyright">
          <small>{t("footer.copyright")}</small>
          <LanguageSwitcher />
        </div>
      </footer>
    </>
  );
};

export default Footer;
