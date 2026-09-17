/**
 * Strap/band shape family for lib/decor/strip-pieces.ts — tape, ribbons,
 * and the "abstract strap" gap the redesign specifically targets: strips
 * that loop, break into segments, taper, or cut jaggedly, instead of every
 * decoration reading as a straight rectangular strap.
 */

import { mulberry32 } from "@/lib/decor/seed";

function makeCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D | null } {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  return { canvas, ctx: canvas.getContext("2d") };
}

/** Translucent band with torn-notch edges. Proportions vary (long/short/near-square) so repeated use doesn't read as one stamped shape. */
export function tape(color: string, w = 70, h = 24, seed = 0): HTMLCanvasElement {
  const rand = mulberry32(seed);
  const roll = rand();
  let fw = w;
  const fh = h;
  if (roll < 0.3) fw = h * (1.4 + rand() * 0.6);
  else if (roll < 0.55) fw = h * (0.9 + rand() * 0.25);
  const { canvas, ctx } = makeCanvas(fw, fh);
  if (!ctx) return canvas;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.72;
  ctx.fillRect(0, 0, fw, fh);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let x = 0; x < fw; x += 6) {
    ctx.fillRect(x, 0, 2, 2);
    ctx.fillRect(x, fh - 2, 2, 2);
  }
  return canvas;
}

/** A plain solid band with a clean-cut end — meant to be positioned bleeding off the strip edge, as if it continues outside the frame. */
export function croppedTape(color: string, w = 60, h = 22): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(0, 0, w, h);
  return canvas;
}

/** Two segments meeting at a slight crease, like tape folded/bent over an edge. */
export function bentTape(color: string, w = 74, h = 22, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h * 1.5);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const bendY = h * 0.6;
  const bendAmt = (rand() * 2 - 1) * h * 0.3;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.moveTo(0, bendY);
  ctx.lineTo(w * 0.5, bendY + bendAmt);
  ctx.lineTo(w * 0.5, bendY + bendAmt + h);
  ctx.lineTo(0, bendY + h);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.62;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, bendY + bendAmt);
  ctx.lineTo(w, bendY);
  ctx.lineTo(w, bendY + h);
  ctx.lineTo(w * 0.5, bendY + bendAmt + h);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, bendY + bendAmt);
  ctx.lineTo(w * 0.5, bendY + bendAmt + h);
  ctx.stroke();
  return canvas;
}

/** Opaque band sliced at 45deg on both ends — a "cut ribbon segment". */
export function diagonalStrip(color: string, w = 96, h = 22, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const cut = h * 0.85;
  ctx.beginPath();
  ctx.moveTo(cut, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w - cut, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  const rand = mulberry32(seed);
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(cut * 0.4 + rand() * (w - cut), h * 0.3 + rand() * h * 0.4, 3, 1.4);
  }
  return canvas;
}

/** Band whose long edges are drawn as a sine wave instead of a straight line. */
export function wavyStrip(color: string, w = 100, h = 28, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h + 8);
  if (!ctx) return canvas;
  const amp = h * 0.16;
  const mid = (h + 8) / 2;
  const rand = mulberry32(seed);
  const phase = rand() * Math.PI * 2;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 4) {
    const y = mid - h / 2 + Math.sin((x / w) * Math.PI * 2 + phase) * amp;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let x = w; x >= 0; x -= 4) {
    const y = mid + h / 2 + Math.sin((x / w) * Math.PI * 2 + phase) * amp;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** Band whose long edges are a jagged triangle wave. */
export function zigzagStrip(color: string, w = 100, h = 26, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const teeth = 6;
  const step = w / teeth;
  const amp = h * 0.22;
  const rand = mulberry32(seed);
  ctx.beginPath();
  ctx.moveTo(0, amp);
  for (let i = 0; i <= teeth; i++) {
    const x = i * step;
    const y = i % 2 === 0 ? 0 : amp * (0.7 + rand() * 0.6);
    ctx.lineTo(x, y);
  }
  for (let i = teeth; i >= 0; i--) {
    const x = i * step;
    const y = h - (i % 2 === 0 ? 0 : amp * (0.7 + rand() * 0.6));
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A curved band following a circular arc — a bow/ribbon sweep. */
export function curvedStrip(color: string, w = 110, h = 40): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const r = w * 0.62;
  const cx = w / 2;
  const cy = h + r - h * 0.7;
  ctx.strokeStyle = color;
  ctx.lineWidth = h * 0.34;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  return canvas;
}

/** Thin accent line/band, optionally dashed. */
export function thinBand(color: string, w = 140, h = 6, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  if (rand() > 0.5) {
    ctx.fillStyle = color;
    const dash = h * 1.8;
    for (let x = 0; x < w; x += dash * 2) ctx.fillRect(x, 0, dash, h);
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
  }
  return canvas;
}

/** A thick wobbly hand-drawn marker stroke, used as a decorative band. */
export function scribbleStrip(color: string, w = 90, h = 20, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h * 2);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, h * 0.5);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const midY = h;
  ctx.beginPath();
  ctx.moveTo(0, midY + (rand() * 2 - 1) * h * 0.3);
  const segs = 4;
  for (let i = 1; i <= segs; i++) {
    const x = (w / segs) * i;
    const y = midY + (rand() * 2 - 1) * h * 0.4;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  return canvas;
}

/** A band split into 2-3 offset fragments with gaps, as if snapped. */
export function brokenBand(color: string, w = 110, h = 14, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h * 2);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const pieces = 2 + Math.floor(rand() * 2);
  const segW = w / pieces;
  ctx.fillStyle = color;
  for (let i = 0; i < pieces; i++) {
    const gap = segW * 0.14;
    const x = i * segW + gap / 2;
    const yOff = (rand() * 2 - 1) * h * 0.5;
    ctx.fillRect(x, h * 0.5 + yOff, segW - gap, h);
  }
  return canvas;
}

