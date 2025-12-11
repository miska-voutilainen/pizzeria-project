import { useState, useEffect } from "react";
import { LANGUAGES, getTranslations } from "../localization/i18n";
import LanguageContext from "./LanguageContextValue";

const LanguageProvider = ({ children }) => {
  // Get stored language or detect browser language
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem("language");
    if (stored && Object.values(LANGUAGES).includes(stored)) {
      return stored;
    }

    // Try to detect browser language
    const browserLang = navigator.language.startsWith("fi")
      ? LANGUAGES.FI
      : LANGUAGES.EN;
    return browserLang;
  });

  // Set translations for the selected language
  const [translations, setTranslations] = useState(() =>
    getTranslations(language)
  );

  // Change language and update localStorage and translations
  const changeLanguage = (newLanguage) => {
    if (Object.values(LANGUAGES).includes(newLanguage)) {
      setLanguage(newLanguage);
      setTranslations(getTranslations(newLanguage));
      localStorage.setItem("language", newLanguage); // Save language in localStorage
    }
  };

  // Translation function to get the appropriate translation for a key
  const t = (key) => {
    return key.split(".").reduce((obj, k) => obj?.[k], translations) || key;
  };

  // Update translations whenever the language changes
  useEffect(() => {
    setTranslations(getTranslations(language));
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{ language, changeLanguage, t, translations }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
