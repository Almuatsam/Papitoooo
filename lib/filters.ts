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
   * flat tint, i.e. the original blue/red/purple filters). `"multiply"` and
   * `"soft-light"` grade the tone but still drift pure black/white toward
   * the tint color, which reads as fog/haze over a whole photo. `"overlay"`
   * leaves true black and true white exactly as they were (only midtones
   * shift) — the one to reach for when the brief is "tint it without
   * washing out contrast or fading the shadows."
   */
  blend?: "source-over" | "multiply" | "soft-light" | "overlay";
}

/**
 * One screen-blended, blurred-and-brightened copy of *only the photo's
 * highlights* composited back on top of itself — the "bright areas bloom
 * outward" glow look that a flat filter can't produce. See `makeGlowLayer`
 * in lib/strip-renderer.ts.
 */
export interface GlowLayer {
  /**
   * Luminance (0-1) below which a pixel contributes nothing to this bloom
   * pass. This is what keeps shadows/midtones dark: only pixels already
   * brighter than `threshold` feed the blur at all (see
   * `extractTintedHighlights` in lib/canvas-filter.ts), so screening the
   * result back on can't lift anything below it — screening with black is a
   * no-op. Skip this and you're blurring the *whole* photo, which is what
   * makes a naive bloom read as a flat gray haze instead of a glow.
   */
  threshold: number;
  /**
   * Per-channel (0-1) tint multiplied into whatever survives `threshold`,
   * e.g. `[1, 0.95, 0.45]` for a yellow-green light — barely touches
   * red/green, cuts blue. This is what makes the *glow itself* colored
   * (a luminous cast on highlights) rather than just a brightened copy of
   * the photo's own highlight colors.
   */
  tint: readonly [number, number, number];
  /**
   * Blur radius as a *fraction* of the photo's rendered width, not a fixed
   * px value — so a tiny grid-6 cell and a large single-portrait photo get
   * proportionally the same haze instead of the blur going negligible on
   * one and overwhelming on the other.
   */
  blurFrac: number;
  /**
   * How much the photo is downscaled before blurring (e.g. `4` = blur at
   * 1/4 size, then draw back up to full size). Blurring at native
   * resolution for a wide/soft pass is both slow — especially on the Safari
   * pixel-fallback path, which convolves by hand — and looks tighter than
   * intended; blurring small and upscaling is the standard cheap-bloom trick
   * and reads as a *softer*, more diffuse glow, not just a faster one.
   */
  downscale: number;
  /** Brightness multiplier applied to this layer before it's screened back on. */
  brightness: number;
  /** 0-1 opacity this layer screens on at. */
  opacity: number;
}

/**
 * A glow/bloom made of one or more `GlowLayer`s, composited in order. Real
 * bloom has both a tight bright core and a wider soft halo around it — a
 * single blur radius alone tends to read as "soft focus" rather than
 * "glowing", so `cybercore` (below) layers a tight pass and a wide one.
 */
export interface GlowEffect {
  layers: GlowLayer[];
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
    // A slight contrast/saturation *punch-up*, not a pullback — the earlier
    // version pulled both down and that, combined with blurring the whole
    // photo for the glow (see below), was the "dusty/faded/washed out" bug.
    // Contrast and detail come from the base photo; this filter's job is
    // the color + glow layered on top of it, not softening the photo itself.
    css: "contrast(1.05) saturate(1.06)",
    // A yellow-green grade via "overlay" blend: unlike "soft-light" (the
    // earlier version), true black/white in the photo pass through
    // unchanged — only midtones pick up the tint — so this can't wash out
    // shadows or fade contrast. Deliberately distinct from Vintage (a plain
    // `sepia()` CSS grade, no overlay, no glow at all): green-shifted hue
    // here vs. Vintage's straight brown/sepia.
    overlay: { color: "#a9c23f", opacity: 0.4, blend: "overlay" },
    // The actual "luminous glow" comes from here, not the overlay above:
    // two bloom passes, each built from *only* the photo's own highlights
    // (see `threshold`/`tint` on GlowLayer and `extractTintedHighlights` in
    // canvas-filter.ts) — recolored yellow-green, blurred, brightened past
    // white ("slightly overexposed"), then screened back on. Because each
    // pass is near-black everywhere except real highlights, screening it
    // back on cannot lift shadows/midtones at all — that's what keeps darks
    // dark and the photo crisp underneath instead of hazy all over.
    glow: {
      layers: [
        // Tight, bright core right at the highlight edges.
        { threshold: 0.55, tint: [1, 0.97, 0.4], blurFrac: 0.035, downscale: 3, brightness: 1.7, opacity: 0.6 },
        // Wider, softer halo — the actual "bloom outward" spread.
        { threshold: 0.4, tint: [1, 1, 0.55], blurFrac: 0.1, downscale: 6, brightness: 1.4, opacity: 0.5 },
      ],
    },
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
