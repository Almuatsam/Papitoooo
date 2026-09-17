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
  | "glitter-flakes"
  | "stars"
  | "hearts"
  | "waves"
  | "flowers"
  | "psychedelic-swirl"
  | "maze-lines"
  | "polka-dot"
  | "grid-paper";

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

/** One irregular, randomly-rotated glitter flake — never a circle, so the
 * tile reads as sparkly grit rather than polka dots. */
function flake(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  const sides = 5 + Math.floor(Math.random() * 2);
  const rotation = Math.random() * Math.PI * 2;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (Math.PI * 2 * i) / sides;
    const jitter = 0.55 + Math.random() * 0.55;
    const px = cx + Math.cos(angle) * r * jitter;
    const py = cy + Math.sin(angle) * r * jitter;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/** A single swirling arc segment, offset from centre — several of these layered make a psychedelic linework tile. */
function swirlArc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rotation: number): void {
  ctx.beginPath();
  ctx.arc(cx, cy, r, rotation, rotation + Math.PI * 1.4);
  ctx.stroke();
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
  "glitter-flakes": {
    // Dense sparkly glitter: irregular flakes at varied sizes/opacities plus
    // a handful of brighter white "glints" scattered on top, on a solid
    // colour base — not evenly-spaced dots. Bigger tile than the other
    // patterns so a good amount of grit fits before it repeats.
    size: 64,
    draw: (ctx, size, colorA, colorB) => {
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, size, size);

      // Bulk of the glitter: small irregular flakes in the accent colour.
      for (let i = 0; i < 46; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 0.8 + Math.random() * 2.2;
        ctx.globalAlpha = 0.45 + Math.random() * 0.5;
        ctx.fillStyle = colorB;
        flake(ctx, x, y, r);
      }

      // Fine white specular sparkle, scattered independently.
      for (let i = 0; i < 16; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 0.5 + Math.random() * 1.1;
        ctx.globalAlpha = 0.7 + Math.random() * 0.3;
        ctx.fillStyle = "#ffffff";
        flake(ctx, x, y, r);
      }

      // A few larger bright glints for the "catches the light" highlight.
      for (let i = 0; i < 6; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 1.8 + Math.random() * 1.6;
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = "#ffffff";
        flake(ctx, x, y, r);
      }

      ctx.globalAlpha = 1;
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
  "psychedelic-swirl": {
    size: 56,
    draw: (ctx, size, colorA, colorB) => {
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = colorB;
      ctx.lineWidth = size * 0.06;
      ctx.lineCap = "round";
      const cx = size * 0.5;
      const cy = size * 0.5;
      for (let i = 0; i < 4; i++) {
        swirlArc(ctx, cx, cy, size * (0.14 + i * 0.1), (Math.PI / 2) * i);
      }
    },
  },
  "maze-lines": {
    // A continuous right-angle corridor line per tile — reads as an
    // arcade-maze grid (Pac-Man-style corridors), not a zigzag/chevron
    // print. Segments start/end at fixed edge fractions so adjacent tiles'
    // corridors roughly line up when repeated.
    size: 96,
    draw: (ctx, size, colorA, colorB) => {
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = colorB;
      ctx.lineWidth = size * 0.07;
      ctx.lineCap = "square";
      ctx.lineJoin = "miter";
      const s = size;
      ctx.beginPath();
      ctx.moveTo(s * 0.15, 0);
      ctx.lineTo(s * 0.15, s * 0.4);
      ctx.lineTo(s * 0.55, s * 0.4);
      ctx.lineTo(s * 0.55, s * 0.75);
      ctx.lineTo(s, s * 0.75);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, s * 0.65);
      ctx.lineTo(s * 0.3, s * 0.65);
      ctx.lineTo(s * 0.3, s);
      ctx.stroke();
    },
  },
  "polka-dot": {
    size: 30,
    draw: (ctx, size, colorA, colorB) => {
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = colorB;
      const r = size * 0.13;
      ctx.beginPath();
      ctx.arc(size * 0.25, size * 0.25, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.75, size * 0.75, r, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  "grid-paper": {
    size: 26,
    draw: (ctx, size, colorA, colorB) => {
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = colorB;
      ctx.lineWidth = Math.max(0.6, size * 0.03);
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(0, size - 0.5);
      ctx.lineTo(size, size - 0.5);
      ctx.moveTo(size - 0.5, 0);
      ctx.lineTo(size - 0.5, size);
      ctx.stroke();
      ctx.globalAlpha = 1;
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
