/**
 * Physical "finish" for strip pieces — the part that makes a piece read as
 * a real material sitting on a page rather than a flat-filled shape. Takes
 * an already-drawn opaque shape canvas (from lib/decor/strip-pieces.ts) and
 * composites a soft shadow, grain, and/or gloss on top of it, confined to
 * the shape's own silhouette via `globalCompositeOperation = "source-atop"`
 * so the finish never bleeds into the piece's transparent margin.
 *
 * Also home to `drawRhinestoneCluster` — a scatter of small irregular
 * faceted gem polygons, not one flat diamond icon.
 *
 * Everything here is seeded (lib/decor/seed.ts), never `Math.random()`.
 */

import { mulberry32 } from "@/lib/decor/seed";
import type { MaterialId } from "@/lib/themes";

interface ShadowSpec {
  blur: number;
  offsetX: number;
  offsetY: number;
  alpha: number;
}

type GlossKind = "soft" | "strong" | "holographic" | "chrome";

interface FinishSpec {
  shadow?: ShadowSpec;
  /** 0-1 grain density. */
  grain?: number;
  gloss?: GlossKind;
  /** Overall translucency (plastic, glass-like materials). */
  alpha?: number;
  /** Draws a soft offset duplicate underneath to fake a raised/inflated edge. */
  puffy?: boolean;
}

const FINISH: Record<MaterialId, FinishSpec> = {
  paper: { shadow: { blur: 3, offsetX: 1, offsetY: 2, alpha: 0.18 }, grain: 0.5 },
  "paper-cutout": { shadow: { blur: 4, offsetX: 2, offsetY: 3, alpha: 0.28 }, grain: 0.4 },
  vinyl: { shadow: { blur: 3, offsetX: 1, offsetY: 2, alpha: 0.22 }, gloss: "strong" },
  plastic: { shadow: { blur: 2, offsetX: 1, offsetY: 1, alpha: 0.15 }, gloss: "soft", alpha: 0.8 },
  puffy: { shadow: { blur: 4, offsetX: 2, offsetY: 3, alpha: 0.25 }, gloss: "soft", puffy: true },
  holographic: { shadow: { blur: 3, offsetX: 1, offsetY: 2, alpha: 0.2 }, gloss: "holographic" },
  chrome: { shadow: { blur: 3, offsetX: 1, offsetY: 2, alpha: 0.3 }, gloss: "chrome" },
  glitter: { shadow: { blur: 2, offsetX: 1, offsetY: 1, alpha: 0.15 }, grain: 0.9 },
  rhinestone: { shadow: { blur: 2, offsetX: 1, offsetY: 1, alpha: 0.2 }, gloss: "chrome" },
  "hand-drawn": {},
  // Matte ribbon/woven feel: soft shadow, no gloss, a dashed stitch-line
  // overlay just inside the silhouette (see applyStitchOverlay below).
  fabric: { shadow: { blur: 3, offsetX: 1, offsetY: 2, alpha: 0.16 } },
  // Paper-cutout shadow/grain but with a halftone dot overlay instead of
  // scattered grain — glossy print-stock feel.
  magazine: { shadow: { blur: 3, offsetX: 2, offsetY: 2, alpha: 0.24 } },
};

function applyGrainOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, intensity: number): void {
  const rand = mulberry32(seed ^ 0x9e3779b9);
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  const count = Math.round(36 * intensity);
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const dark = rand() > 0.5;
    ctx.fillStyle = dark ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.14)";
    const s = 1 + rand() * 1.4;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

/** Small regular dashed tick marks just inside the silhouette — a stitched/woven ribbon edge. */
function applyStitchOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number): void {
  const rand = mulberry32(seed ^ 0x27d4eb2f);
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  const inset = Math.min(w, h) * 0.14;
  ctx.strokeRect(inset, inset, Math.max(1, w - inset * 2), Math.max(1, h - inset * 2));
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  for (let i = 0; i < 6; i++) {
    const x = rand() * w;
    const y = rand() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3, y + 1);
    ctx.stroke();
  }
  ctx.restore();
}

