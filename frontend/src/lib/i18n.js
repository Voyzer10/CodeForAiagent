import i18n from "i18next";
import { initReactI18next } from "react-i18next";

let initialized = false;

export function initI18n() {
    if (initialized) return i18n;

    i18n.use(initReactI18next).init({
        lng: "en",
        fallbackLng: "en",
        interpolation: { escapeValue: false },
        resources: {
            en: { translation: {} },
        },
    });

    initialized = true;
    return i18n;
}
