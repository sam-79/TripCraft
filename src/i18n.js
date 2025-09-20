// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n.use(initReactI18next) // connects with React
    .use(LanguageDetector) // auto-detect language
    .use(Backend)
    .init({
        fallbackLng: 'English', // Changed from 'en' to match our file structure
        supportedLngs: ['English', 'Hindi'], // Add supported languages
        interpolation: {
            escapeValue: false, // React already escapes
        },
        saveMissing: true,
        backend: {
            // Path where resources get loaded from
            loadPath: '/locales/{{lng}}/translation.json'
        },
        detection: {
            // Order and from where user language should be detected
            order: ['localStorage', 'cookie', 'navigator'],
            caches: ['localStorage', 'cookie']
        }
    });

export default i18n;

