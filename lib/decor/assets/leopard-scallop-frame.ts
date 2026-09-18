/**
 * The Leopard Scrapbook theme's outer border: the user's own real leopard
 * scallop-frame artwork (public/decor/leopard-scallop-frame.png), used
 * pixel-faithfully — not traced, not regenerated procedurally. An earlier
 * pass here built the scallop/fur pattern from scratch; that whole
 * approach is gone. The only code in this file is what it takes to make
 * ONE fixed 611x1094 image work as a border around whatever canvas size
 * the active layout produces:
 *
 * 1. The source PNG has no alpha channel — the area outside the scalloped
 *    silhouette is opaque white. `getProcessedSource()` runs once (cached)
 *    to punch that back out to transparency, so the scallop's actual wavy
 *    edge reads as the card's edge, not a white rectangle around it.
 * 2. `drawLeopardNineSliceBorder()` implements a 9-slice / border-image
 *    manually via `drawImage`'s source/dest rects (the app's renderer is
 *    Fabric/Canvas2D, not live CSS, so CSS `border-image` — and its
 *    `round`/`stretch` repeat modes — was never actually in play here):
 *    the 4 corners are copied at native resolution, never resized, so the
 *    scallop bumps and fur detail there stay crisp. The 4 edge strips
 *    between them are TILED at native scale (repeated, not stretched) —
 *    stretching was tried first and visibly grew every leopard spot in the
 *    middle of a long edge. Tiling keeps every spot at its real drawn
 *    size, but a first pass at it (repeating a single fixed-size crop with
 *    a hard cut at each boundary) produced visible seams — a row of
 *    obviously-stamped tiles instead of one continuous wave. Two things
 *    fixed that: (a) each tile source is the LARGEST star-free span
 *    actually available, not an arbitrary small crop, so an edge repeats
 *    as few times as the source material allows; (b) every tile after the
 *    first is drawn with its leading edge cross-faded (alpha ramps 0->1
 *    over `BLEND_FRACTION` of the tile's own size) into the previous
 *    tile's trailing pixels, so the seam is a soft dissolve instead of a
 *    hard cut. There is no "middle" slice — the theme's photo window is
 *    its own procedural graph-grid background (lib/decor/patterns.ts),
 *    not sourced from this image, so only the border band is drawn here.
 *
 * The slice boundaries below (SRC.outer / SRC.inner) were measured
 * directly from the PNG's pixels (row/column brightness scan to find the
 * window's straight-edged rectangle, and the first/last non-white pixel
 * per row/column to find the scallop silhouette's true extent) — they are
 * specific to this exact file and would need re-measuring if the asset is
 * ever swapped for a different piece of art.
 */

import { loadHtmlImage } from "@/lib/decor/load-image";

export const LEOPARD_FRAME_SRC = "/decor/leopard-scallop-frame.png";

/** Pixel bounds measured from the 611x1094 source PNG. */
const SRC = {
  w: 611,
  h: 1094,
  // True extent of the scalloped silhouette (first/last non-white pixel).
  outer: { left: 21, top: 17, right: 593, bottom: 1066 },
  // The inner window's straight-edged black outline rectangle.
  inner: { left: 192, top: 165, right: 420, bottom: 927 },
};

/** Border band thickness on each side, derived from SRC. Plain edge tiles use this; the two star-bearing corners use CORNER_SIZE instead (see below) since the stars are bigger than the plain band. `outerPad`/`bottomPad` need to clear whichever is larger. */
export const LEOPARD_FRAME_BORDER = {
  left: SRC.inner.left - SRC.outer.left,
  top: SRC.inner.top - SRC.outer.top,
  right: SRC.outer.right - SRC.inner.right,
  bottom: SRC.outer.bottom - SRC.inner.bottom,
};

/**
 * The two pink stars (measured bounding boxes: top-right x 385-521 / y
 * 81-228, bottom-left x 93-230 / y 864-1015) are bigger than the plain fur
 * band and sit right at a corner. A corner slice sized to the plain band
 * thickness crops them; sizing EVERY corner to fit the stars would make
 * the plain top-left/bottom-right corners oversized for no reason. So only
 * the star-bearing corners get a bigger native-resolution slice (with a
 * margin around the measured box) — drawn last, over the tiled edges, so
 * the extra size just overpaints a bit of already-tiled (star-free) fur
 * rather than needing the tiles to know about it.
 */
const CORNER_SIZE = {
  topLeft: { w: LEOPARD_FRAME_BORDER.left, h: LEOPARD_FRAME_BORDER.top },
  topRight: { w: SRC.outer.right - 373, h: 242 - SRC.outer.top },
  bottomLeft: { w: 241 - SRC.outer.left, h: SRC.outer.bottom - 851 },
  bottomRight: { w: LEOPARD_FRAME_BORDER.right, h: LEOPARD_FRAME_BORDER.bottom },
};

let cached: Promise<HTMLCanvasElement> | null = null;

