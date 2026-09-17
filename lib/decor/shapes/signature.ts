/**
 * Signature shape family for lib/decor/strip-pieces.ts — one bespoke,
 * genuinely-structural graphic per theme (barcode, receipt header/footer,
 * a boarding-pass route-field block, postage stamp, wax seal, ...). Unlike
 * the straps/geometric/organic/handmade families, these aren't reusable
 * across themes — each exists because one of the 7 reference photos needs
 * it. Drawn with plain canvas 2D (including `ctx.fillText`, same technique
 * `renderCaptionBitmap` already uses), then finished by the same
 * lib/decor/piece-materials.ts pipeline as every other piece.
 */

import { mulberry32 } from "@/lib/decor/seed";

function makeCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D | null } {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  return { canvas, ctx: canvas.getContext("2d") };
}

/** Shared bar-drawing routine — used standalone by `barcode` and inline by `receiptFooter`. */
function drawBarcodeBars(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed: number): void {
  const rand = mulberry32(seed);
  let cursor = x;
  const end = x + w;
  while (cursor < end - 1) {
    const barW = 1 + rand() * 3;
    if (rand() > 0.4) ctx.fillRect(cursor, y, barW, h);
    cursor += barW + 0.6 + rand() * 1.2;
  }
}

/** A generic parallel-bar barcode graphic — purely decorative, encodes nothing. */
export function barcode(color: string, w = 90, h = 28, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  ctx.fillStyle = color;
  drawBarcodeBars(ctx, 0, 0, w, h, seed);
  return canvas;
}

/** An ornate circular corner badge — an original abstract mountain/fan-style motif, not any real festival's artwork. */
export function cornerMedallion(color: string, secondaryColor: string, size = 44, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.44;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  const notches = 10;
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  for (let i = 0; i < notches; i++) {
    const angle = (Math.PI * 2 * i) / notches + rand() * 0.1;
    const x = cx + Math.cos(angle) * r * 0.92;
    const y = cy + Math.sin(angle) * r * 0.92;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.045, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = secondaryColor;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.42, cy + r * 0.3);
  ctx.lineTo(cx, cy - r * 0.36);
  ctx.lineTo(cx + r * 0.42, cy + r * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#101014";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  return canvas;
}

/**
 * A "now playing" control stack — scrubber + elapsed/remaining time,
 * prev/play-pause/next transport row, a volume bar, and a small bottom
 * utility-icon row. Structural reference only (spacing/hierarchy of a
 * real now-playing screen); every glyph here is an original generic
 * shape, not any specific app's icon set or wordmark.
 */
export function nowPlayingPanel(color: string, mutedColor: string, w = 580, h = 220): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const marginX = w * 0.07;
  const trackW = w - marginX * 2;

  // ---- progress scrubber -------------------------------------------------
  const trackY = h * 0.12;
  const trackH = Math.max(2, h * 0.018);
  ctx.fillStyle = mutedColor;
  ctx.globalAlpha = 0.35;
  roundRectAt(ctx, marginX, trackY - trackH / 2, trackW, trackH, trackH / 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  const fillFrac = 0.32;
  ctx.fillStyle = color;
  roundRectAt(ctx, marginX, trackY - trackH / 2, trackW * fillFrac, trackH, trackH / 2);
  ctx.fill();
  const knobX = marginX + trackW * fillFrac;
  ctx.beginPath();
  ctx.arc(knobX, trackY, h * 0.032, 0, Math.PI * 2);
  ctx.fill();

  const timeSize = h * 0.06;
  ctx.font = `500 ${timeSize}px monospace`;
  ctx.fillStyle = mutedColor;
  ctx.textBaseline = "middle";
  const timeY = trackY + h * 0.09;
  ctx.textAlign = "left";
  ctx.fillText("0:42", marginX, timeY);
  ctx.textAlign = "right";
  ctx.fillText("-2:18", marginX + trackW, timeY);

  // ---- transport row (prev / play-pause / next) --------------------------
  const ctrlY = h * 0.44;
  const cx = w / 2;
  const primaryR = h * 0.115;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, ctrlY, primaryR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  const barW = primaryR * 0.22;
  const barH = primaryR * 0.8;
  ctx.fillRect(cx - barW * 1.6, ctrlY - barH / 2, barW, barH);
  ctx.fillRect(cx + barW * 0.6, ctrlY - barH / 2, barW, barH);

  ctx.fillStyle = color;
  drawSkipGlyph(ctx, cx - primaryR * 2.3, ctrlY, primaryR * 0.62, -1);
  drawSkipGlyph(ctx, cx + primaryR * 2.3, ctrlY, primaryR * 0.62, 1);

  // ---- volume bar ---------------------------------------------------------
  const volY = h * 0.7;
  const iconR = h * 0.03;
  drawSpeaker(ctx, marginX + iconR, volY, iconR, mutedColor, false);
  drawSpeaker(ctx, marginX + trackW - iconR, volY, iconR * 1.3, mutedColor, true);
  const volBarX = marginX + iconR * 3.2;
  const volBarW = trackW - iconR * 6.4;
  const volH = Math.max(2, h * 0.014);
  ctx.fillStyle = mutedColor;
  ctx.globalAlpha = 0.3;
  roundRectAt(ctx, volBarX, volY - volH / 2, volBarW, volH, volH / 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = mutedColor;
  roundRectAt(ctx, volBarX, volY - volH / 2, volBarW * 0.55, volH, volH / 2);
  ctx.fill();

  // ---- bottom utility icon row --------------------------------------------
  const iconY = h * 0.92;
  const iconSize = h * 0.05;
  ctx.strokeStyle = mutedColor;
  ctx.fillStyle = mutedColor;
  ctx.lineWidth = Math.max(1, h * 0.008);
  drawCaptionsGlyph(ctx, marginX + iconSize, iconY, iconSize);
  drawCastGlyph(ctx, cx, iconY, iconSize);
  drawQueueGlyph(ctx, marginX + trackW - iconSize, iconY, iconSize);

  return canvas;
}

function roundRectAt(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** A skip-back/skip-forward glyph: triangle + end bar, mirrored by `dir`. */
function drawSkipGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, dir: 1 | -1): void {
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.5 * dir, cy - r * 0.6);
  ctx.lineTo(cx - r * 0.5 * dir, cy + r * 0.6);
  ctx.lineTo(cx + r * 0.55 * dir, cy);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(cx + r * 0.55 * dir - (dir > 0 ? 0 : r * 0.22), cy - r * 0.6, r * 0.22, r * 1.2);
}

/** A generic speaker glyph — body + one or two volume arcs, no brand icon. */
function drawSpeaker(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, loud: boolean): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - r * 1.6, cy - r * 0.5);
  ctx.lineTo(cx - r * 0.7, cy - r * 0.5);
  ctx.lineTo(cx, cy - r * 1.1);
  ctx.lineTo(cx, cy + r * 1.1);
  ctx.lineTo(cx - r * 0.7, cy + r * 0.5);
  ctx.lineTo(cx - r * 1.6, cy + r * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, r * 0.22);
  ctx.beginPath();
  ctx.arc(cx + r * 0.3, cy, r * 1.1, -0.5, 0.5);
  ctx.stroke();
  if (loud) {
    ctx.beginPath();
    ctx.arc(cx + r * 0.3, cy, r * 1.7, -0.6, 0.6);
    ctx.stroke();
  }
}

