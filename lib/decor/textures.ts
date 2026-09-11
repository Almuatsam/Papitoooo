/**
 * Subtle Y2K textures — paper grain, glitter speckle, camera scanlines,
 * magazine halftone. Kept low-opacity by design so the photos stay the
 * focus. Same dual-use approach as patterns.ts: one canvas routine backs
 * both a CSS data URL (DOM chrome) and a direct paint onto the export canvas.
 */

export type TextureId = "grain" | "paper" | "glitter" | "scanlines" | "halftone";

interface TextureSpec {
  size: number;
  draw: (ctx: CanvasRenderingContext2D, size: number, ink: string, accent: string) => void;
}

const TEXTURES: Record<TextureId, TextureSpec> = {
  grain: {
    size: 90,
    draw: (ctx, size, ink) => {
      for (let i = 0; i < 260; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const a = Math.random() * 0.05;
        ctx.fillStyle = ink;
        ctx.globalAlpha = a;
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;
    },
  },
  paper: {
    size: 100,
    draw: (ctx, size, ink) => {
      ctx.strokeStyle = ink;
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const len = 3 + Math.random() * 6;
        const angle = Math.random() * Math.PI;
        ctx.globalAlpha = 0.03 + Math.random() * 0.03;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  },
  glitter: {
    size: 120,
    draw: (ctx, size, ink, accent) => {
      for (let i = 0; i < 70; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 0.6 + Math.random() * 1.6;
        ctx.fillStyle = Math.random() > 0.5 ? accent : "#ffffff";
        ctx.globalAlpha = 0.35 + Math.random() * 0.45;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  },
  scanlines: {
    size: 8,
    draw: (ctx, size, ink) => {
      ctx.fillStyle = ink;
      ctx.globalAlpha = 0.06;
      ctx.fillRect(0, 0, size, 1);
      ctx.globalAlpha = 1;
    },
  },
  halftone: {
    size: 16,
    draw: (ctx, size, ink) => {
      ctx.fillStyle = ink;
      ctx.globalAlpha = 0.5;
      const r = 1 + Math.random() * 1.6;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    },
  },
};

function renderTile(id: TextureId, ink: string, accent: string, scale = 1): HTMLCanvasElement {
  const spec = TEXTURES[id];
  const size = spec.size * scale;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(scale, scale);
  spec.draw(ctx, spec.size, ink, accent);
  return canvas;
}

export function textureDataUrl(id: TextureId, ink: string, accent: string, scale = 1): string {
  return renderTile(id, ink, accent, scale).toDataURL("image/png");
}

export function paintTexture(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; w: number; h: number },
  id: TextureId,
  ink: string,
  accent: string,
  scale = 1,
): void {
  const tile = renderTile(id, ink, accent, scale);
  const pattern = ctx.createPattern(tile, "repeat");
  if (!pattern) return;
  ctx.save();
  ctx.fillStyle = pattern;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}
