/**
 * Public entry point for the photo-strip decoration vocabulary. Shape
 * geometry is split across lib/decor/shapes/{straps,geometric,organic,
 * handmade}.ts by family; this file re-exports them, keeps the
 * `DEFAULT_SIZE` table + `drawShape()` dispatcher, and exposes the single
 * `renderPiece()` entry point that hands a drawn shape to
 * lib/decor/piece-materials.ts for its physical "finish" (shadow, grain,
 * gloss) — the part that makes it read as a real material, not a
 * flat-filled icon. The caller in lib/strip-renderer.ts applies
 * angle/position/opacity via Fabric.
 *
 * All irregularity is seeded (lib/decor/seed.ts), never `Math.random()` —
 * preview and export both call the render pipeline fresh with the same
 * per-session seed, so they stay pixel-identical.
 */

import { applyMaterialFinish, drawRhinestoneCluster } from "@/lib/decor/piece-materials";
import { mulberry32 } from "@/lib/decor/seed";
import type { MaterialId, StripPieceKind } from "@/lib/themes";
import {
  archedStrip,
  bentTape,
  brokenBand,
  cShapeTape,
  cornerWrap,
  croppedTape,
  curvedStrip,
  diagonalStrip,
  foldedStrip,
  jaggedStrip,
  loopingStrip,
  ribbon,
  scribbleStrip,
  segmentedStrip,
  taperedStrip,
  tape,
  thinBand,
  tornStrip,
  wavyStrip,
  zigzagStrip,
} from "@/lib/decor/shapes/straps";
import {
  arcPiece,
  chunkyBlock,
  crossShape,
  diamond,
  hexagon,
  letterShape,
  octagon,
  offsetRect,
  square,
  squareMissingCorner,
  tornSquare,
  trapezoid,
  triangle,
  unevenRectangle,
} from "@/lib/decor/shapes/geometric";
import {
  bubblePiece,
  cloudPiece,
  crescentPiece,
  flowerPiece,
  irregularCutout,
  organicBlob,
  squigglePiece,
  starPiece,
  starburstPiece,
} from "@/lib/decor/shapes/organic";
import { crumpledPaper, dieCutPiece, foldedCorner, paperTab, photoFragment, stickerCorner } from "@/lib/decor/shapes/handmade";
import {
  approvedStamp,
  barcode,
  cornerMedallion,
  nowPlayingPanel,
  postageStampPiece,
  receiptFooter,
  receiptHeader,
  routeFieldBlock,
  waxSeal,
} from "@/lib/decor/shapes/signature";

export { mulberry32, seedFrom } from "@/lib/decor/seed";

export interface RenderPieceOptions {
  /** Only used by "photo-fragment" — the already-prepped photo canvas to duplicate. */
  source?: HTMLCanvasElement;
  /** Secondary colour for two-tone pieces (gem cluster highlight colour, etc). Falls back to `color`. */
  secondaryColor?: string;
}

const DEFAULT_SIZE: Record<StripPieceKind, [number, number]> = {
  // straps
  tape: [70, 24],
  "cropped-tape": [60, 22],
  "diagonal-strip": [96, 22],
  "wavy-strip": [100, 28],
  "zigzag-strip": [100, 26],
  "torn-strip": [88, 30],
  "curved-strip": [110, 40],
  "folded-strip": [46, 46],
  "bent-tape": [74, 22],
  "corner-wrap": [34, 34],
  "c-shape-tape": [40, 40],
  "thin-band": [140, 6],
  "scribble-strip": [90, 20],
  "chunky-block": [64, 30],
  "arched-strip": [90, 34],
  ribbon: [30, 84],
  "broken-band": [110, 14],
  "looping-strip": [90, 50],
  "segmented-strip": [100, 20],
  "tapered-strip": [100, 30],
  "jagged-strip": [100, 26],
  // geometric
  square: [40, 40],
  "square-missing-corner": [40, 40],
  "torn-square": [46, 46],
  "uneven-rectangle": [50, 36],
  "offset-rect": [40, 40],
  diamond: [44, 44],
  triangle: [44, 40],
  trapezoid: [50, 34],
  hexagon: [44, 44],
  octagon: [44, 44],
  "arc-piece": [44, 44],
  "cross-shape": [40, 40],
  "letter-shape": [40, 40],
  // organic
  "irregular-cutout": [40, 40],
  "organic-blob": [44, 44],
  "star-piece": [44, 44],
  "flower-piece": [44, 44],
  "cloud-piece": [50, 31],
  "starburst-piece": [46, 46],
  "bubble-piece": [40, 40],
  "crescent-piece": [44, 44],
  "squiggle-piece": [60, 30],
  // handmade
  "folded-corner": [40, 40],
  "crumpled-paper": [48, 48],
  "paper-tab": [34, 44],
  "sticker-corner": [36, 36],
  "die-cut-piece": [44, 44],
  "photo-fragment": [96, 72],
  // flagship
  "rhinestone-cluster": [70, 60],
  // signature
  barcode: [90, 28],
  "corner-medallion": [44, 44],
  "now-playing-panel": [580, 220],
  "route-field-block": [120, 44],
  "receipt-header": [820, 110],
  "receipt-footer": [820, 90],
  "postage-stamp-piece": [46, 54],
  "wax-seal": [32, 32],
  "approved-stamp": [90, 36],
  // "asset-svg" pieces are loaded+sized directly in lib/strip-renderer.ts
  // (real SVG art, natural aspect preserved) and never reach drawShape()/
  // renderPiece() below; this entry only exists to keep the Record exhaustive.
  "asset-svg": [140, 140],
};

