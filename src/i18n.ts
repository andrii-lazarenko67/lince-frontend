import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en';
import translationPT from './locales/pt';

// Translation resources
const resources = {
  en: {
    translation: translationEN
  },
  pt: {
    translation: translationPT
  }
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'pt', // Default language is Portuguese
    lng: 'pt', // Initial language
    debug: false,

    interpolation: {
      escapeValue: false // React already escapes values
    },

    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator'],

      // Keys or params to lookup language from
      lookupLocalStorage: 'i18nextLng',

      // Cache user language on
      caches: ['localStorage'],

      excludeCacheFor: ['cimode'] // Languages to not persist
    }
  });

export default i18n;
