"use client";

import { cn } from "@/lib/cn";
import { useLanguage } from "@/hooks/use-language";

export function LanguageSwitch({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      className={cn("facet-sm inline-flex border-2 border-line bg-panel text-xs font-bold", className)}
      role="radiogroup"
      aria-label={t.language.label}
    >
      {(["en", "ar"] as const).map((code) => (
        <button
          key={code}
          type="button"
          role="radio"
          aria-checked={lang === code}
          onClick={() => setLang(code)}
          className={cn(
            "px-3 py-1.5 transition-colors",
            lang === code ? "bg-accent text-white" : "text-ink hover:bg-white/10",
          )}
        >
          {t.language[code]}
        </button>
      ))}
    </div>
  );
}
