/**
 * Geometric shape family for lib/decor/strip-pieces.ts — squares (the most
 * explicit gap in the previous pass, which only ever rendered rectangular
 * straps) plus angular cutouts (diamond, triangle, trapezoid, hexagon,
 * octagon, arcs, crosses, letterforms).
 */

import { mulberry32 } from "@/lib/decor/seed";
import { jitterPoints } from "@/lib/decor/piece-materials";

function makeCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D | null } {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  return { canvas, ctx: canvas.getContext("2d") };
}

/** Plain solid block — the chunky, deliberately blunt option. */
export function offsetRect(color: string, w = 40, h = 40): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  return canvas;
}

/** Bold rectangle sized for a cover-line/tag treatment. */
export function chunkyBlock(color: string, w = 64, h = 30): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, w - 2, h - 2);
  return canvas;
}

/** Roughly square paper piece, torn on all four sides. */
export function tornSquare(color: string, size = 46, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const tear = size * 0.08;
  const step = size / 8;
  ctx.beginPath();
  for (let x = 0; x <= size; x += step) ctx.lineTo(x, rand() * tear);
  for (let y = 0; y <= size; y += step) ctx.lineTo(size - rand() * tear, y);
  for (let x = size; x >= 0; x -= step) ctx.lineTo(x, size - rand() * tear);
  for (let y = size; y >= 0; y -= step) ctx.lineTo(rand() * tear, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A quadrilateral with 4 independently-jittered corners — not a perfect rectangle. */
export function unevenRectangle(color: string, w = 50, h = 36, seed = 0): HTMLCanvasElement {
  const pad = 6;
  const { canvas, ctx } = makeCanvas(w + pad * 2, h + pad * 2);
  if (!ctx) return canvas;
  const corners = jitterPoints(
    [
      { x: pad, y: pad },
      { x: pad + w, y: pad },
      { x: pad + w, y: pad + h },
      { x: pad, y: pad + h },
    ],
    seed,
    pad * 0.7,
  );
  ctx.beginPath();
  corners.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A genuine square — not a rectangle with slightly different dimensions. Most instances get a tiny hand-cut corner jitter; some stay perfectly clean. */
export function square(color: string, size = 40, seed = 0): HTMLCanvasElement {
  const pad = 4;
  const { canvas, ctx } = makeCanvas(size + pad * 2, size + pad * 2);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const clean = rand() < 0.4;
  const corners = clean
    ? [
        { x: pad, y: pad },
        { x: pad + size, y: pad },
        { x: pad + size, y: pad + size },
        { x: pad, y: pad + size },
      ]
    : jitterPoints(
        [
          { x: pad, y: pad },
          { x: pad + size, y: pad },
          { x: pad + size, y: pad + size },
          { x: pad, y: pad + size },
        ],
        seed,
        pad * 0.5,
      );
  ctx.beginPath();
  corners.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A square with one corner clipped off diagonally. */
export function squareMissingCorner(color: string, size = 40, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const cut = size * (0.28 + rand() * 0.16);
  const corner = Math.floor(rand() * 4);
  const pts = [
    [0, 0],
    [size, 0],
    [size, size],
    [0, size],
  ];
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const [x, y] = pts[i];
    if (i === corner) {
      const [px, py] = pts[(i + 3) % 4];
      const [nx, ny] = pts[(i + 1) % 4];
      const ax = x + Math.sign(px - x) * cut;
      const ay = y + Math.sign(py - y) * cut;
      const bx = x + Math.sign(nx - x) * cut;
      const by = y + Math.sign(ny - y) * cut;
      if (i === 0) ctx.moveTo(ax, ay);
      else ctx.lineTo(ax, ay);
      ctx.lineTo(bx, by);
    } else if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A rotated square (rhombus) with slight point jitter. */
export function diamond(color: string, size = 44, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.48;
  const pts = [
    { x: cx, y: cy - r },
    { x: cx + r, y: cy },
    { x: cx, y: cy + r },
    { x: cx - r, y: cy },
  ].map((p) => ({ x: p.x + (rand() * 2 - 1) * r * 0.08, y: p.y + (rand() * 2 - 1) * r * 0.08 }));
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A triangle with a jittered apex — not perfectly symmetric. */
export function triangle(color: string, w = 44, h = 40, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const apexX = w * (0.4 + rand() * 0.2);
  ctx.beginPath();
  ctx.moveTo(apexX, 0);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A trapezoid with a jittered top width. */
export function trapezoid(color: string, w = 50, h = 34, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const inset = w * (0.18 + rand() * 0.12);
  ctx.beginPath();
  ctx.moveTo(inset, 0);
  ctx.lineTo(w - inset, 0);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

function regularPolygon(color: string, size: number, sides: number, seed: number, jitter = 0.1): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.46;
  const rotation = -Math.PI / 2 + rand() * (Math.PI / sides);
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (Math.PI * 2 * i) / sides;
    const rr = r * (1 - jitter / 2 + rand() * jitter);
    const x = cx + Math.cos(angle) * rr;
    const y = cy + Math.sin(angle) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A hexagon with slight point jitter — a hand-cut tech/craft badge shape. */
export function hexagon(color: string, size = 44, seed = 0): HTMLCanvasElement {
  return regularPolygon(color, size, 6, seed, 0.08);
}

/** An octagon with slight point jitter. */
export function octagon(color: string, size = 44, seed = 0): HTMLCanvasElement {
  return regularPolygon(color, size, 8, seed, 0.07);
}

/** A half-circle or quarter-circle wedge, chosen by seed — one generator, two looks. */
export function arcPiece(color: string, size = 44, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const isQuarter = rand() > 0.5;
  const sweep = isQuarter ? Math.PI / 2 : Math.PI;
  const startAngle = rand() * Math.PI * 2;
  ctx.beginPath();
  ctx.moveTo(size / 2, size / 2);
  ctx.arc(size / 2, size / 2, size * 0.48, startAngle, startAngle + sweep);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A plus/cross shape with a jittered arm-width. */
export function crossShape(color: string, size = 40, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const arm = size * (0.28 + rand() * 0.08);
  const inset = (size - arm) / 2;
  ctx.fillStyle = color;
  ctx.fillRect(inset, 0, arm, size);
  ctx.fillRect(0, inset, size, arm);
  return canvas;
}

/** An "L" or "T" letterform silhouette, chosen by seed. */
export function letterShape(color: string, size = 40, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const stroke = size * 0.3;
  ctx.fillStyle = color;
  if (rand() > 0.5) {
    // L
    ctx.fillRect(0, 0, stroke, size);
    ctx.fillRect(0, size - stroke, size, stroke);
  } else {
    // T
    ctx.fillRect(0, 0, size, stroke);
    ctx.fillRect((size - stroke) / 2, 0, stroke, size);
  }
  return canvas;
}
