"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Guard initialization to ensure it only runs once and properly handles SSR/RSC environments
if (!i18n.isInitialized) {
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
            },
            detection: {
                // Ensure detector doesn't crash during SSR
                order: ['querystring', 'cookie', 'localStorage', 'navigator'],
                caches: ['localStorage', 'cookie'],
            }
        });
}

export default i18n;
