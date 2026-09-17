import { drawAirplaneIcon, drawFlightStreaks } from "@/lib/decor/shapes/signature";
import { readCssVar } from "@/lib/decor/theme-vars";

/**
 * The solid-color band across the top of the Boarding Pass card — a small
 * airplane glyph + motion streaks, then the label, both in `labelColor` (the
 * paper colour, for contrast against whatever `bandColor` the user picked).
 * `bandColor` is resolved by the caller (theme default or the user's
 * RenderStripInput.accentColor override) — this module has no opinion on it.
 */
export function renderHeaderBand(
  canvasW: number,
  height: number,
  bandColor: string,
  labelColor: string,
  label: string,
  headlineFontVar: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = bandColor;
  ctx.fillRect(0, 0, canvasW, height);

  const padX = height * 0.45;
  const iconSize = height * 0.5;
  const iconCx = padX + iconSize * 0.3;
  const iconCy = height / 2;
  drawFlightStreaks(ctx, iconCx - iconSize * 0.55, iconCy, iconSize * 0.7, labelColor);
  drawAirplaneIcon(ctx, iconCx, iconCy, iconSize, labelColor, -35);

  const family = readCssVar(headlineFontVar) || "sans-serif";
  ctx.fillStyle = labelColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `400 ${height * 0.44}px ${family}`;
  ctx.fillText(label, iconCx + iconSize * 0.85, height / 2 + height * 0.04, canvasW - iconCx - iconSize);

  return canvas;
}
