/**
 * Y2K decoration patterns. Each pattern is one canvas-drawn tile. The same
 * tile function backs both a CSS `background-image` data URL (for DOM chrome)
 * and a `CanvasPattern` used when baking the strip export — one drawing
 * routine, so preview and download always match (the same trick used for
 * photo filters).
 */

export type PatternId =
  | "stripes-h"
  | "stripes-v"
  | "stripes-diagonal"
  | "checker"
  | "dots"
  | "stars"
  | "hearts"
  | "waves"
  | "flowers";

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.42;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function heart(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.32);
  ctx.bezierCurveTo(cx - s, cy - s * 0.55, cx - s * 0.4, cy - s * 1.15, cx, cy - s * 0.45);
  ctx.bezierCurveTo(cx + s * 0.4, cy - s * 1.15, cx + s, cy - s * 0.55, cx, cy + s * 0.32);
  ctx.closePath();
  ctx.fill();
}

function flower(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  for (let i = 0; i < 5; i++) {
    const angle = ((Math.PI * 2) / 5) * i;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(angle) * r * 0.6, cy + Math.sin(angle) * r * 0.6, r * 0.5, r * 0.3, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.32, 0, Math.PI * 2);
  ctx.fill();
}

interface TileSpec {
  size: number;
  draw: (ctx: CanvasRenderingContext2D, size: number, colorA: string, colorB: string) => void;
}

const TILES: Record<PatternId, TileSpec> = {
  "stripes-h": {
    size: 24,
    draw: (ctx, size, colorA, colorB) => {
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = colorB;
      ctx.fillRect(0, 0, size, size / 2);
    },
  },
  "stripes-v": {
    size: 24,
    draw: (ctx, size, colorA, colorB) => {
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = colorB;
      ctx.fillRect(0, 0, size / 2, size);
    },
  },
  "stripes-diagonal": {
    size: 24,
    draw: (ctx, size, colorA, colorB) => {
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = colorB;
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-size, -size / 4, size * 2, size / 2);
      ctx.restore();
    },
  },
  checker: {
    size: 24,
    draw: (ctx, size, colorA, colorB) => {
      const half = size / 2;
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = colorB;
      ctx.fillRect(0, 0, half, half);
      ctx.fillRect(half, half, half, half);
    },
  },
  dots: {
    size: 22,
    draw: (ctx, size, colorA, colorB) => {
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = colorB;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size * 0.16, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  stars: {
    size: 34,
    draw: (ctx, size, colorA, colorB) => {
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = colorB;
      star(ctx, size * 0.28, size * 0.3, size * 0.13);
      star(ctx, size * 0.75, size * 0.68, size * 0.09);
    },
  },
  hearts: {
    size: 34,
    draw: (ctx, size, colorA, colorB) => {
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = colorB;
      heart(ctx, size * 0.3, size * 0.34, size * 0.14);
      heart(ctx, size * 0.74, size * 0.7, size * 0.1);
    },
  },
  waves: {
    size: 28,
    draw: (ctx, size, colorA, colorB) => {
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = colorB;
      ctx.lineWidth = size * 0.1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-size * 0.25, size * 0.5);
      ctx.quadraticCurveTo(size * 0.25, size * 0.1, size * 0.5, size * 0.5);
      ctx.quadraticCurveTo(size * 0.75, size * 0.9, size * 1.25, size * 0.5);
      ctx.stroke();
    },
  },
  flowers: {
    size: 40,
    draw: (ctx, size, colorA, colorB) => {
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = colorB;
      flower(ctx, size * 0.32, size * 0.34, size * 0.14);
      flower(ctx, size * 0.78, size * 0.72, size * 0.1);
    },
  },
};

function renderTileCanvas(id: PatternId, colorA: string, colorB: string, scale = 1): HTMLCanvasElement {
  const spec = TILES[id];
  const size = spec.size * scale;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(scale, scale);
  spec.draw(ctx, spec.size, colorA, colorB);
  return canvas;
}

/** CSS `background-image` data URL for a pattern — used for DOM chrome. */
export function patternDataUrl(id: PatternId, colorA: string, colorB: string, scale = 1): string {
  return renderTileCanvas(id, colorA, colorB, scale).toDataURL("image/png");
}

/** Fills a rect on a canvas with a repeating pattern — used when baking the strip export. */
export function paintPattern(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; w: number; h: number },
  id: PatternId,
  colorA: string,
  colorB: string,
  scale = 1,
): void {
  const tile = renderTileCanvas(id, colorA, colorB, scale);
  const pattern = ctx.createPattern(tile, "repeat");
  if (!pattern) return;
  ctx.save();
  ctx.fillStyle = pattern;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}
