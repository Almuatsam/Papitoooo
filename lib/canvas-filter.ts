/**
 * Safari (desktop and iOS, and therefore every iOS browser) ignores
 * `CanvasRenderingContext2D.filter`: assigning to it just creates a plain
 * property, so every CSS-filter based photo filter silently renders as
 * "Natural". This module detects that at run time and re-implements the CSS
 * filter functions the app's filters use (lib/filters.ts) directly on pixels,
 * following the Filter Effects spec.
 *
 * Performance notes (this runs on phones):
 * - Colour functions are chained per pixel in one pass, in floats, with the
 *   spec's clamp between functions and a single 8-bit quantisation at the end.
 * - Blur is the spec's three-box-blur approximation (O(1) per pixel whatever
 *   the radius).
 * - Float scratch buffers are module-level and reused, never allocated per call.
 */

let filterSupported: boolean | undefined;

declare global {
  interface Window {
    /** Test hook: pretend `ctx.filter` is unsupported so the pixel path runs. */
    __photoboothForcePixelFilter?: boolean;
  }
}

/** Functional check: `"filter" in ctx` can't be trusted since assigning creates an expando property. */
export function canvasFilterSupported(): boolean {
  if (typeof window !== "undefined" && window.__photoboothForcePixelFilter) return false;
  if (filterSupported !== undefined) return filterSupported;
  filterSupported = probeCanvasFilter();
  return filterSupported;
}

/** Test seam: drop the cached probe result (or pin it) so the next call re-probes. */
export function resetCanvasFilterProbe(value?: boolean): void {
  filterSupported = value;
}

function probeCanvasFilter(): boolean {
  try {
    const source = document.createElement("canvas");
    source.width = 1;
    source.height = 1;
    const sourceCtx = source.getContext("2d");
    const target = document.createElement("canvas");
    target.width = 1;
    target.height = 1;
    const targetCtx = target.getContext("2d");
    if (!sourceCtx || !targetCtx) return false;
    sourceCtx.fillStyle = "#ff0000";
    sourceCtx.fillRect(0, 0, 1, 1);
    targetCtx.filter = "grayscale(1)";
    targetCtx.drawImage(source, 0, 0);
    return targetCtx.getImageData(0, 0, 1, 1).data[0] !== 255;
  } catch {
    // A context that can't even run the probe can't run native filters either.
    return false;
  }
}

/** Row-major 3x4: [r-from-rgb x3, r-offset, g..., b...], all in 0..1 colour space. */
type ColorMatrix = readonly number[];

const FILTER_FUNCTION = /([a-z-]+)\(\s*([^)]*?)\s*\)/g;

function parseAmount(raw: string, fallback: number): number {
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.trim().endsWith("%") ? value / 100 : value;
}

function parseRadians(raw: string): number {
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return 0;
  const unit = raw.trim().replace(/^[-+\d.eE]+/, "");
  if (unit === "rad") return value;
  if (unit === "turn") return value * 2 * Math.PI;
  if (unit === "grad") return (value * Math.PI) / 200;
  return (value * Math.PI) / 180;
}

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

function grayscaleMatrix(amount: number): ColorMatrix {
  const a = 1 - clamp01(amount);
  return [
    0.2126 + 0.7874 * a, 0.7152 - 0.7152 * a, 0.0722 - 0.0722 * a, 0,
    0.2126 - 0.2126 * a, 0.7152 + 0.2848 * a, 0.0722 - 0.0722 * a, 0,
    0.2126 - 0.2126 * a, 0.7152 - 0.7152 * a, 0.0722 + 0.9278 * a, 0,
  ];
}

function sepiaMatrix(amount: number): ColorMatrix {
  const a = 1 - clamp01(amount);
  return [
    0.393 + 0.607 * a, 0.769 - 0.769 * a, 0.189 - 0.189 * a, 0,
    0.349 - 0.349 * a, 0.686 + 0.314 * a, 0.168 - 0.168 * a, 0,
    0.272 - 0.272 * a, 0.534 - 0.534 * a, 0.131 + 0.869 * a, 0,
  ];
}

function saturateMatrix(amount: number): ColorMatrix {
  const s = Math.max(0, amount);
  return [
    0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s, 0,
    0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s, 0,
    0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s, 0,
  ];
}

