"use client";

import { useEffect } from "react";
import { useSession } from "@/hooks/use-session-store";

/**
 * Keeps `<html data-theme>` in sync with the active vibe. Every themed CSS
 * rule in app/globals.css keys off this attribute, so switching themes is a
 * single attribute swap — no remount, no per-component theme prop drilling.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSession();

  useEffect(() => {
    document.documentElement.dataset.theme = settings.themeId;
  }, [settings.themeId]);

  return <>{children}</>;
}
