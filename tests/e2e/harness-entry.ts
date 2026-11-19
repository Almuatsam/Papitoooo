import { FILTERS } from "@/lib/filters";
import { coverRect, paintFiltered } from "@/lib/filter-pipeline";
import { canvasFilterSupported, resetCanvasFilterProbe, unsupportedFilterFunctions } from "@/lib/canvas-filter";

/** Deterministic test photo: colour ramps, hard edges and bright highlights (so glow has something to bloom). */
function testImage(w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#1b3a8a");
  grad.addColorStop(0.5, "#d98c5f");
  grad.addColorStop(1, "#7fd6a2");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(w * 0.1, h * 0.15, w * 0.18, h * 0.22);
  ctx.fillStyle = "#fff3a0";
  ctx.beginPath();
  ctx.arc(w * 0.7, h * 0.35, h * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#101010";
  ctx.fillRect(w * 0.4, h * 0.6, w * 0.3, h * 0.25);
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(w * 0.05, h * 0.65, w * 0.25, h * 0.2);
  return canvas;
}

function render(filterId: string | object, forcePixel: boolean, w = 600, h = 450): number[] {
  window.__photoboothForcePixelFilter = forcePixel;
  const filter = (typeof filterId === "string" ? FILTERS.find((f) => f.id === filterId)! : filterId) as (typeof FILTERS)[number];
  const src = testImage(w, h);
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d", { willReadFrequently: true })!;
  paintFiltered(ctx, src, coverRect(w, h, w, h), w, h, filter);
  window.__photoboothForcePixelFilter = false;
  return Array.from(ctx.getImageData(0, 0, w, h).data);
}

function timeFilter(filterId: string, forcePixel: boolean, photos: number, w: number, h: number): number {
  window.__photoboothForcePixelFilter = forcePixel;
  const filter = FILTERS.find((f) => f.id === filterId)!;
  const src = testImage(w, h);
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d", { willReadFrequently: true })!;
  const start = performance.now();
  for (let i = 0; i < photos; i++) paintFiltered(ctx, src, coverRect(w, h, w, h), w, h, filter);
  const ms = performance.now() - start;
  window.__photoboothForcePixelFilter = false;
  return ms;
}

(window as unknown as Record<string, unknown>).harness = {
  filterIds: FILTERS.map((f) => f.id),
  unsupported: FILTERS.map((f) => ({ id: f.id, bad: unsupportedFilterFunctions(f.css) })),
  nativeSupported: () => {
    resetCanvasFilterProbe();
    return canvasFilterSupported();
  },
  render,
  timeFilter,
};
