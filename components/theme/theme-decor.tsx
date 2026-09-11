"use client";

import { useSession } from "@/hooks/use-session-store";
import { ClassicDecor } from "@/components/theme/decor/classic";
import { Y2kCameraDecor } from "@/components/theme/decor/y2k-camera";
import { GlitterScrapbookDecor } from "@/components/theme/decor/glitter-scrapbook";
import { PopMagazineDecor } from "@/components/theme/decor/pop-magazine";
import { RetroInternetDecor } from "@/components/theme/decor/retro-internet";
import { CuteBoothDecor } from "@/components/theme/decor/cute-booth";
import type { StripThemeId } from "@/types";

export type DecorSlot = "home" | "camera" | "panel";

export interface ThemeDecorSet {
  /** Decoration for the Home screen. */
  Home?: () => React.ReactNode;
  /** Decoration wrapped around the live camera stage. */
  Camera?: () => React.ReactNode;
  /** Small accents for panel-style containers (controls, customizer). */
  Panel?: () => React.ReactNode;
}

const REGISTRY: Record<StripThemeId, ThemeDecorSet> = {
  classic: ClassicDecor,
  "y2k-camera": Y2kCameraDecor,
  "glitter-scrapbook": GlitterScrapbookDecor,
  "pop-magazine": PopMagazineDecor,
  "retro-internet": RetroInternetDecor,
  "cute-booth": CuteBoothDecor,
};

/** Renders the active theme's decoration for one named slot, or nothing. */
export function ThemeChrome({ slot }: { slot: DecorSlot }) {
  const { settings } = useSession();
  const set = REGISTRY[settings.themeId];
  const key = slot === "home" ? "Home" : slot === "camera" ? "Camera" : "Panel";
  const Comp = set[key];
  return Comp ? <>{Comp()}</> : null;
}
