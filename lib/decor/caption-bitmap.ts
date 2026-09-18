import { roundRectPath } from "@/lib/decor/canvas-utils";
import { readCssVar } from "@/lib/decor/theme-vars";
import type { ThemeColors } from "@/lib/themes";
import type { Lang } from "@/types";

/** Renders the caption + optional date as a single bitmap so Arabic/RTL text shapes correctly. One branch per theme's captionTreatment. */
export function renderCaptionBitmap(
  width: number,
  height: number,
  text: string,
  colors: ThemeColors,
  fontVar: string,
  fontSize: number,
  treatment: string,
  lang: Lang,
  /** "now-playing" — the user-editable "artist" row under the title, falls back to "Photo Booth". "boarding-pass" — the "TO" city, falls back to "DESTINATION". Unused otherwise. */
  subtitleText?: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  // "now-playing" and "boarding-pass" always show their fixed two-line
  // layout (falling back to placeholder text) so the card never looks
  // broken before the user has typed anything — every other treatment
  // stays hidden when empty.
  const alwaysShows = treatment === "now-playing" || treatment === "boarding-pass";
  if (!ctx || (!text.trim() && !alwaysShows)) return canvas;

  const family = readCssVar(fontVar) || "sans-serif";
  ctx.direction = lang === "ar" ? "rtl" : "ltr";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cx = width / 2;
  const cy = height / 2;

  if (treatment === "cover-line") {
    ctx.fillStyle = colors.accent;
    const barH = fontSize * 1.5;
    ctx.fillRect(0, cy - barH / 2, width, barH);
    ctx.fillStyle = "#ffffff";
    ctx.font = `900 ${fontSize}px ${family}`;
    ctx.fillText(text, cx, cy + fontSize * 0.04);
  } else if (treatment === "bubble") {
    const padX = fontSize * 0.9;
    ctx.font = `700 ${fontSize}px ${family}`;
    const metrics = ctx.measureText(text);
    const bw = Math.min(width - 8, metrics.width + padX * 2);
    const bh = fontSize * 1.9;
    ctx.fillStyle = colors.accent;
    roundRectPath(ctx, bw, bh, bh / 2);
    ctx.save();
    ctx.translate(cx - bw / 2, cy - bh / 2);
    roundRectPath(ctx, bw, bh, bh / 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, cx, cy + fontSize * 0.04);
  } else if (treatment === "stamp") {
    ctx.font = `700 ${fontSize}px ${family}`;
    ctx.fillStyle = colors.accent2;
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 1;
    const metrics = ctx.measureText(text);
    const bw = metrics.width + fontSize * 1.4;
    const bh = fontSize * 1.7;
    ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);
    ctx.fillText(text, cx, cy + fontSize * 0.04);
  } else if (treatment === "handwritten") {
    ctx.font = `400 ${fontSize}px ${family}`;
    ctx.fillStyle = colors.ink;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.03);
    ctx.fillText(text, 0, fontSize * 0.05);
    ctx.restore();
  } else if (treatment === "pixel") {
    ctx.font = `400 ${fontSize}px ${family}`;
    ctx.fillStyle = colors.ink;
    ctx.fillText(text, cx, cy + fontSize * 0.04);
  } else if (treatment === "now-playing") {
    // Left-aligned "track title" (the user's own caption) + a small muted
    // subtitle row directly below it — the title/artist block of a real
    // now-playing screen. Anchored to the TOP of this band, not centered,
    // since the now-playing-panel piece owns the rest of the band below it.
    const padX = width * 0.08;
    const titleY = height * 0.16;
    const title = text.trim() || "New Memory";
    ctx.direction = lang === "ar" ? "rtl" : "ltr";
    ctx.textAlign = lang === "ar" ? "right" : "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = colors.ink;
    ctx.font = `800 ${fontSize}px ${family}`;
    const titleX = lang === "ar" ? width - padX : padX;
    ctx.fillText(title, titleX, titleY, width - padX * 2);
    ctx.fillStyle = colors.muted;
    ctx.font = `500 ${fontSize * 0.55}px ${family}`;
    ctx.fillText(subtitleText?.trim() || "Photo Booth", titleX, titleY + fontSize * 0.72);
  } else if (treatment === "boarding-pass") {
    // A two-column ticket field row — FROM on the left, TO on the right,
    // split by a dotted divider like the reference boarding-pass stub.
    // Small uppercase Montserrat labels above bold Bebas Neue city names.
    const labelFamily = readCssVar("--font-montserrat") || "sans-serif";
    const from = text.trim() || "YOUR CITY";
    const to = subtitleText?.trim() || "DESTINATION";
    const padX = width * 0.08;
    const colGap = width * 0.06;
    const colW = (width - padX * 2 - colGap) / 2;
    const leftX = padX;
    const rightX = padX + colW + colGap;
    const labelY = height * 0.32;
    const valueY = height * 0.62;

    ctx.textBaseline = "alphabetic";
    ctx.direction = "ltr";
    ctx.textAlign = "left";

    ctx.fillStyle = colors.muted;
    ctx.font = `700 ${fontSize * 0.32}px ${labelFamily}`;
    ctx.fillText("FROM", leftX, labelY, colW);
    ctx.fillText("TO", rightX, labelY, colW);

    ctx.fillStyle = colors.ink;
    ctx.font = `400 ${fontSize}px ${family}`;
    ctx.fillText(from.toUpperCase(), leftX, valueY, colW);
    ctx.fillText(to.toUpperCase(), rightX, valueY, colW);

    ctx.strokeStyle = colors.muted;
    ctx.lineWidth = Math.max(1, fontSize * 0.03);
    ctx.setLineDash([fontSize * 0.06, fontSize * 0.12]);
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.18);
    ctx.lineTo(width / 2, height * 0.78);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (treatment === "airmail-tag") {
    ctx.font = `400 ${fontSize}px ${family}`;
    ctx.fillStyle = colors.ink;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.02);
    ctx.fillText(`SEND TO:  ${text}`, 0, fontSize * 0.05);
    ctx.restore();
  } else {
    ctx.font = `400 ${fontSize}px ${family}`;
    ctx.fillStyle = colors.muted;
    ctx.fillText(text, cx, cy + fontSize * 0.04);
  }

  return canvas;
}
