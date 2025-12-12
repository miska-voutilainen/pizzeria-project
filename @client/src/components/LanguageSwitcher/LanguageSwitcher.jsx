import React from "react";
import useLanguage from "../../context/useLanguage.jsx";
import "./LanguageSwitcher.css";

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  // URLs for flag images
  const fiFlag = "https://flagicons.lipis.dev/flags/4x3/fi.svg";
  const enFlag = "https://flagicons.lipis.dev/flags/4x3/gb.svg";

  return (
    <div className="language-switcher">
      {/* Button for English */}
      <button
        className={`lang-btn ${language === "en" ? "active" : ""}`}
        onClick={() => changeLanguage("en")}
        aria-pressed={language === "en"}
      >
        <img src={enFlag} alt="English" className="flag-icon" />
      </button>

      {/* Button for Finnish */}
      <button
        className={`lang-btn ${language === "fi" ? "active" : ""}`}
        onClick={() => changeLanguage("fi")}
        aria-pressed={language === "fi"}
      >
        <img src={fiFlag} alt="Finnish" className="flag-icon" />
      </button>
    </div>
  );
};

export default LanguageSwitcher;
