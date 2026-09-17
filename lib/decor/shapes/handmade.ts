/**
 * Handmade/physical shape family for lib/decor/strip-pieces.ts — small
 * craft-table scraps (a peeled corner, crumpled paper, a pull-tab, a
 * photo-corner mount, a generic die-cut silhouette) plus the photo-fragment
 * piece that duplicates an already-prepped photo.
 */

import { mulberry32 } from "@/lib/decor/seed";

function makeCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D | null } {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  return { canvas, ctx: canvas.getContext("2d") };
}

/** A smaller, rotated duplicate of a photo already prepped by the strip renderer. */
export function photoFragment(source: HTMLCanvasElement, w: number, h: number, borderColor: string): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, w, h);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = Math.max(2, w * 0.04);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
  return canvas;
}

/** A small peeled/folded corner triangle with a shadow underneath — just the corner tab, not a whole dog-eared page. */
export function foldedCorner(color: string, size = 40, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const flap = size * (0.55 + rand() * 0.2);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.moveTo(size - flap, size);
  ctx.lineTo(size, size);
  ctx.lineTo(size, size - flap);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.translate(size, size);
  ctx.rotate(Math.PI);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(flap * 0.92, 0);
  ctx.lineTo(0, flap * 0.92);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  const grad = ctx.createLinearGradient(size - flap, size - flap, size, size);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(size - flap, size);
  ctx.lineTo(size, size);
  ctx.lineTo(size, size - flap);
  ctx.closePath();
  ctx.fill();
  return canvas;
}

/** An irregular many-sided polygon with internal crease strokes — crumpled, not smooth. */
export function crumpledPaper(color: string, size = 48, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const sides = 9;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.44;
  const pts: { x: number; y: number }[] = [];
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides;
    const jitter = 0.7 + rand() * 0.5;
    const x = cx + Math.cos(angle) * r * jitter;
    const y = cy + Math.sin(angle) * r * jitter;
    pts.push({ x, y });
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.strokeStyle = "rgba(0,0,0,0.14)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const a = pts[Math.floor(rand() * pts.length)];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(a.x, a.y);
    ctx.stroke();
  }
  ctx.restore();
  return canvas;
}

/** A small pull-tab/bookmark shape — a rectangle with a notched top edge. */
export function paperTab(color: string, w = 34, h = 44, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const notch = h * (0.14 + rand() * 0.08);
  ctx.beginPath();
  ctx.moveTo(0, notch);
  ctx.lineTo(w / 2, 0);
  ctx.lineTo(w, notch);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A right-triangle photo-corner mount, like the paper corners used to hold old prints in an album. */
export function stickerCorner(color: string, size = 36, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const bow = size * (0.06 + rand() * 0.06);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size, 0);
  ctx.quadraticCurveTo(size - bow, size - bow, 0, size);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A generic wobbly die-cut silhouette — a rounder, more irregular hand-cut piece than irregular-cutout. */
export function dieCutPiece(color: string, size = 44, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const sides = 10;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.44;
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const angle = (Math.PI * 2 * i) / sides;
    const jitter = 0.82 + rand() * 0.3;
    const x = cx + Math.cos(angle) * r * jitter;
    const y = cy + Math.sin(angle) * r * jitter;
    if (i === 0) ctx.moveTo(x, y);
    else {
      const prevAngle = (Math.PI * 2 * (i - 1)) / sides;
      const midAngle = (angle + prevAngle) / 2;
      const midR = r * (0.9 + rand() * 0.2);
      ctx.quadraticCurveTo(cx + Math.cos(midAngle) * midR, cy + Math.sin(midAngle) * midR, x, y);
    }
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}
