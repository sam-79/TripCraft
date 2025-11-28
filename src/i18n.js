// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend) // load translations from public folder
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // pass to react-i18next
  .init({
    fallbackLng: 'English', // default language
    supportedLngs: ['English', 'Hindi', "Marathi", "Bengali", "Gujarati", "Kannada", "Malayalam", "Punjabi", "Tamil", "Telegu"], // match folder names
    ns: ['translation'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React escapes by default
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // points to /public/locales/.../translation.json
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    saveMissing: true, // allow sending missing keys to backend
  });

export default i18n;