/** A sparse grid of small dots at varied opacity — glossy print-stock halftone, distinct from grain's scattered noise. */
function applyHalftoneOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number): void {
  const rand = mulberry32(seed ^ 0x165667b1);
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  const step = Math.max(4, Math.min(w, h) * 0.12);
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      const jx = x + (rand() * 2 - 1) * step * 0.2;
      const jy = y + (rand() * 2 - 1) * step * 0.2;
      ctx.fillStyle = rand() > 0.5 ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.16)";
      ctx.beginPath();
      ctx.arc(jx, jy, step * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function applyGlossOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, kind: GlossKind): void {
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  if (kind === "holographic") {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "rgba(255,143,200,0.32)");
    grad.addColorStop(0.35, "rgba(168,216,255,0.28)");
    grad.addColorStop(0.65, "rgba(255,212,60,0.26)");
    grad.addColorStop(1, "rgba(255,143,200,0.3)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    const rand = mulberry32(seed ^ 0x51ed3a);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(rand() * w, rand() * h);
      ctx.rotate(((rand() * 40 - 20) * Math.PI) / 180);
      ctx.fillRect(-w * 0.15, -1, w * 0.3, 2);
      ctx.restore();
    }
  } else if (kind === "chrome") {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(255,255,255,0.55)");
    grad.addColorStop(0.22, "rgba(255,255,255,0.08)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.16)");
    grad.addColorStop(0.78, "rgba(255,255,255,0.1)");
    grad.addColorStop(1, "rgba(255,255,255,0.4)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, `rgba(255,255,255,${kind === "strong" ? 0.38 : 0.2})`);
    grad.addColorStop(0.4, "rgba(255,255,255,0)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

/** Composites a material's shadow/grain/gloss onto an already-drawn shape canvas. Returns a new (possibly padded) canvas. */
export function applyMaterialFinish(shape: HTMLCanvasElement, material: MaterialId, seed: number): HTMLCanvasElement {
  const spec = FINISH[material] ?? {};
  const pad = spec.shadow
    ? Math.ceil(spec.shadow.blur + Math.max(Math.abs(spec.shadow.offsetX), Math.abs(spec.shadow.offsetY))) + 2
    : 0;
  const w = shape.width + pad * 2;
  const h = shape.height + pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return shape;

  if (spec.puffy) {
    ctx.globalAlpha = 0.35;
    ctx.drawImage(shape, pad + 2, pad + 3);
    ctx.globalAlpha = 1;
  }

  if (spec.shadow) {
    ctx.save();
    ctx.shadowColor = `rgba(0,0,0,${spec.shadow.alpha})`;
    ctx.shadowBlur = spec.shadow.blur;
    ctx.shadowOffsetX = spec.shadow.offsetX;
    ctx.shadowOffsetY = spec.shadow.offsetY;
    ctx.globalAlpha = spec.alpha ?? 1;
    ctx.drawImage(shape, pad, pad);
    ctx.restore();
  } else {
    ctx.globalAlpha = spec.alpha ?? 1;
    ctx.drawImage(shape, pad, pad);
    ctx.globalAlpha = 1;
  }

  if (spec.grain) applyGrainOverlay(ctx, w, h, seed, spec.grain);
  if (spec.gloss) applyGlossOverlay(ctx, w, h, seed, spec.gloss);
  if (material === "fabric") applyStitchOverlay(ctx, w, h, seed);
  if (material === "magazine") applyHalftoneOverlay(ctx, w, h, seed);

  return canvas;
}

/** Perturbs a set of polygon points outward/inward by a small seeded amount — shared by torn/uneven shape edges. */
export function jitterPoints(points: { x: number; y: number }[], seed: number, amount: number): { x: number; y: number }[] {
  const rand = mulberry32(seed);
  return points.map((p) => ({
    x: p.x + (rand() * 2 - 1) * amount,
    y: p.y + (rand() * 2 - 1) * amount,
  }));
}

/**
 * A loose cluster of 3-7 small irregular faceted gems — "someone glued
 * rhinestones onto a scrapbook page," not one flat diamond icon. Each gem
 * gets its own size/rotation/opacity and a tiny highlight; spacing is
 * intentionally imperfect.
 */
export function drawRhinestoneCluster(
  w: number,
  h: number,
  seed: number,
  colorA: string,
  colorB: string,
  count = 5,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const rand = mulberry32(seed);

  for (let i = 0; i < count; i++) {
    const cx = w * (0.18 + rand() * 0.64);
    const cy = h * (0.18 + rand() * 0.64);
    const r = Math.min(w, h) * (0.08 + rand() * 0.1);
    const sides = 5 + Math.floor(rand() * 2);
    const rotation = rand() * Math.PI * 2;

    ctx.beginPath();
    for (let s = 0; s < sides; s++) {
      const angle = rotation + (Math.PI * 2 * s) / sides;
      const jitter = 0.8 + rand() * 0.32;
      const x = cx + Math.cos(angle) * r * jitter;
      const y = cy + Math.sin(angle) * r * jitter;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.globalAlpha = 0.82 + rand() * 0.18;
    ctx.fillStyle = rand() > 0.32 ? colorA : colorB;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.25, cy - r * 0.3, r * 0.22, r * 0.12, rotation, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}