function drawShape(
  kind: StripPieceKind,
  color: string,
  secondaryColor: string,
  w: number,
  h: number,
  seed: number,
  options: RenderPieceOptions,
): HTMLCanvasElement {
  switch (kind) {
    // straps
    case "tape":
      return tape(color, w, h, seed);
    case "cropped-tape":
      return croppedTape(color, w, h);
    case "bent-tape":
      return bentTape(color, w, h, seed);
    case "diagonal-strip":
      return diagonalStrip(color, w, h, seed);
    case "wavy-strip":
      return wavyStrip(color, w, h, seed);
    case "zigzag-strip":
      return zigzagStrip(color, w, h, seed);
    case "curved-strip":
      return curvedStrip(color, w, h);
    case "thin-band":
      return thinBand(color, w, h, seed);
    case "scribble-strip":
      return scribbleStrip(color, w, h, seed);
    case "broken-band":
      return brokenBand(color, w, h, seed);
    case "torn-strip":
      return tornStrip(color, w, h, seed);
    case "folded-strip":
      return foldedStrip(color, w, h);
    case "corner-wrap":
      return cornerWrap(color, w, Math.max(4, 5 * (w / DEFAULT_SIZE["corner-wrap"][0])));
    case "c-shape-tape":
      return cShapeTape(color, w, Math.max(4, 6 * (w / DEFAULT_SIZE["c-shape-tape"][0])));
    case "arched-strip":
      return archedStrip(color, w, h);
    case "ribbon":
      return ribbon(color, w, h);
    case "looping-strip":
      return loopingStrip(color, w, h, seed);
    case "segmented-strip":
      return segmentedStrip(color, w, h, seed);
    case "tapered-strip":
      return taperedStrip(color, w, h, seed);
    case "jagged-strip":
      return jaggedStrip(color, w, h, seed);

    // geometric
    case "offset-rect":
      return offsetRect(color, w, h);
    case "chunky-block":
      return chunkyBlock(color, w, h);
    case "torn-square":
      return tornSquare(color, w, seed);
    case "uneven-rectangle":
      return unevenRectangle(color, w, h, seed);
    case "square":
      return square(color, w, seed);
    case "square-missing-corner":
      return squareMissingCorner(color, w, seed);
    case "diamond":
      return diamond(color, w, seed);
    case "triangle":
      return triangle(color, w, h, seed);
    case "trapezoid":
      return trapezoid(color, w, h, seed);
    case "hexagon":
      return hexagon(color, w, seed);
    case "octagon":
      return octagon(color, w, seed);
    case "arc-piece":
      return arcPiece(color, w, seed);
    case "cross-shape":
      return crossShape(color, w, seed);
    case "letter-shape":
      return letterShape(color, w, seed);

    // organic
    case "irregular-cutout":
      return irregularCutout(color, w, seed);
    case "organic-blob":
      return organicBlob(color, w, seed);
    case "star-piece":
      return starPiece(color, w, seed);
    case "flower-piece":
      return flowerPiece(color, w, seed);
    case "cloud-piece":
      return cloudPiece(color, w, seed);
    case "starburst-piece":
      return starburstPiece(color, w, seed);
    case "bubble-piece":
      return bubblePiece(color, w, seed);
    case "crescent-piece":
      return crescentPiece(color, w, seed);
    case "squiggle-piece":
      return squigglePiece(color, w, seed);

    // handmade
    case "folded-corner":
      return foldedCorner(color, w, seed);
    case "crumpled-paper":
      return crumpledPaper(color, w, seed);
    case "paper-tab":
      return paperTab(color, w, h, seed);
    case "sticker-corner":
      return stickerCorner(color, w, seed);
    case "die-cut-piece":
      return dieCutPiece(color, w, seed);
    case "photo-fragment": {
      const source = options.source;
      if (!source) return offsetRect(color, w, h);
      return photoFragment(source, w, h, secondaryColor);
    }

    // flagship
    case "rhinestone-cluster":
      return drawRhinestoneCluster(w, h, seed, color, secondaryColor, 4 + Math.floor(mulberry32(seed)() * 3));

    // signature
    case "barcode":
      return barcode(color, w, h, seed);
    case "corner-medallion":
      return cornerMedallion(color, secondaryColor, w, seed);
    case "now-playing-panel":
      return nowPlayingPanel(color, secondaryColor, w, h);
    case "route-field-block":
      return routeFieldBlock(color, w, h, seed);
    case "receipt-header":
      return receiptHeader(color, w, h);
    case "receipt-footer":
      return receiptFooter(color, w, h, seed);
    case "postage-stamp-piece":
      return postageStampPiece(color, w, h, seed);
    case "wax-seal":
      return waxSeal(color, w, seed);
    case "approved-stamp":
      return approvedStamp(color, w, h, seed);

    default:
      return offsetRect(color, w, h);
  }
}

/** Draws one piece kind + material at 0deg orientation, sized by `scale`. Angle/position/opacity are applied by the caller. */
export function renderPiece(
  kind: StripPieceKind,
  material: MaterialId,
  color: string,
  scale: number,
  seed: number,
  options: RenderPieceOptions = {},
): HTMLCanvasElement {
  const [baseW, baseH] = DEFAULT_SIZE[kind];
  const w = baseW * scale;
  const h = baseH * scale;
  const secondaryColor = options.secondaryColor ?? color;
  const shape = drawShape(kind, color, secondaryColor, w, h, seed, options);
  return applyMaterialFinish(shape, material, seed);
}
