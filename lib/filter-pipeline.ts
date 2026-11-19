/**
 * The one place a photo filter is turned into pixels. The exported strip
 * (lib/strip-renderer.ts) and the canvas-based live preview
 * (components/camera/filtered-canvas.tsx) both call `paintFiltered`, so
 * preview and export cannot drift apart.
 *
 * Native `ctx.filter` is used when the browser supports it (probed at run
 * time by `canvasFilterSupported`, never by user-agent); otherwise the pixel
 * implementation in lib/canvas-filter.ts runs. Everything here is synchronous,
 * which is what makes the shared scratch canvases below safe to reuse.
 */
import type { ColorOverlay, FilterDef, GlowEffect, GlowLayer } from "@/lib/filters";
import { applyCssFilterToCanvas, canvasFilterSupported, extractTintedHighlights } from "@/lib/canvas-filter";

/** Extra downscale applied to the bloom blur on the pixel path only. */
const PIXEL_BLUR_DOWNSCALE = 2;

const scratchCanvases = new Map<string, HTMLCanvasElement>();

/** A reusable canvas of exactly (w, h), cleared. Only valid until the caller's synchronous work ends. */
function scratchCanvas(key: string, w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D | null } {
  let canvas = scratchCanvases.get(key);
  if (!canvas) {
    canvas = document.createElement("canvas");
    scratchCanvases.set(key, canvas);
  }
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.clearRect(0, 0, w, h);
  }
  return { canvas, ctx };
}

/**
 * Renders one bloom pass (a `GlowLayer`) from `base` at full (w, h) size:
 * extract only the pixels above `layer.threshold` (tinted toward
 * `layer.tint`), blur that, brighten it, and hand back a canvas that's black
 * everywhere except a coloured glow around what were already highlights.
 * Screening *that* onto the photo can only light up highlights — screening
 * with black leaves the base pixel untouched.
 *
 * Extraction and blur happen on a *downscaled* copy, then get drawn back up:
 * cheap, and it reads as a softer halo. The returned canvas is a shared
 * scratch canvas — draw it immediately.
 */
function makeGlowLayer(base: CanvasImageSource, w: number, h: number, layer: GlowLayer): HTMLCanvasElement {
  const dw = Math.max(1, Math.round(w / layer.downscale));
  const dh = Math.max(1, Math.round(h / layer.downscale));

  const small = scratchCanvas("glow-small", dw, dh);
  const out = scratchCanvas("glow-out", w, h);
  if (!small.ctx || !out.ctx) return out.canvas;

  small.ctx.drawImage(base, 0, 0, dw, dh);
  extractTintedHighlights(small.ctx, dw, dh, layer.threshold, layer.tint);

  const css = `blur(${layer.blurFrac * dw}px) brightness(${layer.brightness})`;
  let blurred: HTMLCanvasElement = small.canvas;
  if (canvasFilterSupported()) {
    // ctx.filter only applies to what's drawn *through* it, so this needs a
    // separate target canvas — drawing `small` onto itself isn't reliable.
    const target = scratchCanvas("glow-blurred", dw, dh);
    if (target.ctx) {
      target.ctx.filter = css;
      target.ctx.drawImage(small.canvas, 0, 0);
      target.ctx.filter = "none";
      blurred = target.canvas;
    }
  } else {
    // Pixel path: a bloom is smooth, so blur one more step down (a quarter of
    // the pixels) and let the upscale below bring it back. A native blur treats
    // the bitmap border as transparent, so match that.
    const hw = Math.max(1, Math.round(dw / PIXEL_BLUR_DOWNSCALE));
    const hh = Math.max(1, Math.round(dh / PIXEL_BLUR_DOWNSCALE));
    const half = scratchCanvas("glow-half", hw, hh);
    if (half.ctx) {
      half.ctx.drawImage(small.canvas, 0, 0, hw, hh);
      const halfCss = `blur(${(layer.blurFrac * dw * hw) / dw}px) brightness(${layer.brightness})`;
      applyCssFilterToCanvas(half.ctx, hw, hh, halfCss, { edge: "transparent" });
      blurred = half.canvas;
    } else {
      applyCssFilterToCanvas(small.ctx, dw, dh, css, { edge: "transparent" });
    }
  }

  out.ctx.drawImage(blurred, 0, 0, w, h);
  return out.canvas;
}

function applyOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, overlay: ColorOverlay): void {
  // Reset first: the wash itself stays a flat, un-blurred colour.
  ctx.filter = "none";
  ctx.globalCompositeOperation = overlay.blend ?? "source-over";
  ctx.globalAlpha = overlay.opacity;
  ctx.fillStyle = overlay.color;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function applyGlow(ctx: CanvasRenderingContext2D, w: number, h: number, glow: GlowEffect): void {
  // Each layer is blurred from the *same* graded canvas (not the previous
  // layer), so layers stack independently instead of compounding.
  for (const layer of glow.layers) {
    const bloom = makeGlowLayer(ctx.canvas, w, h, layer);
    ctx.filter = "none";
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = layer.opacity;
    ctx.drawImage(bloom, 0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
}

export interface PaintRect {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

/**
 * Draws `source` into `ctx` (a canvas of size w x h, any clip already set)
 * with the filter baked in: CSS grade, then colour wash, then bloom.
 * Throws if `drawImage` throws, so callers can fall back to a placeholder.
 */
export function paintFiltered(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  rect: PaintRect,
  w: number,
  h: number,
  filter: Pick<FilterDef, "css" | "overlay" | "glow">,
): void {
  const { css, overlay, glow } = filter;
  const hasFilter = Boolean(css) && css !== "none";
  const native = hasFilter && canvasFilterSupported();
  ctx.filter = native ? css : "none";
  try {
    ctx.drawImage(source, rect.dx, rect.dy, rect.dw, rect.dh);
  } finally {
    ctx.filter = "none";
  }
  // Safari ignores ctx.filter, so grade the pixels ourselves there.
  if (hasFilter && !native) applyCssFilterToCanvas(ctx, w, h, css, { edge: "transparent" });
  if (overlay) applyOverlay(ctx, w, h, overlay);
  if (glow) applyGlow(ctx, w, h, glow);
}

/** Cover-crop rectangle: scales (sw x sh) to fill (w x h), centred. */
export function coverRect(sw: number, sh: number, w: number, h: number): PaintRect {
  const scale = Math.max(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  return { dx: (w - dw) / 2, dy: (h - dh) / 2, dw, dh };
}
