"use client";

import { useEffect } from "react";
import { useLang } from "../contexts/LanguageContext";

export default function BodyLangSync() {
  const { lang } = useLang();

  useEffect(() => {
    document.body.setAttribute("data-lang", lang);
  }, [lang]);

  return null;
}