function hueRotateMatrix(radians: number): ColorMatrix {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return [
    0.213 + cos * 0.787 - sin * 0.213, 0.715 - cos * 0.715 - sin * 0.715, 0.072 - cos * 0.072 + sin * 0.928, 0,
    0.213 - cos * 0.213 + sin * 0.143, 0.715 + cos * 0.285 + sin * 0.14, 0.072 - cos * 0.072 - sin * 0.283, 0,
    0.213 - cos * 0.213 - sin * 0.787, 0.715 - cos * 0.715 + sin * 0.715, 0.072 + cos * 0.928 + sin * 0.072, 0,
  ];
}

function brightnessMatrix(amount: number): ColorMatrix {
  const b = Math.max(0, amount);
  return [b, 0, 0, 0, 0, b, 0, 0, 0, 0, b, 0];
}

function contrastMatrix(amount: number): ColorMatrix {
  const c = Math.max(0, amount);
  const offset = 0.5 - 0.5 * c;
  return [c, 0, 0, offset, 0, c, 0, offset, 0, 0, c, offset];
}

/** One step of a parsed filter chain. */
type FilterOp = { kind: "matrix"; m: ColorMatrix } | { kind: "blur"; sigma: number };

/** Every CSS filter function the pixel path implements. lib/filters.ts must stay within this set. */
export const SUPPORTED_FILTER_FUNCTIONS = [
  "grayscale",
  "sepia",
  "saturate",
  "hue-rotate",
  "brightness",
  "contrast",
  "blur",
] as const;

/** Names of CSS filter functions in `css` that the pixel path cannot reproduce. */
export function unsupportedFilterFunctions(css: string): string[] {
  const supported: readonly string[] = SUPPORTED_FILTER_FUNCTIONS;
  const found: string[] = [];
  for (const match of css.matchAll(FILTER_FUNCTION)) {
    if (!supported.includes(match[1])) found.push(match[1]);
  }
  return found;
}

const parsedCache = new Map<string, FilterOp[]>();

function parseCssFilter(css: string): FilterOp[] {
  const cached = parsedCache.get(css);
  if (cached) return cached;
  const ops: FilterOp[] = [];
  for (const match of css.matchAll(FILTER_FUNCTION)) {
    const [, name, raw] = match;
    switch (name) {
      case "grayscale":
        ops.push({ kind: "matrix", m: grayscaleMatrix(parseAmount(raw, 1)) });
        break;
      case "sepia":
        ops.push({ kind: "matrix", m: sepiaMatrix(parseAmount(raw, 1)) });
        break;
      case "saturate":
        ops.push({ kind: "matrix", m: saturateMatrix(parseAmount(raw, 1)) });
        break;
      case "hue-rotate":
        ops.push({ kind: "matrix", m: hueRotateMatrix(parseRadians(raw)) });
        break;
      case "brightness":
        ops.push({ kind: "matrix", m: brightnessMatrix(parseAmount(raw, 1)) });
        break;
      case "contrast":
        ops.push({ kind: "matrix", m: contrastMatrix(parseAmount(raw, 1)) });
        break;
      case "blur":
        ops.push({ kind: "blur", sigma: parseFloat(raw) || 0 });
        break;
      default:
        break;
    }
  }
  parsedCache.set(css, ops);
  return ops;
}

/** Guards Math.floor against values like 152.99999 that are really 153. */
const FLOOR_EPSILON = 1e-4;

/**
 * Chains consecutive colour matrices per pixel in floats. The spec clamps the
 * result of each filter function, so clamping between matrices is kept; the
 * only 8-bit rounding happens once, at the end.
 */
function applyColorMatrices(data: Uint8ClampedArray, matrices: readonly ColorMatrix[]): void {
  const count = matrices.length;
  const flat = new Float64Array(count * 12);
  matrices.forEach((m, index) => flat.set(m, index * 12));
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] / 255;
    let g = data[i + 1] / 255;
    let b = data[i + 2] / 255;
    for (let k = 0; k < count; k++) {
      const o = k * 12;
      const nr = clamp01(flat[o] * r + flat[o + 1] * g + flat[o + 2] * b + flat[o + 3]);
      const ng = clamp01(flat[o + 4] * r + flat[o + 5] * g + flat[o + 6] * b + flat[o + 7]);
      const nb = clamp01(flat[o + 8] * r + flat[o + 9] * g + flat[o + 10] * b + flat[o + 11]);
      r = nr;
      g = ng;
      b = nb;
    }
    // Native engines truncate (not round) on the way back to 8 bits.
    data[i] = Math.floor(r * 255 + FLOOR_EPSILON);
    data[i + 1] = Math.floor(g * 255 + FLOOR_EPSILON);
    data[i + 2] = Math.floor(b * 255 + FLOOR_EPSILON);
  }
}

// --- blur ------------------------------------------------------------------

