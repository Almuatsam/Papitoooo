"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en } from "@/lib/translations/en";
import { ar } from "@/lib/translations/ar";
import type { Direction, Lang } from "@/types";

const LANG_STORAGE_KEY = "photobooth.lang";

const DICTIONARIES = { en, ar };

function directionFor(lang: Lang): Direction {
  return lang === "ar" ? "rtl" : "ltr";
}

function loadStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    return stored === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

interface LanguageStore {
  lang: Lang;
  dir: Direction;
  t: typeof en;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageStore | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Read the persisted choice after mount (avoids an SSR/client markup mismatch).
  useEffect(() => {
    setLangState(loadStoredLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = directionFor(lang);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // localStorage unavailable — language just won't persist.
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);

  const value = useMemo<LanguageStore>(
    () => ({ lang, dir: directionFor(lang), t: DICTIONARIES[lang], setLang }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageStore {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
