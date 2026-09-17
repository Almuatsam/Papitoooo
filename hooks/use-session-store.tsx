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
import type { Frame, LayoutId, SessionSettings, StripThemeId, View } from "@/types";

const THEME_STORAGE_KEY = "photobooth.themeId";
const LAYOUT_STORAGE_KEY = "photobooth.layoutId";

const DEFAULT_THEME: StripThemeId = "boarding-pass";
const DEFAULT_LAYOUT: LayoutId = "strip-4";

const VALID_THEMES: StripThemeId[] = [
  "festival-poster",
  "streaming-card",
  "arcade-corkboard",
  "doodle-diary",
  "boarding-pass",
  "receipt",
  "par-avion",
];

const VALID_LAYOUTS: LayoutId[] = [
  "strip-3",
  "strip-4",
  "grid-6",
  "single-portrait",
  "single-landscape",
  "triple-horizontal",
  "asymmetric-3",
  "asymmetric-4",
  "double-strip-4",
];

function defaultSettings(): SessionSettings {
  return {
    filterId: "natural",
    themeId: DEFAULT_THEME,
    layoutId: DEFAULT_LAYOUT,
    borderColor: "",
    bgColor: "",
    caption: "",
    subtitle: "",
    showDate: true,
    stickers: [],
    // Fresh per session (mount + reset()); retake() preserves it by design
    // so the decoration composition stays put across a retake.
    decorSeed: Math.random(),
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
  /** Only meaningful before capture starts — it determines shot count. */
  setLayout: (layoutId: LayoutId) => void;
  /** Keep settings, drop frames, back to camera for another take. */
  retake: () => void;
  /** Full reset back to home (keeps the chosen theme + layout). */
  reset: () => void;
}

const SessionContext = createContext<SessionStore | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("home");
  const [frames, setFrames] = useState<Frame[]>([]);
  const [settings, setSettings] = useState<SessionSettings>(defaultSettings);

  // Apply a previously-chosen vibe/layout after mount only, so the very
  // first client render always matches the server-rendered default (no
  // hydration mismatch), then persist future changes.
  const [hydratedTheme, setHydratedTheme] = useState(false);
  useEffect(() => {
    if (hydratedTheme) return;
    setHydratedTheme(true);
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as StripThemeId | null;
      const storedLayout = window.localStorage.getItem(LAYOUT_STORAGE_KEY) as LayoutId | null;
      setSettings((prev) => ({
        ...prev,
        themeId: storedTheme && VALID_THEMES.includes(storedTheme) ? storedTheme : prev.themeId,
        layoutId: storedLayout && VALID_LAYOUTS.includes(storedLayout) ? storedLayout : prev.layoutId,
      }));
    } catch {
      // localStorage unavailable — fall back to the defaults.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydratedTheme) return;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, settings.themeId);
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, settings.layoutId);
    } catch {
      // localStorage unavailable (private mode etc.) — just won't persist.
    }
  }, [settings.themeId, settings.layoutId, hydratedTheme]);

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

  const setLayout = useCallback((layoutId: LayoutId) => {
    setSettings((prev) => ({ ...prev, layoutId }));
  }, []);

  const retake = useCallback(() => {
    setFrames([]);
    setSettings((prev) => ({ ...prev, stickers: [] }));
    setView("camera");
  }, []);

  const reset = useCallback(() => {
    setFrames([]);
    setSettings((prev) => ({ ...defaultSettings(), themeId: prev.themeId, layoutId: prev.layoutId }));
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
      setLayout,
      retake,
      reset,
    }),
    [view, frames, settings, goHome, goCamera, finishSession, updateSettings, setTheme, setLayout, retake, reset],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionStore {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
