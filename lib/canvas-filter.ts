/**
 * Safari (desktop and iOS) ignores `CanvasRenderingContext2D.filter`: assigning
 * to it just creates a plain property, so every CSS-filter based photo filter
 * silently renders as "Natural" in the exported strip. This module detects
 * that and re-implements the CSS filter functions the app's filters use
 * (lib/filters.ts) directly on pixels, following the Filter Effects spec.
 */

let filterSupported: boolean | undefined;

/** Functional check: `"filter" in ctx` can't be trusted since assigning creates an expando property. */
export function canvasFilterSupported(): boolean {
  if (filterSupported !== undefined) return filterSupported;
  filterSupported = probeCanvasFilter();
  return filterSupported;
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

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

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

function applyColorMatrix(data: Uint8ClampedArray, m: ColorMatrix): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    data[i] = clamp01(m[0] * r + m[1] * g + m[2] * b + m[3]) * 255;
    data[i + 1] = clamp01(m[4] * r + m[5] * g + m[6] * b + m[7]) * 255;
    data[i + 2] = clamp01(m[8] * r + m[9] * g + m[10] * b + m[11]) * 255;
  }
}

/** Gaussian blur on premultiplied RGBA, so transparent rounded corners don't bleed a dark fringe into the photo. */
function applyGaussianBlur(data: Uint8ClampedArray, width: number, height: number, sigma: number): void {
  if (sigma <= 0) return;
  const radius = Math.max(1, Math.ceil(sigma * 3));
  const kernel: number[] = [];
  let total = 0;
  for (let x = -radius; x <= radius; x++) {
    const weight = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel.push(weight);
    total += weight;
  }
  const weights = kernel.map((w) => w / total);

  const pixels = new Float32Array(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    pixels[i] = data[i] * alpha;
    pixels[i + 1] = data[i + 1] * alpha;
    pixels[i + 2] = data[i + 2] * alpha;
    pixels[i + 3] = data[i + 3];
  }

  const pass = (input: Float32Array, horizontal: boolean): Float32Array => {
    const output = new Float32Array(input.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const base = (y * width + x) * 4;
        for (let k = -radius; k <= radius; k++) {
          const sx = horizontal ? Math.min(width - 1, Math.max(0, x + k)) : x;
          const sy = horizontal ? y : Math.min(height - 1, Math.max(0, y + k));
          const source = (sy * width + sx) * 4;
          const weight = weights[k + radius];
          output[base] += input[source] * weight;
          output[base + 1] += input[source + 1] * weight;
          output[base + 2] += input[source + 2] * weight;
          output[base + 3] += input[source + 3] * weight;
        }
      }
    }
    return output;
  };

  const blurred = pass(pass(pixels, true), false);
  for (let i = 0; i < data.length; i += 4) {
    const alpha = blurred[i + 3];
    const inverse = alpha > 0 ? 255 / alpha : 0;
    data[i] = blurred[i] * inverse;
    data[i + 1] = blurred[i + 1] * inverse;
    data[i + 2] = blurred[i + 2] * inverse;
    data[i + 3] = alpha;
  }
}

/**
 * Zeroes out everything at or below `threshold` luminance and rescales what
 * survives by how far above threshold it was, tinted toward `tint`
 * (0..1 per-channel multipliers, e.g. a yellow-green light reads as
 * `[1, 0.95, 0.45]` — barely touches red/green, cuts blue). This is the
 * "extract only the bright pixels" step a real bloom needs: blurring and
 * screening this back onto the photo (see `makeGlowLayer` in
 * lib/strip-renderer.ts) only lights up genuine highlights, because
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

/**
 * Applies a CSS `filter` string (grayscale, sepia, saturate, hue-rotate,
 * brightness, contrast, blur) to what's already drawn on `ctx`, in string
 * order. Functions outside that set are ignored. Transparent pixels stay
 * transparent, so a rounded-corner clip drawn before this is preserved.
 */
export function applyCssFilterToCanvas(ctx: CanvasRenderingContext2D, width: number, height: number, css: string): void {
  const image = ctx.getImageData(0, 0, width, height);
  for (const match of css.matchAll(FILTER_FUNCTION)) {
    const [, name, raw] = match;
    switch (name) {
      case "grayscale":
        applyColorMatrix(image.data, grayscaleMatrix(parseAmount(raw, 1)));
        break;
      case "sepia":
        applyColorMatrix(image.data, sepiaMatrix(parseAmount(raw, 1)));
        break;
      case "saturate":
        applyColorMatrix(image.data, saturateMatrix(parseAmount(raw, 1)));
        break;
      case "hue-rotate":
        applyColorMatrix(image.data, hueRotateMatrix(parseRadians(raw)));
        break;
      case "brightness":
        applyColorMatrix(image.data, brightnessMatrix(parseAmount(raw, 1)));
        break;
      case "contrast":
        applyColorMatrix(image.data, contrastMatrix(parseAmount(raw, 1)));
        break;
      case "blur":
        applyGaussianBlur(image.data, width, height, parseFloat(raw) || 0);
        break;
      default:
        break;
    }
  }
  ctx.putImageData(image, 0, 0);
}