/** Blur radii below this render as a no-op in Chromium, so the pixel path skips them too. */
const MIN_BLUR_SIGMA = 0.6;

let scratchA = new Float32Array(0);
let scratchB = new Float32Array(0);

function ensureScratch(length: number): void {
  if (scratchA.length < length) {
    scratchA = new Float32Array(length);
    scratchB = new Float32Array(length);
  }
}

/** How samples outside the bitmap are treated by `applyCssFilterToCanvas`'s blur. */
export type BlurEdge =
  /** Repeat the border pixel — right when the source image is larger than the canvas. */
  | "clamp"
  /** Treat as transparent — what a native `ctx.filter` blur does at a bitmap's own edge. */
  | "transparent";

let columnSums = new Float32Array(0);

/** Running-sum box blur of radius `r` along one axis, premultiplied RGBA floats. Both axes walk memory in order. */
function boxPass(
  src: Float32Array,
  dst: Float32Array,
  width: number,
  height: number,
  before: number,
  after: number,
  horizontal: boolean,
  edge: BlurEdge,
): void {
  const clampEdge = edge === "clamp";
  const inv = 1 / (before + after + 1);
  if (horizontal) {
    const n = width;
    for (let y = 0; y < height; y++) {
      const row = y * width * 4;
      let s0 = 0;
      let s1 = 0;
      let s2 = 0;
      let s3 = 0;
      for (let k = -before; k <= after; k++) {
        const idx = clampEdge ? (k < 0 ? 0 : k > n - 1 ? n - 1 : k) : k;
        if (idx < 0 || idx >= n) continue;
        const o = row + idx * 4;
        s0 += src[o];
        s1 += src[o + 1];
        s2 += src[o + 2];
        s3 += src[o + 3];
      }
      for (let x = 0; x < n; x++) {
        const o = row + x * 4;
        dst[o] = s0 * inv;
        dst[o + 1] = s1 * inv;
        dst[o + 2] = s2 * inv;
        dst[o + 3] = s3 * inv;
        const add = x + after + 1;
        const rem = x - before;
        if (clampEdge) {
          const ao = row + (add > n - 1 ? n - 1 : add) * 4;
          const ro = row + (rem < 0 ? 0 : rem) * 4;
          s0 += src[ao] - src[ro];
          s1 += src[ao + 1] - src[ro + 1];
          s2 += src[ao + 2] - src[ro + 2];
          s3 += src[ao + 3] - src[ro + 3];
        } else {
          if (add < n) {
            const ao = row + add * 4;
            s0 += src[ao];
            s1 += src[ao + 1];
            s2 += src[ao + 2];
            s3 += src[ao + 3];
          }
          if (rem >= 0) {
            const ro = row + rem * 4;
            s0 -= src[ro];
            s1 -= src[ro + 1];
            s2 -= src[ro + 2];
            s3 -= src[ro + 3];
          }
        }
      }
    }
    return;
  }

  // Vertical: keep one running sum per column and slide down the rows.
  const stride = width * 4;
  if (columnSums.length < stride) columnSums = new Float32Array(stride);
  const sums = columnSums;
  sums.fill(0, 0, stride);
  for (let k = -before; k <= after; k++) {
    const idx = clampEdge ? (k < 0 ? 0 : k > height - 1 ? height - 1 : k) : k;
    if (idx < 0 || idx >= height) continue;
    const o = idx * stride;
    for (let i = 0; i < stride; i++) sums[i] += src[o + i];
  }
  for (let y = 0; y < height; y++) {
    const o = y * stride;
    for (let i = 0; i < stride; i++) dst[o + i] = sums[i] * inv;
    const add = y + after + 1;
    const rem = y - before;
    const addRow = clampEdge ? (add > height - 1 ? height - 1 : add) : add;
    const remRow = clampEdge ? (rem < 0 ? 0 : rem) : rem;
    if (addRow >= 0 && addRow < height) {
      const ao = addRow * stride;
      for (let i = 0; i < stride; i++) sums[i] += src[ao + i];
    }
    if (remRow >= 0 && remRow < height) {
      const ro = remRow * stride;
      for (let i = 0; i < stride; i++) sums[i] -= src[ro + i];
    }
  }
}