/** A pixel matches the pink sparkle stars (measured on real star pixels: R 218-234, G 177-187, B 196-211 — R and B both well above G, unlike fur or window content). */
function isStarPink(r: number, g: number, b: number): boolean {
  return r > 195 && r < 250 && g > 150 && g < 205 && b > 180 && b < 225 && r - g > 25 && b - g > 10;
}

/**
 * Loads the source PNG once per session and processes it so only "fur or
 * star" pixels stay opaque — everything else (the outer white margin, and
 * every pixel of the window: its cream background, blue grid lines, AND
 * its own black outline stroke) becomes transparent. Cached — every render
 * reuses the same processed canvas.
 *
 * This needs two different rules, not one, because the enlarged star
 * corners (CORNER_SIZE) reach slightly into the window's own bounds to
 * fully contain a star that overlaps the window edge in the original art:
 * - Outside the window's bounds: only the plain white margin needs
 *   removing, by brightness — real fur is never anywhere near white.
 * - Inside the window's bounds: brightness alone can't tell the window's
 *   OWN black outline stroke apart from real fur (both are dark), so
 *   pixels there are only kept when they specifically match the star's
 *   pink instead — anything else in that zone (grid lines, outline,
 *   cream) is exactly the window content this frame doesn't source from
 *   here (see the module doc comment), so it's discarded regardless of
 *   its own brightness.
 */
function getProcessedSource(): Promise<HTMLCanvasElement> {
  if (!cached) {
    cached = loadHtmlImage(LEOPARD_FRAME_SRC).then((img) => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return canvas;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      const { inner } = SRC;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const insideWindow = x >= inner.left && x <= inner.right && y >= inner.top && y <= inner.bottom;
          if (insideWindow) {
            d[i + 3] = isStarPink(r, g, b) ? d[i + 3] : 0;
          } else {
            // Soft ramp from fully-opaque (g<=195) to fully-transparent
            // (g>=215) so the scallop edge's existing anti-aliasing
            // survives instead of getting a hard jagged cutout.
            const alphaFactor = 1 - Math.max(0, Math.min(1, (g - 195) / 20));
            d[i + 3] = Math.round(d[i + 3] * alphaFactor);
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
      return canvas;
    });
  }
  return cached;
}

/**
 * Draws the leopard border onto `ctx` (already sized to `destW`x`destH`)
 * using a 9-slice: 4 corners at native size, 4 edges tiled to fit.
 * The caller is responsible for painting whatever should show through the
 * hole (background pattern, photos) BEFORE this — everywhere outside the
 * border band is left untouched (this only draws the band itself).
 */
