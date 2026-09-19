import type { StripThemeId } from "@/types";

/** Sections for the theme browser (components/result/theme-browser.tsx). */
export type ThemeCategoryId = "print-ticket" | "minimal" | "playful";

export interface ThemeCategory {
  id: ThemeCategoryId;
  themeIds: StripThemeId[];
}

export const THEME_CATEGORIES: ThemeCategory[] = [
  { id: "print-ticket", themeIds: ["boarding-pass", "receipt"] },
  // Single-item category — an established pattern here, not a leftover.
  { id: "minimal", themeIds: ["streaming-card"] },
  { id: "playful", themeIds: ["leopard-scrapbook", "zebra-stripes", "glitter-star"] },
];
