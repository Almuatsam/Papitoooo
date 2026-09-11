import type { PatternId } from "@/lib/decor/patterns";
import type { TextureId } from "@/lib/decor/textures";
import type { StripThemeId } from "@/types";

export type StripDecoration = "none" | "tape" | "halftone-corners" | "checker-corners";

export type CaptionTreatment =
  | "plain"
  | "stamp"
  | "handwritten"
  | "cover-line"
  | "pixel"
  | "bubble";

export interface StripBackground {
  kind: "solid" | "pattern" | "texture" | "pattern+texture";
  patternId?: PatternId;
  textureId?: TextureId;
  /** true = use the theme accent2 as the pattern's second colour instead of ink. */
  patternUsesAccent?: boolean;
}

/**
 * Colours used when compositing this theme's strip. The app shell has one
 * fixed chrome/neon look (app/globals.css) — these are for the STRIP OUTPUT
 * only, so each theme's photo strip keeps its own distinct palette even
 * though the surrounding app chrome no longer changes per theme. Plain hex,
 * read directly by lib/strip-renderer.ts (not live CSS custom properties).
 */
export interface ThemeColors {
  paper: string;
  panel: string;
  ink: string;
  muted: string;
  accent: string;
  accent2: string;
  line: string;
}

export interface ThemeDef {
  id: StripThemeId;
  label: string;
  tagline: string;
  colors: ThemeColors;
  strip: {
    outerPad: number;
    bottomPad: number;
    gap: number;
    photoBorder: number;
    radius: number;
    background: StripBackground;
    photoRotationJitter: boolean;
    decoration: StripDecoration;
    captionTreatment: CaptionTreatment;
    /** CSS custom property holding the canvas-ready font-family list. */
    captionFontVar: string;
    captionFontSize: number;
    /** Outer frame baked around the whole strip. */
    outerFrame: { style: "none" | "solid" | "dashed" | "chrome" | "scallop"; width: number };
  };
}

export const THEMES: ThemeDef[] = [
  {
    id: "classic",
    label: "Classic",
    tagline: "Clean & simple",
    colors: {
      paper: "#ffffff",
      panel: "#ffffff",
      ink: "#101014",
      muted: "#6e6e76",
      accent: "#e2231a",
      accent2: "#101014",
      line: "#101014",
    },
    strip: {
      outerPad: 26,
      bottomPad: 76,
      gap: 14,
      photoBorder: 3,
      radius: 4,
      background: { kind: "solid" },
      photoRotationJitter: false,
      decoration: "none",
      captionTreatment: "plain",
      captionFontVar: "--font-archivo",
      captionFontSize: 26,
      outerFrame: { style: "solid", width: 4 },
    },
  },
  {
    id: "y2k-camera",
    label: "Y2K Digital Camera",
    tagline: "Chrome & flash",
    colors: {
      paper: "#c8ccd0",
      panel: "#eef0f2",
      ink: "#101014",
      muted: "#5a5e63",
      accent: "#ff2f92",
      accent2: "#e2231a",
      line: "#101014",
    },
    strip: {
      outerPad: 30,
      bottomPad: 78,
      gap: 12,
      photoBorder: 4,
      radius: 6,
      background: { kind: "texture", textureId: "scanlines" },
      photoRotationJitter: false,
      decoration: "none",
      captionTreatment: "stamp",
      captionFontVar: "--font-space-mono",
      captionFontSize: 22,
      outerFrame: { style: "chrome", width: 8 },
    },
  },
  {
    id: "glitter-scrapbook",
    label: "Glitter Scrapbook",
    tagline: "Tape & sparkle",
    colors: {
      paper: "#fbf3e3",
      panel: "#ffffff",
      ink: "#2b2118",
      muted: "#8a745c",
      accent: "#ff2f92",
      accent2: "#a8d8ff",
      line: "#d8a93a",
    },
    strip: {
      outerPad: 32,
      bottomPad: 90,
      gap: 20,
      photoBorder: 0,
      radius: 6,
      background: { kind: "pattern+texture", patternId: "dots", textureId: "glitter" },
      photoRotationJitter: true,
      decoration: "tape",
      captionTreatment: "handwritten",
      captionFontVar: "--font-marker",
      captionFontSize: 30,
      outerFrame: { style: "none", width: 0 },
    },
  },
  {
    id: "pop-magazine",
    label: "Pop Magazine",
    tagline: "Bold & loud",
    colors: {
      paper: "#ffd400",
      panel: "#ffffff",
      ink: "#101014",
      muted: "#4a4214",
      accent: "#e2231a",
      accent2: "#ff2f92",
      line: "#101014",
    },
    strip: {
      outerPad: 24,
      bottomPad: 88,
      gap: 10,
      photoBorder: 5,
      radius: 0,
      background: { kind: "texture", textureId: "halftone" },
      photoRotationJitter: false,
      decoration: "halftone-corners",
      captionTreatment: "cover-line",
      captionFontVar: "--font-anton",
      captionFontSize: 30,
      outerFrame: { style: "solid", width: 6 },
    },
  },
  {
    id: "retro-internet",
    label: "Retro Internet",
    tagline: "Pixels & dial-up",
    colors: {
      paper: "#ffffff",
      panel: "#e3e6e9",
      ink: "#101014",
      muted: "#5a5e63",
      accent: "#e2231a",
      accent2: "#ffd400",
      line: "#101014",
    },
    strip: {
      outerPad: 28,
      bottomPad: 72,
      gap: 8,
      photoBorder: 0,
      radius: 0,
      background: { kind: "pattern", patternId: "checker", patternUsesAccent: true },
      photoRotationJitter: false,
      decoration: "checker-corners",
      captionTreatment: "pixel",
      captionFontVar: "--font-press-start",
      captionFontSize: 12,
      outerFrame: { style: "dashed", width: 5 },
    },
  },
  {
    id: "cute-booth",
    label: "Cute Photo Booth",
    tagline: "Bows & hearts",
    colors: {
      paper: "#cdeaff",
      panel: "#ffffff",
      ink: "#2b2733",
      muted: "#606480",
      accent: "#ff5fa8",
      accent2: "#6ec3ff",
      line: "#ff5fa8",
    },
    strip: {
      outerPad: 28,
      bottomPad: 92,
      gap: 18,
      photoBorder: 0,
      radius: 22,
      background: { kind: "pattern", patternId: "dots" },
      photoRotationJitter: false,
      decoration: "none",
      captionTreatment: "bubble",
      captionFontVar: "--font-fredoka",
      captionFontSize: 26,
      outerFrame: { style: "scallop", width: 10 },
    },
  },
];

const THEME_MAP: Record<StripThemeId, ThemeDef> = THEMES.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<StripThemeId, ThemeDef>,
);

export function getTheme(id: StripThemeId): ThemeDef {
  return THEME_MAP[id] ?? THEMES[0];
}

/** Swatches offered in the customizer. `""` means "use the theme default". */
export const BORDER_SWATCHES = ["", "#101014", "#ffffff", "#ff2f92", "#ff6a13", "#e2231a", "#6ec3ff"];
export const BG_SWATCHES = ["", "#ffffff", "#fbf3e3", "#101014", "#ffd400", "#cdeaff", "#ffe1e8"];