export async function drawLeopardNineSliceBorder(ctx: CanvasRenderingContext2D, destW: number, destH: number): Promise<void> {
  const source = await getProcessedSource();
  const b = LEOPARD_FRAME_BORDER;
  const { outer } = SRC;

  const draw = (sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) => {
    if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return;
    ctx.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
  };

  // edges — tiled at native scale along their length (never stretched).
  // The two pink stars sit near the top-right and bottom-left corners but
  // bleed past the corner slice into the adjoining edge strips (measured
  // bounding boxes: top-right star x:385-521 y:81-228, bottom-left star
  // x:93-230 y:864-1015), so each tile source below is the LARGEST
  // star-free span actually available in the window (which bounds the
  // horizontal tiles to the window's own 228px width) rather than an
  // arbitrarily small crop — fewer, bigger tiles means fewer seams to
  // begin with. Whatever seams remain are cross-faded, not hard cuts —
  // see drawTile below and the module doc comment.
  const destInnerW = Math.max(0, destW - b.left - b.right);
  const destInnerH = Math.max(0, destH - b.top - b.bottom);
  const BLEND_FRACTION = 0.16;

  /**
   * Draws one tile at (dx, dy). If `fadePx` > 0, its leading edge (left if
   * horizontal, top if vertical) dissolves in over that many px instead of
   * cutting hard — drawn as a sequence of ~1px-wide alpha-stepped strips
   * directly onto `ctx`, blending with whatever the previous tile already
   * left there (drawn earlier, so it's already in place underneath).
   *
   * An earlier version built each tile on an offscreen canvas and masked
   * its fade with a `destination-in` + `CanvasGradient` fill — that
   * silently made every faded tile vanish (a hard repro: with the mask
   * skipped, tiles rendered as always; with it, only ever the very first,
   * unfaded tile per edge showed up — Chromium here does not composite
   * that combination the way the spec describes). Plain `globalAlpha`
   * strips avoid gradients and offscreen-canvas compositing entirely and
   * are visually indistinguishable at this stroke width.
   */
  const drawTile = (sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, fadePx: number, vertical: boolean) => {
    if (sw <= 0 || sh <= 0) return;
    if (fadePx <= 0) {
      ctx.drawImage(source, sx, sy, sw, sh, dx, dy, sw, sh);
      return;
    }
    const fade = Math.min(fadePx, vertical ? sh : sw);
    const steps = Math.max(1, Math.round(fade));
    const stripLen = fade / steps;
    for (let i = 0; i < steps; i++) {
      ctx.globalAlpha = (i + 1) / steps;
      if (vertical) ctx.drawImage(source, sx, sy + i * stripLen, sw, stripLen, dx, dy + i * stripLen, sw, stripLen);
      else ctx.drawImage(source, sx + i * stripLen, sy, stripLen, sh, dx + i * stripLen, dy, stripLen, sh);
    }
    ctx.globalAlpha = 1;
    // remaining bulk of the tile, full opacity
    if (vertical) ctx.drawImage(source, sx, sy + fade, sw, sh - fade, dx, dy + fade, sw, sh - fade);
    else ctx.drawImage(source, sx + fade, sy, sw - fade, sh, dx + fade, dy, sw - fade, sh);
  };

  // Crossfading (drawTile above) hides the seam in the FUR TEXTURE, but it
  // can't hide the scalloped OUTLINE reading as an obvious copy-paste when
  // the exact same source crop — bump shape and all — repeats next to
  // itself. The window is only 228px wide, too narrow to get one crop big
  // enough to repeat just once or twice, so instead each edge cycles
  // through TWO DIFFERENT sub-crops (still star-free) — no two adjacent
  // tiles are ever the same bump, even though each individual crop still
  // recurs every other tile.
  const tileHorizontal = (sources: { x: number; w: number }[], sy: number, dy: number, sh: number) => {
    let x = 0;
    let index = 0;
    while (x < destInnerW) {
      const src = sources[index % sources.length];
      const blend = Math.round(src.w * BLEND_FRACTION);
      const w = Math.min(src.w, destInnerW - x);
      // Every tile after the first overlaps the previous tile's
      // already-opaque tail by `blend` px — that overlap is what its own
      // fade-in dissolves into. Without the overlap there'd be nothing
      // under the fade but empty canvas.
      const fadeInPx = index > 0 ? Math.min(blend, w) : 0;
      drawTile(src.x, sy, w, sh, b.left + x, dy, fadeInPx, false);
      if (w < src.w) break; // last (clipped) tile — nothing more fits
      x += w - blend;
      index++;
    }
  };
  const tileVertical = (sources: { y: number; h: number }[], sx: number, dx: number, sw: number) => {
    let y = 0;
    let index = 0;
    while (y < destInnerH) {
      const src = sources[index % sources.length];
      const blend = Math.round(src.h * BLEND_FRACTION);
      const h = Math.min(src.h, destInnerH - y);
      const fadeInPx = index > 0 ? Math.min(blend, h) : 0;
      drawTile(sx, src.y, sw, h, dx, b.top + y, fadeInPx, true);
      if (h < src.h) break; // last (clipped) tile — nothing more fits
      y += h - blend;
      index++;
    }
  };
  // Maximized star-free spans, split into 2 (or 3, where there's room)
  // distinct sub-crops each — see the comment above `tileHorizontal`.
  const TOP_TILES = [
    { x: 194, w: 92 }, // window left edge (192) onward
    { x: 290, w: 90 }, // ...to just short of the top-right star (385)
  ];
  const BOTTOM_TILES = [
    { x: 238, w: 88 }, // just past the bottom-left star (230)
    { x: 330, w: 85 }, // ...to the window right edge (420)
  ];
  const SIDE_TILES = [
    { y: 240, h: 300 },
    { y: 550, h: 300 }, // together cover the ~610px clear of both stars (y 81-228 and y 864-1015)
  ];
  tileHorizontal(TOP_TILES, outer.top, 0, b.top);
  tileHorizontal(BOTTOM_TILES, outer.bottom - b.bottom, destH - b.bottom, b.bottom);
  tileVertical(SIDE_TILES, outer.left, 0, b.left);
  tileVertical(SIDE_TILES, outer.right - b.right, destW - b.right, b.right);

  // corners — native resolution, never resized, drawn LAST so the two
  // star-bearing corners (bigger than the plain band — see CORNER_SIZE)
  // paint over the tail end of the tiled edges next to them instead of
  // needing the tiles to leave a gap for them.
  const c = CORNER_SIZE;
  draw(outer.left, outer.top, c.topLeft.w, c.topLeft.h, 0, 0, c.topLeft.w, c.topLeft.h);
  draw(outer.right - c.topRight.w, outer.top, c.topRight.w, c.topRight.h, destW - c.topRight.w, 0, c.topRight.w, c.topRight.h);
  draw(outer.left, outer.bottom - c.bottomLeft.h, c.bottomLeft.w, c.bottomLeft.h, 0, destH - c.bottomLeft.h, c.bottomLeft.w, c.bottomLeft.h);
  draw(
    outer.right - c.bottomRight.w,
    outer.bottom - c.bottomRight.h,
    c.bottomRight.w,
    c.bottomRight.h,
    destW - c.bottomRight.w,
    destH - c.bottomRight.h,
    c.bottomRight.w,
    c.bottomRight.h,
  );
}
