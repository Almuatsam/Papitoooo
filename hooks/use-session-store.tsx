"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Frame, SessionSettings, View } from "@/types";

const DEFAULT_SETTINGS: SessionSettings = {
  filterId: "natural",
  styleId: "classic",
  borderColor: "",
  bgColor: "",
  caption: "",
  showDate: true,
};

interface SessionStore {
  view: View;
  frames: Frame[];
  settings: SessionSettings;
  goHome: () => void;
  goCamera: () => void;
  /** Called by the capture flow once all four frames are in. */
  finishSession: (frames: Frame[]) => void;
  updateSettings: (patch: Partial<SessionSettings>) => void;
  /** Keep settings, drop frames, back to camera for another take. */
  retake: () => void;
  /** Full reset back to home. */
  reset: () => void;
}

const SessionContext = createContext<SessionStore | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("home");
  const [frames, setFrames] = useState<Frame[]>([]);
  const [settings, setSettings] = useState<SessionSettings>(DEFAULT_SETTINGS);

  const goHome = useCallback(() => setView("home"), []);
  const goCamera = useCallback(() => setView("camera"), []);

  const finishSession = useCallback((next: Frame[]) => {
    setFrames(next);
    setView("result");
  }, []);

  const updateSettings = useCallback((patch: Partial<SessionSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const retake = useCallback(() => {
    setFrames([]);
    setView("camera");
  }, []);

  const reset = useCallback(() => {
    setFrames([]);
    setSettings(DEFAULT_SETTINGS);
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
      retake,
      reset,
    }),
    [view, frames, settings, goHome, goCamera, finishSession, updateSettings, retake, reset],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionStore {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
