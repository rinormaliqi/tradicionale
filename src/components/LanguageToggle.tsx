"use client";

import { useLang } from "./Providers";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-line text-xs font-700">
      <button
        onClick={() => setLang("sq")}
        className={`px-3 py-1.5 transition-colors ${
          lang === "sq" ? "bg-brand text-white" : "bg-white text-muted hover:bg-surface"
        }`}
        aria-pressed={lang === "sq"}
      >
        SQ
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 transition-colors ${
          lang === "en" ? "bg-brand text-white" : "bg-white text-muted hover:bg-surface"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
