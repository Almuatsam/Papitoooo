"use client";

import { ChromeDecor } from "@/components/theme/decor/chrome";

export type DecorSlot = "home" | "camera" | "panel";

export interface ThemeDecorSet {
  /** Decoration for the Home screen. */
  Home?: () => React.ReactNode;
  /** Decoration wrapped around the live camera stage. */
  Camera?: () => React.ReactNode;
  /** Small accents for panel-style containers (controls, customizer). */
  Panel?: () => React.ReactNode;
}

/**
 * Renders the app's one unified chrome/neon decoration for a named slot.
 * The app shell no longer re-skins per strip theme (see lib/themes.ts) —
 * this is intentionally not keyed by `settings.themeId` any more.
 */
export function ThemeChrome({ slot }: { slot: DecorSlot }) {
  const key = slot === "home" ? "Home" : slot === "camera" ? "Camera" : "Panel";
  const Comp = ChromeDecor[key];
  return Comp ? <>{Comp()}</> : null;
}
