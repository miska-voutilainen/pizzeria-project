import enCommon from './en/common.json';
import fiCommon from './fi/common.json';

const translations = {
  en: enCommon,
  fi: fiCommon,
};

export const LANGUAGES = {
  EN: 'en',
  FI: 'fi',
};

export const DEFAULT_LANGUAGE = 'en';

/**
 * Get a translation string by key
 * @param {string} key - The translation key (e.g., 'navigation.home')
 * @param {string} language - The language code (en or fi)
 * @returns {string} The translated string or the key if not found
 */
export const t = (key, language = DEFAULT_LANGUAGE) => {
  const translation = key.split('.').reduce((obj, k) => obj?.[k], translations[language]);
  return translation || key;
};

/**
 * Get all translations for a language
 * @param {string} language - The language code
 * @returns {object} The translations object
 */
export const getTranslations = (language = DEFAULT_LANGUAGE) => {
  return translations[language] || translations[DEFAULT_LANGUAGE];
};

/**
 * Check if a language is supported
 * @param {string} language - The language code
 * @returns {boolean}
 */
export const isLanguageSupported = (language) => {
  return Object.values(LANGUAGES).includes(language);
};
