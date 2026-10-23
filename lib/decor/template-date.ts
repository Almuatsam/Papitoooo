import { readCssVar } from "@/lib/decor/theme-vars";
import type { TemplateDateBox } from "@/lib/layouts/types";
import type { Lang } from "@/types";

/** Matches the glowing orange of the Halloween artwork's own title lettering. */
const DATE_FILL = "#f6a230";
const DATE_GLOW = "rgba(246, 162, 48, 0.85)";
const DATE_OUTLINE = "rgba(42, 15, 6, 0.6)";

/** Smallest font size (as a fraction of the box's) a long date may shrink to before it is left to overflow. */
const MIN_FONT_FRACTION = 0.6;

/** Localised "Oct 23, 2026"-style date, same format the standard caption uses. */
export function formatTemplateDate(lang: Lang, now: Date = new Date()): string {
  return now.toLocaleDateString(lang === "ar" ? "ar" : undefined, { year: "numeric", month: "short", day: "numeric" });
}

function dateFontFamily(lang: Lang): string {
  return readCssVar(lang === "ar" ? "--font-cairo" : "--font-fredoka") || "sans-serif";
}

/** next/font only fetches a face once something in the DOM uses it, so force it before the first canvas draw. */
export async function ensureDateFont(lang: Lang, text: string): Promise<void> {
  try {
    await document.fonts.load(`700 40px ${dateFontFamily(lang)}`, text);
  } catch {
    // font unavailable: the canvas falls back to the next family in the list
  }
}

/** Result bitmap plus where its top-left sits on the template. */
export interface DateBitmap {
  canvas: HTMLCanvasElement;
  left: number;
  top: number;
}

/**
 * Draws the date as a glowing orange line, centred on `box`, in the artwork's
 * colours: a soft glow plus a thin dark outline keep it legible on the
 * textured purple. Rendered as a bitmap (not Fabric text) so Arabic shapes
 * correctly, like the standard caption.
 */
export function renderTemplateDate(box: TemplateDateBox, text: string, lang: Lang): DateBitmap {
  const glowPad = Math.ceil(box.fontSize * 0.6);
  const width = box.maxWidth + glowPad * 2;
  const height = Math.ceil(box.fontSize * 1.6) + glowPad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const bitmap: DateBitmap = { canvas, left: Math.round(box.cx - width / 2), top: Math.round(box.cy - height / 2) };
  const ctx = canvas.getContext("2d");
  if (!ctx) return bitmap;

  const family = dateFontFamily(lang);
  ctx.direction = lang === "ar" ? "rtl" : "ltr";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let fontSize = box.fontSize;
  ctx.font = `700 ${fontSize}px ${family}`;
  const measured = ctx.measureText(text).width;
  if (measured > box.maxWidth) {
    fontSize = Math.max(box.fontSize * MIN_FONT_FRACTION, (box.fontSize * box.maxWidth) / measured);
    ctx.font = `700 ${fontSize}px ${family}`;
  }

  const cx = width / 2;
  const cy = height / 2;
  ctx.lineJoin = "round";
  ctx.lineWidth = fontSize * 0.12;
  ctx.strokeStyle = DATE_OUTLINE;
  ctx.strokeText(text, cx, cy);
  ctx.shadowColor = DATE_GLOW;
  ctx.shadowBlur = fontSize * 0.3;
  ctx.fillStyle = DATE_FILL;
  ctx.fillText(text, cx, cy);
  ctx.shadowBlur = 0;
  ctx.fillText(text, cx, cy);
  return bitmap;
}
