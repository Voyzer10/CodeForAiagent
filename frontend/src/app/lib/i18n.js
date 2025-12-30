import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: {
                    common: {
                        save: 'Save',
                        cancel: 'Cancel',
                        loading: 'Loading...',
                        success: 'Success',
                        error: 'Error'
                    },
                    settings: {
                        title: 'Control Center'
                    }
                }
            }
        }
    });

export default i18n;
