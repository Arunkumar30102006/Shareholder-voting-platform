import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';

// Initialize i18n synchronously with English translations
// so that server-rendered HTML (SSG) and client hydration match 1:1,
// preventing React hydration errors #425, #418, and #423.
i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: (enTranslation as any).translation || enTranslation,
            },
        },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export default i18n;

