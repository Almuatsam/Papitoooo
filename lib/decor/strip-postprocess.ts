import { loadHtmlImage } from "@/lib/decor/load-image";

/** Rotates a rasterised strip by `angleDeg`, padding the canvas so nothing gets clipped — a theme's `tiltDeg` (e.g. a "pinned to a corkboard, slightly askew" look). */
export async function applyTilt(dataUrl: string, angleDeg: number): Promise<string> {
  const img = await loadHtmlImage(dataUrl);
  const diag = Math.ceil(Math.sqrt(img.width * img.width + img.height * img.height));
  const canvas = document.createElement("canvas");
  canvas.width = diag;
  canvas.height = diag;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.translate(diag / 2, diag / 2);
  ctx.rotate((angleDeg * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  return canvas.toDataURL("image/png");
}

/** Duplicates a rasterised strip side by side with a gap — the "double-strip-4" layout's export-only postprocess. */
export async function applyDoublePrint(dataUrl: string, gapPx: number): Promise<string> {
  const img = await loadHtmlImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width * 2 + gapPx;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0);
  ctx.drawImage(img, img.width + gapPx, 0);
  return canvas.toDataURL("image/png");
}