/** Paper strip with irregular torn ends (left/right). */
export function tornStrip(color: string, w = 88, h = 30, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const tear = 5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let x = 0; x <= w; x += 7) {
    const edge = x < tear * 4 || x > w - tear * 4;
    ctx.lineTo(x, edge ? rand() * tear : 0);
  }
  for (let x = w; x >= 0; x -= 7) {
    const edge = x < tear * 4 || x > w - tear * 4;
    ctx.lineTo(x, h - (edge ? rand() * tear : 0));
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** Rect with a folded triangular corner flap + soft diagonal shadow — a "dog-eared page". */
export function foldedStrip(color: string, w = 46, h = 46): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  const grad = ctx.createLinearGradient(w * 0.35, 0, w, h * 0.65);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(w * 0.35, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h * 0.65);
  ctx.closePath();
  ctx.fill();
  return canvas;
}

/** L-shaped bracket, like a camera autofocus corner marker. */
export function cornerWrap(color: string, size = 34, thickness = 5): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(0, size * 0.55);
  ctx.lineTo(0, 0);
  ctx.lineTo(size * 0.55, 0);
  ctx.stroke();
  return canvas;
}

/** A "C" bracket wrapping 3 sides — a chunkier wrap than corner-wrap's 2. */
export function cShapeTape(color: string, size = 40, thickness = 6): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return canvas;
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(size * 0.7, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(size * 0.7, size);
  ctx.stroke();
  return canvas;
}

/** Rect with one long edge replaced by a semicircular arch — a bow-band shape. */
export function archedStrip(color: string, w = 90, h = 34): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.5);
  ctx.arc(w / 2, h * 0.5, w / 2, Math.PI, 0, false);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  return canvas;
}

/** Banner/flag ribbon with a notched "V" tail at one end. */
export function ribbon(color: string, w = 30, h = 84): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h + w * 0.35);
  if (!ctx) return canvas;
  const notch = w * 0.35;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h);
  ctx.lineTo(w / 2, h + notch);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A strap that loops back on itself, like a ribbon bow loop — a stroked figure, not a straight band. */
export function loopingStrip(color: string, w = 90, h = 50, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const wobble = (rand() * 2 - 1) * h * 0.12;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(4, h * 0.22);
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h * 0.8);
  ctx.bezierCurveTo(w * 0.05, h * 0.1 + wobble, w * 0.65, h * 0.05, w * 0.75, h * 0.5);
  ctx.bezierCurveTo(w * 0.85, h * 0.95, w * 0.35, h * 0.95 + wobble, w * 0.4, h * 0.45);
  ctx.stroke();
  return canvas;
}

/** 2-3 independently-rotated small segments with visible gaps — a strap that "fell apart" into pieces, not one continuous band. */
export function segmentedStrip(color: string, w = 100, h = 20, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h * 2);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const pieces = 3;
  const segW = (w / pieces) * 0.82;
  const gap = w / pieces - segW;
  ctx.fillStyle = color;
  for (let i = 0; i < pieces; i++) {
    const cx = i * (segW + gap) + segW / 2 + gap / 2;
    const cy = h;
    const rot = (rand() * 2 - 1) * 0.35;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.fillRect(-segW / 2, -h / 2, segW, h);
    ctx.restore();
  }
  return canvas;
}

/** A band whose width changes along its length — narrow at one end, wide at the other. */
export function taperedStrip(color: string, w = 100, h = 30, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const narrowH = h * (0.2 + rand() * 0.15);
  ctx.beginPath();
  ctx.moveTo(0, h / 2 - narrowH / 2);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h / 2 + narrowH / 2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/** A band with sharply angular (not torn-soft) irregular edges — cut with scissors at odd angles. */
export function jaggedStrip(color: string, w = 100, h = 26, seed = 0): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  const rand = mulberry32(seed);
  const segs = 5;
  const segW = w / segs;
  ctx.beginPath();
  ctx.moveTo(0, rand() * h * 0.3);
  for (let i = 1; i <= segs; i++) ctx.lineTo(i * segW, rand() * h * 0.3);
  for (let i = segs; i >= 0; i--) ctx.lineTo(i * segW, h - rand() * h * 0.3);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}
