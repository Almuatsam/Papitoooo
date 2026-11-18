import { nameBandFamily } from "@/lib/decor/caption-bitmap";
import { resolvePads } from "@/lib/layouts/pads";
import type { Box } from "@/lib/layouts/types";
import type { ThemeDef } from "@/lib/themes/types";
import type { Lang } from "@/types";

type StripSettings = ThemeDef["strip"];
type CaptionBoxSpec = NonNullable<StripSettings["captionBox"]>;

export interface CaptionBoxGeometry {
  /** Top-left of the caption bitmap on the strip canvas. */
  left: number;
  top: number;
  /** Bitmap size: the widest the text may be, by the height of the free band. */
  width: number;
  height: number;
  /** Largest ink height the text may have (band height minus clearance above and below). */
  maxInkHeight: number;
}

/**
 * Where the caption slot is on the strip: centred on the middle of the photo
 * area (not the canvas, so an asymmetric frame stays centred on the photos),
 * with the band centred `aboveFirstPhoto` px above the first photo.
 */
export function captionBoxGeometry(strip: StripSettings, spec: CaptionBoxSpec, canvasW: number, firstPhoto: Box): CaptionBoxGeometry {
  const { leftPad, rightPad } = resolvePads(strip);
  const centreX = leftPad + (canvasW - leftPad - rightPad) / 2;
  const centreY = firstPhoto.top - spec.aboveFirstPhoto;
  const height = spec.bandHalfHeight * 2;
  return {
    left: Math.round(centreX - spec.maxWidth / 2),
    top: Math.round(centreY - spec.bandHalfHeight),
    width: spec.maxWidth,
    height,
    maxInkHeight: height - spec.clearance * 2,
  };
}

/**
 * One line of text in a flat colour, its ink centred in the bitmap both ways.
 * The size starts at `spec.fontSize` and shrinks until the ink fits the width
 * and the band; the text is never wrapped.
 */
export function renderCaptionBoxBitmap(geometry: CaptionBoxGeometry, spec: CaptionBoxSpec, text: string, lang: Lang): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = geometry.width;
  canvas.height = geometry.height;
  const ctx = canvas.getContext("2d");
  const line = text.trim();
  if (!ctx || !line) return canvas;

  const family = nameBandFamily(spec.fontVar);
  ctx.direction = lang === "ar" ? "rtl" : "ltr";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  const measure = (size: number) => {
    ctx.font = `${spec.fontWeight} ${size}px ${family}`;
    const m = ctx.measureText(line);
    return { left: m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight, ascent: m.actualBoundingBoxAscent, descent: m.actualBoundingBoxDescent };
  };
  const first = measure(spec.fontSize);
  const inkW = first.left + first.right;
  const inkH = first.ascent + first.descent;
  const fit = Math.min(1, inkW > 0 ? geometry.width / inkW : 1, inkH > 0 ? geometry.maxInkHeight / inkH : 1);
  // Rounded down so the fitted ink never ends up a pixel over the limit.
  const size = Math.floor(spec.fontSize * fit * 100) / 100;
  const m = fit < 1 ? measure(size) : first;

  ctx.fillStyle = spec.color;
  ctx.fillText(line, (geometry.width - (m.left + m.right)) / 2 + m.left, (geometry.height - (m.ascent + m.descent)) / 2 + m.ascent);
  return canvas;
}
