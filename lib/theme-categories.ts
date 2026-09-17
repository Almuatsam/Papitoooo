import type { StripThemeId } from "@/types";

/** Sections for the theme browser (components/result/theme-browser.tsx). */
export type ThemeCategoryId = "print-ticket" | "bold-loud" | "minimal" | "playful";

export interface ThemeCategory {
  id: ThemeCategoryId;
  themeIds: StripThemeId[];
}

export const THEME_CATEGORIES: ThemeCategory[] = [
  { id: "print-ticket", themeIds: ["boarding-pass", "receipt", "par-avion"] },
  { id: "bold-loud", themeIds: ["festival-poster", "arcade-corkboard"] },
  { id: "minimal", themeIds: ["streaming-card"] },
  { id: "playful", themeIds: ["doodle-diary"] },
];
