/**
 * The Glitter Star theme's outer border: a real hot-pink glitter/sequin
 * frame PNG (public/decor/glitter-frame.png), used pixel-faithfully — same
 * real-asset approach as the leopard and zebra frames, no procedural
 * approximation.
 *
 * Structurally it's a plain rectangular border like the zebra frame, with
 * two wrinkles the zebra frame didn't have:
 *
 * 1. The border thickness measured off the PNG is NOT even on all 4 sides
 *    (left 100 / right 98 / top 78 / bottom 199 — the bottom is roughly
 *    2.5x the top, by design in the source art, to give the big chrome
 *    star room). Handled the same way the leopard frame handled its own
 *    asymmetric border: each side gets its own measured constant instead
 *    of one shared number.
 * 2. A single large chrome star sits ONLY in the bottom-left corner,
 *    bleeding from the border into the white photo window. Handled by
 *    giving that one corner its own oversized slice (SRC_CORNER_BOTTOM_
 *    LEFT, with margin around the star's measured bounding box) instead of
 *    the plain per-side border thickness every other corner uses — because
 *    it's carved out as its own distinct corner, the star can never leak
 *    into a repeating edge tile, and the edge source rects below are cut
 *    to stop exactly at that corner's boundary.
 *
 * A first pass at the edges used a single stretched `drawImage` per edge —
 * the same technique that worked cleanly for the zebra frame's stripes.
 * For THIS art it visibly smeared the round sequin dots into streaks
 * (worst on the tall left/right edges, where canvas height routinely runs
 * 1.9x+ the source edge's own length — zebra stripes are organic-width
 * already and tolerate that; a regular dot grid does not). Per the
 * explicit fallback for exactly this case, edges here are TILED (repeated
 * near-native-scale, not stretched) with the leopard frame's cross-fade
 * technique so the repeat seam is a soft dissolve instead of a hard cut —
 * unlike the leopard frame, there's no star to dodge in any edge's source
 * material (it's fully carved into its own corner, above), so each edge
 * only needs ONE repeating source crop, not several alternating ones.
 *
 * Like the zebra frame, the source PNG is a solid opaque rectangle (not a
 * cutout silhouette), so no chroma-keying/alpha processing is needed.
 */

import { loadHtmlImage } from "@/lib/decor/load-image";

export const GLITTER_FRAME_SRC = "/decor/glitter-frame.png";

/** Pixel bounds measured from the 1013x1679 source PNG. */
const SRC = { w: 1013, h: 1679 };

/** Border thickness per side, median of samples taken every 5% along each edge (bottom measured only from the star-free right portion — samples near the star read taller, since the scan can't tell "star" from "border" by brightness alone until it clears the star). */
const SRC_BORDER = { left: 100, right: 98, top: 78, bottom: 199 };

/**
 * The star's real bounding box measured ~(96,1247)-(444,1613) (block-
 * averaged grayish-pixel scan, to tell chrome from pink glitter and from
 * plain white). This corner crop is sized with margin around that box —
 * (0, H-460) to (480, H) — comfortably containing it without reaching far
 * enough to swallow the adjoining edges' own source material.
 */
const SRC_CORNER_BOTTOM_LEFT = { w: 480, h: 460 };

/**
 * Used at native resolution, this frame's corners/borders would need an
 * outerPad/bottomPad of ~500-600px just to clear the star corner — the
 * leopard and zebra frames could stay at native res because their biggest
 * corner features (leopard's stars) were much smaller relative to the
 * source image. Downscaling is the safe direction here (unlike upscaling,
 * it doesn't blur or pixelate a raster source), so the whole frame —
 * border thickness, the star corner, AND the edge tiles below, all by the
 * same uniform factor — is scaled down to a size comparable to the other
 * themes' borders before being treated as "native" for placement/tiling.
 */
const SCALE = 0.6;

const round = (n: number) => Math.round(n);

/** Destination-space (post-SCALE) border thickness — fixed across every canvas size, same as the leopard/zebra frames; only edge tile COUNT changes to fit. */
export const GLITTER_FRAME_BORDER = {
  left: round(SRC_BORDER.left * SCALE),
  right: round(SRC_BORDER.right * SCALE),
  top: round(SRC_BORDER.top * SCALE),
  bottom: round(SRC_BORDER.bottom * SCALE),
};

/** Destination-space size of the star-bearing bottom-left corner. */
export const GLITTER_CORNER_BOTTOM_LEFT = {
  w: round(SRC_CORNER_BOTTOM_LEFT.w * SCALE),
  h: round(SRC_CORNER_BOTTOM_LEFT.h * SCALE),
};

let cached: Promise<HTMLImageElement> | null = null;

function getSource(): Promise<HTMLImageElement> {
  if (!cached) {
    cached = loadHtmlImage(GLITTER_FRAME_SRC);
  }
  return cached;
}

/**
 * Draws the glitter border onto `ctx` (already sized to `destW`x`destH`)
 * using a 9-slice generalized for 4 independently-sized corners: the 3
 * plain corners at their own border thickness, the star corner at its own
 * (much bigger) size — all drawn at SCALE, never further resized. Edges are
 * TILED at SCALE (repeated, cross-faded at the seam) rather than stretched
 * — see the module doc comment for why stretch doesn't work for this
 * art's dot pattern the way it did for the zebra frame's stripes.
 */
