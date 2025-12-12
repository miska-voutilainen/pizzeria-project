import { useState, useEffect } from "react";
import { LANGUAGES, getTranslations } from "../localization/i18n";
import LanguageContext from "./LanguageContextValue";

const LanguageProvider = ({ children }) => {
  // Get stored language or detect browser language
  const [language, setLanguage] = useState(() => {
    // 1) Check URL param ?lang=
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang");
      if (urlLang && Object.values(LANGUAGES).includes(urlLang)) {
        return urlLang;
      }
    } catch (e) {
      // ignore on non-browser env
    }

    // 2) fallback to localStorage
    const stored = localStorage.getItem("language");
    if (stored && Object.values(LANGUAGES).includes(stored)) {
      return stored;
    }

    // 3) Try to detect browser language
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
      // Update the URL so links show the chosen language (preserve other params)
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("lang", newLanguage);
        window.history.replaceState({}, "", url.toString());
      } catch (e) {
        // ignore if URL API not available
      }
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

  // Sync language if user navigates history or URL changes externally
  useEffect(() => {
    const onPop = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get("lang");
        if (
          urlLang &&
          Object.values(LANGUAGES).includes(urlLang) &&
          urlLang !== language
        ) {
          setLanguage(urlLang);
          setTranslations(getTranslations(urlLang));
          localStorage.setItem("language", urlLang);
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
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