/** Three-box-blur Gaussian (sigma >= 2) on premultiplied RGBA, so transparent corners do not bleed a dark fringe. */
function applyGaussianBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  sigma: number,
  edge: BlurEdge,
): void {
  // Chromium/Skia renders blur() below ~0.6px as a no-op; match it so engines agree.
  if (sigma < MIN_BLUR_SIGMA) return;

  // Filter Effects spec: three successive box blurs approximate a Gaussian.
  // An even box size is split into two offset boxes plus one size d + 1.
  const d = Math.max(1, Math.floor((sigma * 3 * Math.sqrt(2 * Math.PI)) / 4 + 0.5));
  const boxes: Array<[number, number]> =
    d % 2 === 1
      ? [[(d - 1) / 2, (d - 1) / 2], [(d - 1) / 2, (d - 1) / 2], [(d - 1) / 2, (d - 1) / 2]]
      : [[d / 2, d / 2 - 1], [d / 2 - 1, d / 2], [d / 2, d / 2]];

  // A native blur spreads light past the bitmap edge and lets it come back in
  // on the later passes. Reproduce that by blurring inside a transparent
  // margin as wide as the whole blur reaches.
  const pad = edge === "transparent" ? boxes.reduce((sum, [before, after]) => sum + Math.max(before, after), 0) + 1 : 0;
  const w = width + pad * 2;
  const h = height + pad * 2;
  ensureScratch(w * h * 4);
  const from = scratchA;
  const to = scratchB;
  if (pad > 0) from.fill(0, 0, w * h * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const o = ((y + pad) * w + x + pad) * 4;
      const alpha = data[i + 3] / 255;
      from[o] = data[i] * alpha;
      from[o + 1] = data[i + 1] * alpha;
      from[o + 2] = data[i + 2] * alpha;
      from[o + 3] = data[i + 3];
    }
  }

  for (const [before, after] of boxes) {
    boxPass(from, to, w, h, before, after, true, edge);
    boxPass(to, from, w, h, before, after, false, edge);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const o = ((y + pad) * w + x + pad) * 4;
      const alpha = from[o + 3];
      const inverse = alpha > 0 ? 255 / alpha : 0;
      data[i] = from[o] * inverse + 0.5;
      data[i + 1] = from[o + 1] * inverse + 0.5;
      data[i + 2] = from[o + 2] * inverse + 0.5;
      data[i + 3] = alpha + 0.5;
    }
  }
}

/**
 * Zeroes out everything at or below `threshold` luminance and rescales what
 * survives by how far above threshold it was, tinted toward `tint`
 * (0..1 per-channel multipliers, e.g. a yellow-green light reads as
 * `[1, 0.95, 0.45]` — barely touches red/green, cuts blue). This is the
 * "extract only the bright pixels" step a real bloom needs: blurring and
 * screening this back onto the photo (see `makeGlowLayer` in
 * lib/filter-pipeline.ts) only lights up genuine highlights, because
 * screening with black leaves the base pixel exactly as it was — shadows
 * and midtones can't be touched at all, however wide the blur. Skipping
 * this step (blurring the *whole* graded photo instead) is what makes a
 * naive bloom read as a flat gray haze instead of a glow.
 */
export function extractTintedHighlights(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold: number,
  tint: readonly [number, number, number],
): void {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  const [tr, tg, tb] = tint;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const factor = luminance <= threshold ? 0 : (luminance - threshold) / (1 - threshold);
    data[i] = clamp01(r * factor * tr) * 255;
    data[i + 1] = clamp01(g * factor * tg) * 255;
    data[i + 2] = clamp01(b * factor * tb) * 255;
  }
  ctx.putImageData(image, 0, 0);
}

export interface CssFilterOptions {
  /** How the blur treats the bitmap border. Defaults to "clamp". */
  edge?: BlurEdge;
}

/**
 * Applies a CSS `filter` string (grayscale, sepia, saturate, hue-rotate,
 * brightness, contrast, blur) to what's already drawn on `ctx`, in string
 * order. Functions outside that set are ignored (see
 * `unsupportedFilterFunctions`). Transparent pixels stay transparent, so a
 * rounded-corner clip drawn before this is preserved.
 */
export function applyCssFilterToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  css: string,
  options: CssFilterOptions = {},
): void {
  const ops = parseCssFilter(css);
  if (ops.length === 0) return;
  const edge = options.edge ?? "clamp";
  const image = ctx.getImageData(0, 0, width, height);

  let pending: ColorMatrix[] = [];
  for (const op of ops) {
    if (op.kind === "matrix") {
      pending.push(op.m);
      continue;
    }
    if (pending.length > 0) {
      applyColorMatrices(image.data, pending);
      pending = [];
    }
    applyGaussianBlur(image.data, width, height, op.sigma, edge);
  }
  if (pending.length > 0) applyColorMatrices(image.data, pending);

  ctx.putImageData(image, 0, 0);
}