/** A captions/subtitle glyph — a small rounded tile with two text dashes. */
function drawCaptionsGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  roundRectAt(ctx, cx - size, cy - size * 0.7, size * 2, size * 1.4, size * 0.25);
  ctx.stroke();
  ctx.fillRect(cx - size * 0.65, cy - size * 0.2, size * 0.8, size * 0.2);
  ctx.fillRect(cx - size * 0.65, cy + size * 0.15, size * 1.3, size * 0.2);
}

/** A cast/stream glyph — a small screen with broadcast arcs at one corner. */
function drawCastGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  roundRectAt(ctx, cx - size, cy - size * 0.7, size * 2, size * 1.3, size * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - size, cy + size * 0.7, size * 0.35, -Math.PI / 2, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - size, cy + size * 0.7, size * 0.7, -Math.PI / 2, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - size * 0.65, cy + size * 0.7, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

/** A queue/list glyph — three stacked lines with a small leading square. */
function drawQueueGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  for (let i = -1; i <= 1; i++) {
    const y = cy + i * size * 0.5;
    ctx.fillRect(cx - size, y - size * 0.08, size * 0.35, size * 0.16);
    ctx.fillRect(cx - size * 0.5, y - size * 0.06, size * 1.5, size * 0.12);
  }
}

/** A small ticket field grid (e.g. FROM/TO or GATE/SEAT) with placeholder-style text, boarding-pass style. */
export function routeFieldBlock(color: string, w = 120, h = 44, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const labelPairs = [
    ["FROM", "TO"],
    ["GATE", "SEAT"],
  ];
  const labels = labelPairs[Math.floor(rand() * labelPairs.length)];
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  ctx.beginPath();
  ctx.moveTo(w / 2, 2);
  ctx.lineTo(w / 2, h - 2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.font = "700 7px monospace";
  ctx.fillText(labels[0], 5, 13);
  ctx.fillText(labels[1], w / 2 + 5, 13);
  ctx.font = "400 9px monospace";
  ctx.fillText("——", 5, h - 8);
  ctx.fillText("——", w / 2 + 5, h - 8);
  return canvas;
}

/** RECEIPT title + a QTY/ITEM header row + a few itemized lines — wide, anchored to "frame", meant to span most of the strip's width. */
export function receiptHeader(color: string, w = 600, h = 110): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  // Every size below is a fraction of `h` (not a fixed px value) so this
  // piece stays legible at whatever scale a theme author picks it at —
  // fixed px sizes on a canvas whose w/h can vary per theme is exactly
  // how this shipped illegibly small the first time.
  const titleSize = h * 0.22;
  const headerSize = h * 0.11;
  const itemSize = h * 0.1;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.font = `900 ${titleSize}px Georgia, serif`;
  ctx.fillText("RECEIPT", w / 2, titleSize);
  ctx.textAlign = "left";
  ctx.font = `700 ${headerSize}px monospace`;
  const headerY = titleSize * 1.65;
  ctx.fillText("QTY", w * 0.03, headerY);
  ctx.fillText("ITEM", w * 0.13, headerY);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, h * 0.012);
  ctx.setLineDash([h * 0.03, h * 0.025]);
  const ruleY = headerY + headerSize * 0.6;
  ctx.beginPath();
  ctx.moveTo(0, ruleY);
  ctx.lineTo(w, ruleY);
  ctx.stroke();
  ctx.setLineDash([]);
  const items: [string, string][] = [
    ["24", "HOURS A DAY THINKING BOUT YOU"],
    ["7", "DAYS IN A WEEK"],
    ["365", "TIRED ALL THE TIME"],
  ];
  ctx.font = `400 ${itemSize}px monospace`;
  const lineGap = (h - ruleY - itemSize) / (items.length + 0.3);
  items.forEach(([qty, label], i) => {
    const y = ruleY + lineGap * (i + 1);
    ctx.fillText(qty, w * 0.03, y);
    ctx.fillText(label, w * 0.13, y);
  });
  return canvas;
}

