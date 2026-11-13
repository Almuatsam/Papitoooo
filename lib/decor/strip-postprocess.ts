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

/**
 * Lays two copies of a strip side by side on a fixed-size print sheet (e.g.
 * 1200x1800 = 4x6 in at 300 dpi). Each copy is fitted ("contain") into its
 * half and centred, never cropped; any leftover is white. Used instead of
 * {@link applyDoublePrint} when a theme defines `overlayFrame.printSheet`, so
 * the download has the paper's exact aspect ratio and a print service has no
 * reason to crop it.
 */
export async function applyDoublePrintSheet(dataUrl: string, sheetW: number, sheetH: number): Promise<string> {
  const img = await loadHtmlImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = sheetW;
  canvas.height = sheetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, sheetW, sheetH);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const halfW = sheetW / 2;
  const s = Math.min(halfW / img.width, sheetH / img.height);
  const w = img.width * s;
  const h = img.height * s;
  const y = (sheetH - h) / 2;
  ctx.drawImage(img, (halfW - w) / 2, y, w, h);
  ctx.drawImage(img, halfW + (halfW - w) / 2, y, w, h);
  return canvas.toDataURL("image/png");
}
