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
  /** "now-playing" only — the user-editable "artist" row under the title. Falls back to "Photo Booth" when blank. */
  subtitleText?: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  // "now-playing" always shows its title+subtitle row (falling back to a
  // placeholder title) so the card never looks broken when the user hasn't
  // typed a caption yet — every other treatment stays hidden when empty.
  if (!ctx || (!text.trim() && treatment !== "now-playing")) return canvas;

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
  } else if (treatment === "poster-arc") {
    // Bold, outlined, stacked event-flyer lettering.
    ctx.font = `900 ${fontSize}px ${family}`;
    ctx.lineWidth = Math.max(2, fontSize * 0.12);
    ctx.strokeStyle = colors.ink;
    ctx.fillStyle = colors.accent2;
    ctx.strokeText(text, cx, cy + fontSize * 0.04);
    ctx.fillText(text, cx, cy + fontSize * 0.04);
  } else if (treatment === "marker-headline") {
    // The user's own caption, styled as a thick hand-drawn marker headline.
    ctx.font = `700 ${fontSize}px ${family}`;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.02);
    ctx.lineWidth = Math.max(1.5, fontSize * 0.06);
    ctx.strokeStyle = colors.accent;
    ctx.fillStyle = colors.ink;
    ctx.strokeText(text, 0, fontSize * 0.05);
    ctx.fillText(text, 0, fontSize * 0.05);
    ctx.restore();
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
