import type { FilterId } from "@/types";

/**
 * Photo filters. The reference project had none — these are new.
 *
 * A filter is a CSS `filter` string (`css`) plus an optional translucent
 * color wash (`overlay`) painted on top of it. The same definition drives
 * the live `<video>` preview (inline `filter` style + an overlay div) and
 * the exported strip (Canvas 2D `ctx.filter` + a `source-over` fill while
 * each photo is drawn), so what you preview is exactly what you download.
 * Every one of the four photos carries the filter — it is baked into the
 * pixels, not laid over the finished strip.
 */
/** A translucent color wash painted over the photo, on top of `css`. */
export interface ColorOverlay {
  /** CSS hex/rgb color of the wash. */
  color: string;
  /** 0-1 opacity of the wash. */
  opacity: number;
  /**
   * How the wash composites onto the photo. Defaults to `"source-over"` (a
   * flat tint, i.e. the original blue/red/purple filters) — `"multiply"` and
   * `"soft-light"` grade the tone instead of flattening the image under a
   * solid color, which is what a warm color-grade filter needs.
   */
  blend?: "source-over" | "multiply" | "soft-light";
}

/**
 * A screen-blended, blurred-and-brightened copy of the photo composited back
 * on top of itself — the "bright areas bloom outward" glow look that a flat
 * filter can't produce. See `prepFrame` in lib/strip-renderer.ts for the
 * actual draw/blur/composite steps.
 */
export interface GlowEffect {
  /** Blur radius (px, at the photo's native render size) for the bloom layer. */
  blurPx: number;
  /** Brightness multiplier applied to the blurred copy before it's screened back on. */
  brightness: number;
  /** 0-1 opacity of the screen-blended bloom layer. */
  opacity: number;
}

export interface FilterDef {
  id: FilterId;
  label: string;
  css: string;
  /** Present only for "color overlay" style filters — a tint wash on top of the CSS filter. */
  overlay?: ColorOverlay;
  /** Present only for filters that add a soft glow/bloom on highlights (see `GlowEffect`). */
  glow?: GlowEffect;
}

/** Builds a color-overlay filter: the photo renders as-is (or with `css`), then this color washes over it at `opacity`. */
function colorOverlayFilter(id: FilterId, label: string, color: string, opacity: number, css = "none"): FilterDef {
  return { id, label, css, overlay: { color, opacity } };
}

export const FILTERS: FilterDef[] = [
  { id: "natural", label: "Natural", css: "none" },
  {
    id: "vintage",
    label: "Vintage",
    css: "sepia(0.38) contrast(1.05) saturate(0.82) brightness(1.03)",
  },
  { id: "bw", label: "B&W", css: "grayscale(1) contrast(1.12) brightness(1.02)" },
  {
    id: "warm",
    label: "Warm",
    css: "sepia(0.22) saturate(1.32) hue-rotate(-12deg) brightness(1.05)",
  },
  {
    id: "cool",
    label: "Cool",
    css: "saturate(1.12) hue-rotate(16deg) brightness(1.02) contrast(1.06)",
  },
  {
    id: "film",
    label: "Film",
    css: "contrast(1.16) saturate(1.08) sepia(0.16) brightness(0.98)",
  },
  {
    id: "retro",
    label: "Retro",
    css: "sepia(0.5) contrast(0.92) saturate(1.45) hue-rotate(-16deg)",
  },
  {
    id: "soft",
    label: "Soft",
    css: "contrast(0.9) brightness(1.09) saturate(0.94) blur(0.4px)",
  },
  { id: "contrast", label: "High contrast", css: "contrast(1.42) saturate(1.16)" },
  colorOverlayFilter("blue", "Blue", "#2d77ed", 0.3),
  colorOverlayFilter("red", "Red", "#cc0606", 0.3),
  colorOverlayFilter("purple", "Purple", "#6311a6", 0.3),
  {
    id: "cybercore",
    label: "Cybercore",
    // Effect 1, second half: a slight contrast/saturation pullback so the
    // warm grade below reads as hazy/nostalgic instead of just "warm".
    css: "contrast(0.93) saturate(0.9) brightness(1.03)",
    // Effect 1, first half: a warm yellow-orange grade via a soft-light wash
    // — this shifts tone instead of flattening the photo under a flat color
    // the way a `source-over` overlay (blue/red/purple, above) would.
    overlay: { color: "#ffb454", opacity: 0.4, blend: "soft-light" },
    // Effect 2: the blurred+brightened copy screened back on top is what
    // actually produces the "highlights glow" look — see prepFrame().
    glow: { blurPx: 18, brightness: 1.4, opacity: 0.45 },
  },
];

const FILTER_MAP: Record<FilterId, FilterDef> = FILTERS.reduce(
  (acc, f) => {
    acc[f.id] = f;
    return acc;
  },
  {} as Record<FilterId, FilterDef>,
);

export function getFilter(id: FilterId): FilterDef {
  return FILTER_MAP[id] ?? FILTERS[0];
}

/** CSS `filter` value for a given filter id, safe for inline styles and ctx.filter. */
export function filterCss(id: FilterId): string {
  return getFilter(id).css;
}