export async function drawGlitterNineSliceBorder(ctx: CanvasRenderingContext2D, destW: number, destH: number): Promise<void> {
  const source = await getSource();
  const b = GLITTER_FRAME_BORDER;
  const bl = GLITTER_CORNER_BOTTOM_LEFT;
  const sb = SRC_BORDER;
  const scb = SRC_CORNER_BOTTOM_LEFT;

  const draw = (sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) => {
    if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return;
    ctx.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
  };

  const BLEND_FRACTION = 0.16;

  /**
   * Draws one tile at (dx, dy), SCALE-d from a (sw, sh) source crop. If
   * `fadePx` > 0, its leading edge (left if horizontal, top if vertical)
   * dissolves in over that many px via `globalAlpha`-stepped strips, same
   * technique as the leopard frame (a `destination-in` + gradient mask was
   * tried there first and silently no-opped every faded tile — see that
   * file's history — so this sticks with what's proven to work).
   */
  const drawTile = (sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number, fadePx: number, vertical: boolean) => {
    if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return;
    if (fadePx <= 0) {
      ctx.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
      return;
    }
    const fade = Math.min(fadePx, vertical ? dh : dw);
    const steps = Math.max(1, Math.round(fade));
    const dStripLen = fade / steps;
    const sStripLen = dStripLen / SCALE;
    for (let i = 0; i < steps; i++) {
      ctx.globalAlpha = (i + 1) / steps;
      if (vertical) {
        ctx.drawImage(source, sx, sy + i * sStripLen, sw, sStripLen, dx, dy + i * dStripLen, dw, dStripLen);
      } else {
        ctx.drawImage(source, sx + i * sStripLen, sy, sStripLen, sh, dx + i * dStripLen, dy, dStripLen, dh);
      }
    }
    ctx.globalAlpha = 1;
    // remaining bulk of the tile, full opacity
    if (vertical) {
      ctx.drawImage(source, sx, sy + fade / SCALE, sw, sh - fade / SCALE, dx, dy + fade, dw, dh - fade);
    } else {
      ctx.drawImage(source, sx + fade / SCALE, sy, sw - fade / SCALE, sh, dx + fade, dy, dw - fade, dh);
    }
  };

  // Repeats a single source crop (srcPos, srcLen at native px, SCALE-d for
  // the actual draw) along the destination span, cross-fading every tile
  // after the first into the previous tile's already-opaque tail so the
  // repeat seam is a dissolve, not a hard cut.
  const tileHorizontal = (srcX: number, srcLen: number, srcY: number, srcH: number, destXStart: number, destY: number, destH_: number, destTotalLen: number) => {
    const tileLen = srcLen * SCALE;
    const blend = Math.round(tileLen * BLEND_FRACTION);
    let x = 0;
    let index = 0;
    while (x < destTotalLen) {
      const w = Math.min(tileLen, destTotalLen - x);
      const fadeInPx = index > 0 ? Math.min(blend, w) : 0;
      drawTile(srcX, srcY, w / SCALE, srcH, destXStart + x, destY, w, destH_, fadeInPx, false);
      if (w < tileLen) break;
      x += w - blend;
      index++;
    }
  };
  const tileVertical = (srcX: number, srcW: number, srcY: number, srcLen: number, destX: number, destYStart: number, destW_: number, destTotalLen: number) => {
    const tileLen = srcLen * SCALE;
    const blend = Math.round(tileLen * BLEND_FRACTION);
    let y = 0;
    let index = 0;
    while (y < destTotalLen) {
      const h = Math.min(tileLen, destTotalLen - y);
      const fadeInPx = index > 0 ? Math.min(blend, h) : 0;
      drawTile(srcX, srcY, srcW, h / SCALE, destX, destYStart + y, destW_, h, fadeInPx, true);
      if (h < tileLen) break;
      y += h - blend;
      index++;
    }
  };

  // top: between the plain top-left and top-right corners.
  tileHorizontal(sb.left, SRC.w - sb.left - sb.right, 0, sb.top, b.left, 0, b.top, destW - b.left - b.right);
  // bottom: between the star corner and the plain bottom-right corner.
  tileHorizontal(scb.w, SRC.w - scb.w - sb.right, SRC.h - sb.bottom, sb.bottom, bl.w, destH - b.bottom, b.bottom, destW - bl.w - b.right);
  // left: between the plain top-left corner and the star corner.
  tileVertical(0, sb.left, sb.top, SRC.h - sb.top - scb.h, 0, b.top, b.left, destH - b.top - bl.h);
  // right: between the plain top-right and bottom-right corners.
  tileVertical(SRC.w - sb.right, sb.right, sb.top, SRC.h - sb.top - sb.bottom, destW - b.right, b.top, b.right, destH - b.top - b.bottom);

  // corners — 3 plain, 1 (bottom-left) carrying the star. Drawn after the
  // edges so each corner's own pixels win at the boundary.
  draw(0, 0, sb.left, sb.top, 0, 0, b.left, b.top); // top-left
  draw(SRC.w - sb.right, 0, sb.right, sb.top, destW - b.right, 0, b.right, b.top); // top-right
  draw(SRC.w - sb.right, SRC.h - sb.bottom, sb.right, sb.bottom, destW - b.right, destH - b.bottom, b.right, b.bottom); // bottom-right
  draw(0, SRC.h - scb.h, scb.w, scb.h, 0, destH - bl.h, bl.w, bl.h); // bottom-left (star)
}
