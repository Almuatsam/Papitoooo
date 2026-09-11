import { Film, Camera, Sparkles, Zap, Gamepad2, Heart, type LucideIcon } from "lucide-react";
import type { StripThemeId } from "@/types";

/** One icon per strip theme, used in the theme picker instead of emoji. */
export const THEME_ICONS: Record<StripThemeId, LucideIcon> = {
  classic: Film,
  "y2k-camera": Camera,
  "glitter-scrapbook": Sparkles,
  "pop-magazine": Zap,
  "retro-internet": Gamepad2,
  "cute-booth": Heart,
};
