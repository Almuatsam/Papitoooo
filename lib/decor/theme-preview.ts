/**
 * Small, cheap "real" preview of a theme for the theme browser cards —
 * paints the theme's actual background pattern/texture, outer frame style,
 * and 2-3 of its own piece-pool decorations via the real renderPiece()
 * pipeline, over two flat placeholder "photo" rectangles (no captured
 * photos needed). Deliberately plain Canvas 2D, not Fabric — a card grid of
 * 15 of these doesn't need a full StaticCanvas per tile.
 */

import type { PieceColorSlot, StripPiecePlacement, ThemeDef } from "@/lib/themes";
import { paintPattern } from "@/lib/decor/patterns";
import { paintTexture } from "@/lib/decor/textures";
import { renderPiece, seedFrom } from "@/lib/decor/strip-pieces";
import { selectDecorPieces } from "@/lib/decor/decoration-generator";

function resolveColor(slot: PieceColorSlot | undefined, theme: ThemeDef): string {
  if (!slot) return theme.colors.ink;
  if (slot === "paper") return theme.colors.paper;
  return theme.colors[slot];
}

export function renderThemePreview(theme: ThemeDef, seed: number, width = 92, height = 140): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const strip = theme.strip;
  const paper = theme.colors.paper;
  const keyline = theme.colors.ink;

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);

  try {
    if (strip.background.kind !== "solid") {
      const second = strip.background.patternUsesAccent ? theme.colors.accent2 : theme.colors.accent;
      const area = { x: 0, y: 0, w: width, h: height };
      if ((strip.background.kind === "pattern" || strip.background.kind === "pattern+texture") && strip.background.patternId) {
        paintPattern(ctx, area, strip.background.patternId, paper, second, 0.55);
      }
      if ((strip.background.kind === "texture" || strip.background.kind === "pattern+texture") && strip.background.textureId) {
        paintTexture(ctx, area, strip.background.textureId, theme.colors.ink, theme.colors.accent, 0.55);
      }
    }
  } catch {
    // A broken pattern/texture just leaves the plain paper colour — same
    // graceful-degradation rule as the real renderer.
  }

  // Two flat placeholder "photos" standing in for real captured frames.
  const pad = width * 0.12;
  const photoW = width - pad * 2;
  const photoH = photoW * 0.72;
  const gap = height * 0.05;
  ctx.fillStyle = "#c9c9cd";
  ctx.fillRect(pad, pad, photoW, photoH);
  ctx.fillRect(pad, pad + photoH + gap, photoW, photoH);

  // Outer frame indicator.
  if (strip.outerFrame.style !== "none") {
    ctx.strokeStyle = strip.outerFrame.style === "chrome" ? "#c8ccd0" : keyline;
    ctx.lineWidth = Math.max(1, width * 0.02);
    if (strip.outerFrame.style === "dashed") ctx.setLineDash([3, 2]);
    ctx.strokeRect(1, 1, width - 2, height - 2);
    ctx.setLineDash([]);
  }

  // A couple of the theme's own real decoration pieces, drawn tiny near the corners.
  try {
    const picked = selectDecorPieces(strip.piecePool, [2, 3], seed);
    picked.forEach((piece: StripPiecePlacement, i: number) => {
      const color = resolveColor(piece.color, theme);
      const secondaryColor = resolveColor(piece.secondaryColor, theme);
      const pieceCanvas = renderPiece(piece.kind, piece.material, color, 0.22, seedFrom(seed, "preview", i), {
        secondaryColor,
      });
      const corners = [
        { x: width * 0.15, y: height * 0.1 },
        { x: width * 0.85, y: height * 0.9 },
        { x: width * 0.85, y: height * 0.12 },
      ];
      const at = corners[i % corners.length];
      ctx.save();
      ctx.translate(at.x, at.y);
      ctx.rotate((piece.angle * Math.PI) / 180);
      ctx.drawImage(pieceCanvas, -pieceCanvas.width / 2, -pieceCanvas.height / 2);
      ctx.restore();
    });
  } catch {
    // A broken decoration piece just leaves the plain background — the
    // preview card degrades the same way the real renderer does.
  }

  return canvas;
}
