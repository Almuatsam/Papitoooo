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
import type { Frame, SessionSettings, StripThemeId, View } from "@/types";

const THEME_STORAGE_KEY = "photobooth.themeId";

const DEFAULT_THEME: StripThemeId = "y2k-camera";

const VALID_THEMES: StripThemeId[] = [
  "classic",
  "y2k-camera",
  "glitter-scrapbook",
  "pop-magazine",
  "retro-internet",
  "cute-booth",
];

function defaultSettings(): SessionSettings {
  return {
    filterId: "natural",
    themeId: DEFAULT_THEME,
    borderColor: "",
    bgColor: "",
    caption: "",
    showDate: true,
    stickers: [],
  };
}

interface SessionStore {
  view: View;
  frames: Frame[];
  settings: SessionSettings;
  goHome: () => void;
  goCamera: () => void;
  /** Called by the capture flow once all four frames are in. */
  finishSession: (frames: Frame[]) => void;
  updateSettings: (patch: Partial<SessionSettings>) => void;
  setTheme: (themeId: StripThemeId) => void;
  /** Keep settings, drop frames, back to camera for another take. */
  retake: () => void;
  /** Full reset back to home (keeps the chosen theme). */
  reset: () => void;
}

const SessionContext = createContext<SessionStore | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("home");
  const [frames, setFrames] = useState<Frame[]>([]);
  const [settings, setSettings] = useState<SessionSettings>(defaultSettings);

  // Apply a previously-chosen vibe after mount only, so the very first
  // client render always matches the server-rendered default (no hydration
  // mismatch), then persist future changes.
  const [hydratedTheme, setHydratedTheme] = useState(false);
  useEffect(() => {
    if (hydratedTheme) return;
    setHydratedTheme(true);
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as StripThemeId | null;
      if (stored && VALID_THEMES.includes(stored)) {
        setSettings((prev) => ({ ...prev, themeId: stored }));
      }
    } catch {
      // localStorage unavailable — fall back to the default theme.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydratedTheme) return;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, settings.themeId);
    } catch {
      // localStorage unavailable (private mode etc.) — theme just won't persist.
    }
  }, [settings.themeId, hydratedTheme]);

  const goHome = useCallback(() => setView("home"), []);
  const goCamera = useCallback(() => setView("camera"), []);

  const finishSession = useCallback((next: Frame[]) => {
    setFrames(next);
    setView("result");
  }, []);

  const updateSettings = useCallback((patch: Partial<SessionSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const setTheme = useCallback((themeId: StripThemeId) => {
    setSettings((prev) => ({ ...prev, themeId }));
  }, []);

  const retake = useCallback(() => {
    setFrames([]);
    setSettings((prev) => ({ ...prev, stickers: [] }));
    setView("camera");
  }, []);

  const reset = useCallback(() => {
    setFrames([]);
    setSettings((prev) => ({ ...defaultSettings(), themeId: prev.themeId }));
    setView("home");
  }, []);

  const value = useMemo<SessionStore>(
    () => ({
      view,
      frames,
      settings,
      goHome,
      goCamera,
      finishSession,
      updateSettings,
      setTheme,
      retake,
      reset,
    }),
    [view, frames, settings, goHome, goCamera, finishSession, updateSettings, setTheme, retake, reset],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionStore {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
