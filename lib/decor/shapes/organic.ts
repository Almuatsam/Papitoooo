/**
 * Organic shape family for lib/decor/strip-pieces.ts — blobs, florals, and
 * soft rounded pieces (clouds, starbursts, bubbles, crescents, squiggles).
 */

import { mulberry32 } from "@/lib/decor/seed";

function makeCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D | null } {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  return { canvas, ctx: canvas.getContext("2d") };
}

/** Bezier-curved blobby paper piece — rounder than a jittered polygon. */
export function organicBlob(color: string, size = 44, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const cx = size / 2;
  const cy = size / 2;
  const points = 6;
  const base = size * 0.36;
  const radii = Array.from({ length: points }, () => base * (0.75 + rand() * 0.5));
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const angle = (Math.PI * 2 * i) / points;
    const r = radii[i % points];
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevAngle = (Math.PI * 2 * (i - 1)) / points;
      const prevR = radii[(i - 1) % points];
      const c1x = cx + Math.cos(prevAngle + 0.3) * prevR * 1.15;
      const c1y = cy + Math.sin(prevAngle + 0.3) * prevR * 1.15;
      const c2x = cx + Math.cos(angle - 0.3) * r * 1.15;
      const c2y = cy + Math.sin(angle - 0.3) * r * 1.15;
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
    }
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** Irregular blobby polygon — a hand-cut sticker silhouette, not a circle. */
export function irregularCutout(color: string, size = 40, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const sides = 6 + Math.floor(rand() * 2);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides;
    const jitter = 0.72 + rand() * 0.42;
    const x = cx + Math.cos(angle) * r * jitter;
    const y = cy + Math.sin(angle) * r * jitter;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A chunky flat paper star — a shape piece, not a sticker icon. */
export function starPiece(color: string, size = 44, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.46;
  const rInner = size * 0.2;
  const points = 5;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    let r = i % 2 === 0 ? rOuter : rInner;
    r *= 0.92 + rand() * 0.16;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A 4-point sparkle/starburst — deeply pinched inner radius, distinct from starPiece's fat 5-point star. */
export function sparkleStar(color: string, size = 44, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.48;
  const rInner = size * 0.13;
  const points = 4;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    let r = i % 2 === 0 ? rOuter : rInner;
    r *= 0.94 + rand() * 0.12;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A simple 5-petal flat paper flower shape. */
export function flowerPiece(color: string, size = 44, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const cx = size / 2;
  const cy = size / 2;
  const petalR = size * 0.22;
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 + rand() * 0.15;
    const px = cx + Math.cos(angle) * size * 0.24;
    const py = cy + Math.sin(angle) * size * 0.24;
    ctx.beginPath();
    ctx.ellipse(px, py, petalR * (0.85 + rand() * 0.3), petalR * 0.68, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.14, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

/** A cluster of overlapping circles along a base line — a paper cloud puff. */
export function cloudPiece(color: string, size = 50, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size * 0.62);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const h = size * 0.62;
  const puffs = 4 + Math.floor(rand() * 2);
  ctx.fillStyle = color;
  for (let i = 0; i < puffs; i++) {
    const x = (size / puffs) * (i + 0.5) + (rand() * 2 - 1) * (size / puffs) * 0.2;
    const r = h * (0.42 + rand() * 0.22);
    ctx.beginPath();
    ctx.arc(x, h * 0.65, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillRect(size * 0.1, h * 0.5, size * 0.8, h * 0.4);
  return canvas;
}

/** Many thin spiky rays from a center — distinct from the rounder 5-point star-piece. */
export function starburstPiece(color: string, size = 46, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const cx = size / 2;
  const cy = size / 2;
  const rays = 10 + Math.floor(rand() * 4);
  const rOuter = size * 0.48;
  const rInner = size * 0.08;
  ctx.beginPath();
  for (let i = 0; i < rays * 2; i++) {
    const r = (i % 2 === 0 ? rOuter : rInner) * (0.88 + rand() * 0.24);
    const angle = (Math.PI / rays) * i;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A softly irregular round paper/puffy piece — not a perfect circle. */
export function bubblePiece(color: string, size = 40, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const cx = size / 2;
  const cy = size / 2;
  const rx = size * 0.46 * (0.92 + rand() * 0.16);
  const ry = size * 0.46 * (0.92 + rand() * 0.16);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, rand() * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A crescent-moon sliver, built from two offset circular cutouts. */
export function crescentPiece(color: string, size = 44, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const r = size * 0.42;
  const offset = r * (0.5 + rand() * 0.25);
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(size / 2 + offset, size / 2 - offset * 0.35, r * 0.92, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return canvas;
}

/** A continuous S-curve doodle — a standalone squiggle piece, distinct from the marker-stroke scribble-strip band. */
export function squigglePiece(color: string, size = 60, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size * 0.5);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const h = size * 0.5;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2.5, h * 0.18);
  ctx.lineCap = "round";
  const amp = h * (0.3 + rand() * 0.2);
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.bezierCurveTo(size * 0.25, h / 2 - amp, size * 0.4, h / 2 + amp, size * 0.6, h / 2);
  ctx.bezierCurveTo(size * 0.75, h / 2 - amp, size * 0.85, h / 2 + amp, size, h / 2);
  ctx.stroke();
  return canvas;
}
