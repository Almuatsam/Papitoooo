import type { StripStyleId } from "@/types";

export type StripDecoration = "none" | "sprockets" | "polaroid";

export interface StripStyle {
  id: StripStyleId;
  label: string;
  /** Paper margin around the photo column, in composite px. */
  outerPad: number;
  /** Extra space below the last photo (caption / polaroid chin). */
  bottomPad: number;
  /** Gap between photos. */
  gap: number;
  /** Per-photo keyline width (0 = none). */
  photoBorder: number;
  /** Default per-photo keyline colour (user can override). */
  photoBorderColor: string;
  /** Photo corner radius. */
  radius: number;
  /** Default paper colour (user can override). */
  bg: string;
  /** Caption + date text colour. */
  textColor: string;
  /** Caption font family (must be web-safe / loaded). */
  fontFamily: string;
  /** Caption font size in composite px. */
  fontSize: number;
  decoration: StripDecoration;
}

export const STRIP_STYLES: StripStyle[] = [
  {
    id: "classic",
    label: "Classic",
    outerPad: 26,
    bottomPad: 76,
    gap: 14,
    photoBorder: 3,
    photoBorderColor: "#111111",
    radius: 4,
    bg: "#ffffff",
    textColor: "#111111",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 26,
    decoration: "none",
  },
  {
    id: "minimal",
    label: "Minimal",
    outerPad: 40,
    bottomPad: 64,
    gap: 26,
    photoBorder: 0,
    photoBorderColor: "#111111",
    radius: 10,
    bg: "#ffffff",
    textColor: "#8a8a8a",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 20,
    decoration: "none",
  },
  {
    id: "vintage",
    label: "Vintage",
    outerPad: 30,
    bottomPad: 82,
    gap: 16,
    photoBorder: 4,
    photoBorderColor: "#7a5c3e",
    radius: 8,
    bg: "#f3e7d0",
    textColor: "#6b4a2f",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 26,
    decoration: "none",
  },
  {
    id: "polaroid",
    label: "Polaroid",
    outerPad: 22,
    bottomPad: 130,
    gap: 22,
    photoBorder: 0,
    photoBorderColor: "#111111",
    radius: 2,
    bg: "#ffffff",
    textColor: "#2b2b2b",
    fontFamily: "'Comic Sans MS', 'Segoe Print', 'Bradley Hand', cursive",
    fontSize: 30,
    decoration: "polaroid",
  },
  {
    id: "film",
    label: "Film",
    outerPad: 40,
    bottomPad: 70,
    gap: 10,
    photoBorder: 0,
    photoBorderColor: "#f2f2f2",
    radius: 0,
    bg: "#1b1b1d",
    textColor: "#e9e9e9",
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: 22,
    decoration: "sprockets",
  },
];

const STYLE_MAP: Record<StripStyleId, StripStyle> = STRIP_STYLES.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<StripStyleId, StripStyle>,
);

export function getStripStyle(id: StripStyleId): StripStyle {
  return STYLE_MAP[id] ?? STRIP_STYLES[0];
}

/** Swatches offered in the customizer. `""` means "use the style default". */
export const BORDER_SWATCHES = [
  "",
  "#111111",
  "#ffffff",
  "#2563ff",
  "#ff5a1f",
  "#e11d48",
  "#7a5c3e",
];

export const BG_SWATCHES = [
  "",
  "#ffffff",
  "#f3e7d0",
  "#111214",
  "#2563ff",
  "#ffe8d6",
  "#e8f0ff",
];
