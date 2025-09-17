// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n.use(initReactI18next) // connects with React
    .use(LanguageDetector) // auto-detect language
    .use(Backend)
    .init({
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // React already escapes
        },
        saveMissing: true
    });

export default i18n;

