/**
 * The Zebra Stripes theme's outer border: a real zebra-print frame PNG
 * (public/decor/zebra-frame.png), used pixel-faithfully. Structurally much
 * simpler than the leopard-scallop frame it borrows the approach from
 * (lib/decor/assets/leopard-scallop-frame.ts) — a plain rectangular border,
 * even thickness on all 4 sides, no scalloped silhouette and no
 * separately-sized corner artwork, since the stripe pattern just continues
 * through the corners with nothing else (like a star) to protect there.
 *
 * That simplicity means the 9-slice here needs none of the leopard file's
 * tiling/cross-fade machinery:
 * - Corners are copied at native resolution (never resized) so stripe
 *   corners stay crisp and undistorted.
 * - Edges are drawn as ONE continuous `drawImage` call each, stretching the
 *   source strip to whatever length the destination edge needs. A single
 *   stretched draw has no internal seam by construction — there's nothing
 *   to tile, so the leopard frame's repeated-tile-with-hard-seams failure
 *   mode isn't reachable here. Stretch does widen/narrow the stripe rhythm
 *   slightly on very long or short edges, but zebra stripes (irregular,
 *   organic width already) read as far less "off" under stretching than
 *   leopard rosettes would.
 *
 * The source PNG has no alpha channel, but unlike the leopard frame that's
 * fine as-is here: this frame is a solid rectangle (not a cutout silhouette
 * sitting on a transparent card), so no chroma-keying is needed — every
 * pixel of the border band is meant to be opaque.
 */

import { loadHtmlImage } from "@/lib/decor/load-image";

export const ZEBRA_FRAME_SRC = "/decor/zebra-frame.png";

/** Pixel bounds measured from the 1200x899 source PNG (median of samples taken every 5% along each edge, scanning from the known-white interior outward to the first non-white pixel). The 4 sides measured 108-121px — close enough to call "even" for a hand-scanned print — so a single rounded-down constant is used for all 4, which also keeps the corner crops square and the background-inset math in lib/strip-renderer.ts (which assumes one uniform band width) exactly matched to what's actually drawn. */
const SRC = { w: 1200, h: 899 };
export const ZEBRA_FRAME_BORDER = 108;

let cached: Promise<HTMLImageElement> | null = null;

function getSource(): Promise<HTMLImageElement> {
  if (!cached) {
    cached = loadHtmlImage(ZEBRA_FRAME_SRC);
  }
  return cached;
}

/**
 * Draws the zebra border onto `ctx` (already sized to `destW`x`destH`) using
 * a 9-slice: 4 corners at native size, 4 edges stretched to fit. The caller
 * paints whatever should show through the middle (background, photos)
 * BEFORE this — everywhere outside the border band is left untouched.
 */
export async function drawZebraNineSliceBorder(ctx: CanvasRenderingContext2D, destW: number, destH: number): Promise<void> {
  const source = await getSource();
  const b = ZEBRA_FRAME_BORDER;

  const draw = (sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) => {
    if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return;
    ctx.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
  };

  const destInnerW = Math.max(0, destW - b * 2);
  const destInnerH = Math.max(0, destH - b * 2);

  // edges — each a single stretched draw, source middle strip -> full dest span.
  draw(b, 0, SRC.w - b * 2, b, b, 0, destInnerW, b); // top
  draw(b, SRC.h - b, SRC.w - b * 2, b, b, destH - b, destInnerW, b); // bottom
  draw(0, b, b, SRC.h - b * 2, 0, b, b, destInnerH); // left
  draw(SRC.w - b, b, b, SRC.h - b * 2, destW - b, b, b, destInnerH); // right

  // corners — native resolution, never resized.
  draw(0, 0, b, b, 0, 0, b, b); // top-left
  draw(SRC.w - b, 0, b, b, destW - b, 0, b, b); // top-right
  draw(0, SRC.h - b, b, b, 0, destH - b, b, b); // bottom-left
  draw(SRC.w - b, SRC.h - b, b, b, destW - b, destH - b, b, b); // bottom-right
}
