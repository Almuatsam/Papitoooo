import type { PatternId } from "@/lib/decor/patterns";
import type { TextureId } from "@/lib/decor/textures";
import type { StripThemeId } from "@/types";

/**
 * The photo-strip decoration vocabulary: physical-craft shape families
 * (torn paper, tape, rhinestones, ribbons, geometric cutouts, organic blobs,
 * handmade scraps, ...), each renderable in several "materials" (paper,
 * vinyl, chrome, glitter, fabric, magazine print, ...). A theme doesn't pick
 * one fixed set — it offers a `piecePool` of candidates and a `pieceCount`
 * range, and lib/decor/decoration-generator.ts seed-selects + jitters a
 * subset each render (see lib/strip-renderer.ts). Actual drawing lives in
 * lib/decor/shapes/*.ts (grouped by family, re-exported through
 * lib/decor/strip-pieces.ts) and lib/decor/piece-materials.ts (finish).
 */
export type StripPieceKind =
  // ---- straps: tape & bands, kept deliberately non-rectangular -----------
  | "tape"
  | "cropped-tape"
  | "diagonal-strip"
  | "wavy-strip"
  | "zigzag-strip"
  | "torn-strip"
  | "curved-strip"
  | "folded-strip"
  | "bent-tape"
  | "corner-wrap"
  | "c-shape-tape"
  | "thin-band"
  | "scribble-strip"
  | "chunky-block"
  | "arched-strip"
  | "ribbon"
  | "broken-band"
  | "looping-strip"
  | "segmented-strip"
  | "tapered-strip"
  | "jagged-strip"
  // ---- geometric: squares, angular cutouts, letterforms -------------------
  | "square"
  | "square-missing-corner"
  | "torn-square"
  | "uneven-rectangle"
  | "offset-rect"
  | "diamond"
  | "triangle"
  | "trapezoid"
  | "hexagon"
  | "octagon"
  | "arc-piece"
  | "cross-shape"
  | "letter-shape"
  // ---- organic: blobs, florals, soft shapes --------------------------------
  | "irregular-cutout"
  | "organic-blob"
  | "star-piece"
  | "sparkle-star"
  | "flower-piece"
  | "cloud-piece"
  | "starburst-piece"
  | "bubble-piece"
  | "crescent-piece"
  | "squiggle-piece"
  // ---- handmade / physical --------------------------------------------------
  | "folded-corner"
  | "crumpled-paper"
  | "paper-tab"
  | "sticker-corner"
  | "die-cut-piece"
  | "photo-fragment"
  // ---- flagship material showcase ------------------------------------------
  | "rhinestone-cluster"
  // ---- signature: bespoke per-theme structural graphics --------------------
  | "barcode"
  | "now-playing-panel"
  | "route-field-block"
  | "receipt-header"
  | "receipt-footer"
  | "airplane-motif"
  // ---- real composited asset (SVG loaded as-is, not hand-drawn) -----------
  | "asset-svg";

/** How a piece's base shape is finished/rendered — see lib/decor/piece-materials.ts. */
export type MaterialId =
  | "paper"
  | "vinyl"
  | "puffy"
  | "holographic"
  | "chrome"
  | "glitter"
  | "rhinestone"
  | "plastic"
  | "hand-drawn"
  | "paper-cutout"
  | "fabric"
  | "magazine";

export type PieceAnchor = number | "frame";
export type PieceEdge = "tl" | "tr" | "bl" | "br" | "top" | "bottom" | "left" | "right";
export type PieceColorSlot = "accent" | "accent2" | "ink" | "paper" | "line" | "muted";

export interface StripPiecePlacement {
  kind: StripPieceKind;
  material: MaterialId;
  /** Photo index this piece hangs off of, or "frame" for the whole strip. A theme's layout-independent signature pieces should anchor to "frame"; per-photo anchors should stay low (0, maybe 1) since not every layout has every index — see lib/layouts/. */
  anchor: PieceAnchor;
  /** Which corner/edge of the anchor's bounding box the piece centres on. */
  edge: PieceEdge;
  color: PieceColorSlot;
  /** Second colour for two-tone pieces (e.g. a gem cluster's highlight). Defaults to `color`. */
  secondaryColor?: PieceColorSlot;
  /** Authored base rotation, degrees — roughly -15..15 except a few deliberately-diagonal kinds. */
  angle: number;
  /** Multiplies the piece's default size. */
  scale?: number;
  /** Nudges the piece away from its anchor point — lets it bleed off the strip edge or hang further into a photo. */
  offset?: { x: number; y: number };
  /** "back" = drawn before the anchor (behind the photo/under the frame); "front" = drawn after (on top). */
  layer: "back" | "front";
  opacity?: number;
  /** Always drawn, never subject to the seeded subset-selection — for a theme's signature/structural elements (barcode, receipt header, stamps, ...) that must appear every render. */
  required?: boolean;
  /** kind: "asset-svg" only — raw SVG markup composited as-is (real vector art, not a hand-drawn shape). `scale` multiplies a fixed base width; natural aspect ratio is preserved. */
  assetSvg?: string;
  /** kind: "asset-svg" only — optional CSS filter() string applied when rasterizing, to grade a multi-color source asset toward the theme palette without hand-editing every fill. */
  assetFilter?: string;
}

export type CaptionTreatment =
  | "plain"
  | "stamp"
  | "handwritten"
  | "cover-line"
  | "pixel"
  | "bubble"
  | "airmail-tag"
  | "now-playing"
  | "boarding-pass";

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
    /** Candidate decoration pieces this theme draws from — see the module doc comment above. */
    piecePool: StripPiecePlacement[];
    /** How many of `piecePool` actually get drawn on a given render (seed-selected). */
    pieceCount: [number, number];
    captionTreatment: CaptionTreatment;
    /** CSS custom property holding the canvas-ready font-family list. */
    captionFontVar: string;
    captionFontSize: number;
    /**
     * Shrinks the caption bitmap's width and shifts it right by this many
     * px, instead of spanning/centering across the full `canvasW` — for a
     * theme whose outer frame has a large asymmetric decoration (Glitter
     * Star's bottom-left chrome star) sitting in the caption's row that a
     * dead-centered caption would otherwise render on top of. Leave unset
     * (every theme except Glitter Star) for the default full-width,
     * fully-centered caption.
     */
    captionInsetLeft?: number;
    /** Outer frame baked around the whole strip. "ticket" = a perforation line along one edge; "airmail" = a diagonal striped band around all edges. */
    outerFrame: { style: "none" | "solid" | "dashed" | "chrome" | "scallop" | "ticket" | "airmail" | "leopard-scallop" | "zebra-frame" | "glitter-frame"; width: number };
    /**
     * A solid-color band across the very top of the strip (Boarding Pass's
     * "BOARDING PASS" bar) — drawn full-width, `height` tall, before the
     * outer frame. `color` resolves to `colors.accent` by default but is
     * user-overridable (see RenderStripInput.accentColor in
     * lib/strip-renderer.ts); `label` is drawn on it next to a small
     * airplane glyph in the paper colour. Reserve room for it by sizing
     * this theme's `outerPad` generously — the band paints into that
     * margin, it doesn't add its own layout space.
     */
    headerBand?: { height: number; label: string };
    /**
     * Small authored rotation (degrees) applied to the fully-composited
     * strip as a final raster postprocessing step — e.g. a "pinned to a
     * corkboard, slightly askew" look. A tiny seeded jitter is added on top
     * so it isn't identical every session, while staying pixel-identical
     * between a given session's own preview and download.
     */
    tiltDeg?: number;
  };
}