/** Wordmark + THANK YOU + a barcode — Receipt's footer, wide like receiptHeader. */
export function receiptFooter(color: string, w = 600, h = 90, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const thankSize = h * 0.2;
  const wordmarkSize = h * 0.16;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.font = `900 ${thankSize}px monospace`;
  ctx.fillText("******* THANK YOU *******", w / 2, thankSize);
  drawBarcodeBars(ctx, w * 0.15, thankSize * 1.5, w * 0.7, h * 0.3, seed);
  ctx.font = `700 ${wordmarkSize}px sans-serif`;
  ctx.fillText("PHOTO BOOTH", w / 2, h - wordmarkSize * 0.4);
  return canvas;
}

/** A postage-stamp graphic with a perforated scalloped edge (punched via destination-out) and a small original plane-ish glyph. */
export function postageStampPiece(color: string, w = 40, h = 48, seed = 0): HTMLCanvasElement {
  const pad = 3;
  const { canvas, ctx } = makeCanvas(w + pad * 2, h + pad * 2);
  if (!ctx) return canvas;
  ctx.fillStyle = color;
  ctx.fillRect(pad, pad, w, h);
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  const step = 6;
  for (let x = pad; x <= pad + w; x += step) {
    ctx.beginPath();
    ctx.arc(x, pad, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, pad + h, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let y = pad; y <= pad + h; y += step) {
    ctx.beginPath();
    ctx.arc(pad, y, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pad + w, y, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  const rand = mulberry32(seed);
  ctx.fillStyle = `rgba(255,255,255,${(0.6 + rand() * 0.2).toFixed(2)})`;
  ctx.beginPath();
  ctx.moveTo(pad + w * 0.5, pad + h * 0.25);
  ctx.lineTo(pad + w * 0.75, pad + h * 0.65);
  ctx.lineTo(pad + w * 0.5, pad + h * 0.55);
  ctx.lineTo(pad + w * 0.25, pad + h * 0.65);
  ctx.closePath();
  ctx.fill();
  return canvas;
}

/** An irregular wax-seal blob with a simple embossed relief mark — an original mark, not a real crest/brand. */
export function waxSeal(color: string, size = 32, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const cx = size / 2;
  const cy = size / 2;
  const sides = 10;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides;
    const r = size * 0.42 * (0.82 + rand() * 0.3);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.14, cy - size * 0.16);
  ctx.lineTo(cx - size * 0.14, cy + size * 0.16);
  ctx.moveTo(cx - size * 0.14, cy - size * 0.16);
  ctx.lineTo(cx + size * 0.1, cy - size * 0.16);
  ctx.moveTo(cx - size * 0.14, cy);
  ctx.lineTo(cx + size * 0.06, cy);
  ctx.stroke();
  return canvas;
}

/** An angled ink-stamp "APPROVED" mark with a rough rectangular outline — a postal cancellation-mark look. */
export function approvedStamp(color: string, w = 90, h = 36, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate((rand() * 2 - 1) * 0.15 - 0.12);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.strokeRect(-w * 0.46, -h * 0.42, w * 0.92, h * 0.84);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 13px Georgia, serif";
  ctx.fillText("APPROVED", 0, 1);
  ctx.restore();
  return canvas;
}
