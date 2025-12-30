"use client";

import { useEffect } from "react";
import { initI18n } from "@/lib/i18n";

export default function I18nProvider({ children }) {
  useEffect(() => {
    initI18n();
  }, []);

  return children;
}
