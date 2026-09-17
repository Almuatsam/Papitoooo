import { filterCss } from "@/lib/filters";
import { getTheme, type PieceEdge, type StripPiecePlacement, type ThemeColors } from "@/lib/themes";
import { getLayout, type Box } from "@/lib/layouts";
import { paintPattern } from "@/lib/decor/patterns";
import { paintTexture } from "@/lib/decor/textures";
import { svgToDataUrl } from "@/lib/decor/stickers";
import { loadHtmlImage } from "@/lib/decor/load-image";
import { roundRectPath } from "@/lib/decor/canvas-utils";
import { renderCaptionBitmap } from "@/lib/decor/caption-bitmap";
import { renderHeaderBand } from "@/lib/decor/header-band";
import { drawOuterFrame } from "@/lib/decor/outer-frame";
import { applyDoublePrint, applyTilt } from "@/lib/decor/strip-postprocess";
import { renderPiece, seedFrom, mulberry32 } from "@/lib/decor/strip-pieces";
import { jitterPiece, selectDecorPieces } from "@/lib/decor/decoration-generator";
import type { FilterId, Frame, Lang, LayoutId, StickerInstance, StripThemeId } from "@/types";

export interface RenderStripInput {
  frames: Frame[];
  filterId: FilterId;
  themeId: StripThemeId;
  layoutId: LayoutId;
  /** "" = use the theme default. */
  borderColor: string;
  /** "" = use the theme default. */
  bgColor: string;
  /** "" = use the theme default (colors.accent). Only visible on themes with a `strip.headerBand`, e.g. Boarding Pass's top band. */
  accentColor?: string;
  caption: string;
  /** Second text line — only used by themes whose captionTreatment is "now-playing" (rendered as the "artist" row). Ignored otherwise. */
  subtitle?: string;
  showDate: boolean;
  stickers?: StickerInstance[];
  lang?: Lang;
  /** Export multiplier. 1 for preview, higher for download. */
  scale?: number;
  /** Per-session seed driving which decoration pieces get selected/jittered — see lib/decor/decoration-generator.ts. */
  decorSeed?: number;
  /**
   * True only for the actual download render. The interactive sticker
   * editor and its background preview are always sized/rendered as a
   * single strip (see lib/layouts/double-strip-4.ts) — layout-level
   * double-print duplication only happens at export time, otherwise the
   * editor canvas (sized via stripDimensions) and the doubled preview
   * image would disagree on width.
   */
  finalize?: boolean;
}

/** Alternating tilt for the "stuck onto a page" scrapbook look. Deterministic. */
const ROTATION_JITTER = [-3, 2.4, -2.2, 3.2];

/** Gap (unscaled px) between the two copies in a double-print layout. */
const DOUBLE_PRINT_GAP = 24;

/** Solid placeholder used if a captured frame fails to decode, so one bad
 * photo degrades gracefully instead of failing the whole strip. */
function placeholderFrame(w: number, h: number, radius: number, color: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    if (radius > 0) roundRectPath(ctx, w, h, radius);
    else ctx.rect(0, 0, w, h);
    ctx.fillStyle = color;
    ctx.fill();
  }
  return canvas;
}

/** Cover-crops, rounds corners, and bakes the selected filter into one frame. */
async function prepFrame(
  src: string,
  w: number,
  h: number,
  radius: number,
  css: string,
): Promise<HTMLCanvasElement> {
  let img: HTMLImageElement;
  try {
    img = await loadHtmlImage(src);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[strip-renderer] a captured frame failed to decode; using a placeholder", err);
    return placeholderFrame(w, h, radius, "#d9d9d9");
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return placeholderFrame(w, h, radius, "#d9d9d9");

  if (radius > 0) {
    roundRectPath(ctx, w, h, radius);
    ctx.clip();
  }

  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;
  if (!naturalW || !naturalH) return placeholderFrame(w, h, radius, "#d9d9d9");

  const scale = Math.max(w / naturalW, h / naturalH);
  const dw = naturalW * scale;
  const dh = naturalH * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;

  if (css && css !== "none") ctx.filter = css;
  try {
    ctx.drawImage(img, dx, dy, dw, dh);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[strip-renderer] drawImage failed for a captured frame; using a placeholder", err);
    return placeholderFrame(w, h, radius, "#d9d9d9");
  }
  return canvas;
}

/** Resolves a theme colour slot to its concrete hex value. */
function pieceColor(slot: StripPiecePlacement["color"] | undefined, colors: ThemeColors, paper: string): string {
  if (!slot) return colors.ink;
  if (slot === "paper") return paper;
  return colors[slot];
}

/** Resolves a piece's edge/corner to an (x, y) anchor point within its bounding box. */
function edgePoint(box: Box, edge: PieceEdge): { x: number; y: number } {
  const { left, top, width, height } = box;
  switch (edge) {
    case "tl":
      return { x: left, y: top };
    case "tr":
      return { x: left + width, y: top };
    case "bl":
      return { x: left, y: top + height };
    case "br":
      return { x: left + width, y: top + height };
    case "top":
      return { x: left + width / 2, y: top };
    case "bottom":
      return { x: left + width / 2, y: top + height };
    case "left":
      return { x: left, y: top + height / 2 };
    case "right":
      return { x: left + width, y: top + height / 2 };
    default:
      return { x: left + width / 2, y: top + height / 2 };
  }
}

/**
 * Composites the captured photos into one themed film-strip image and
 * returns a PNG data URL. Single source of truth for both the live editor
 * preview and the download (via `scale`). Arrangement (how many photos,
 * arranged how) comes from `layoutId` (lib/layouts/); decoration/palette
 * comes from `themeId` (lib/themes/) — the two stay independent axes.
 */
export async function renderStrip(input: RenderStripInput): Promise<string> {
  const {
    frames,
    filterId,
    themeId,
    layoutId,
    borderColor,
    bgColor,
    accentColor = "",
    caption,
    subtitle = "",
    showDate,
    stickers = [],
    lang = "en",
    scale = 1,
    decorSeed = 0,
    finalize = false,
  } = input;

  if (document.fonts?.ready) await document.fonts.ready;

  // Loaded on demand: never touches the server render, and keeps Fabric out
  // of screens that never build a strip (Home, Camera).
  const { StaticCanvas, FabricImage, FabricText, Rect, Circle } = await import("fabric");

  const theme = getTheme(themeId);
  const strip = theme.strip;
  const colors = theme.colors;
  const css = filterCss(filterId);
  const paper = bgColor || colors.paper;
  const keyline = borderColor || colors.ink;

  const { canvasW, canvasH, boxes } = getLayout(layoutId).computeLayout(theme);

  const el = document.createElement("canvas");
  const fCanvas = new StaticCanvas(el, { width: canvasW, height: canvasH, enableRetinaScaling: false });

  try {
    // ---- background ------------------------------------------------------
    // Painted onto an offscreen tile and added as a Fabric image (never onto
    // Fabric's own canvas element directly — renderAll() would wipe it).
    const isScallop = strip.outerFrame.style === "scallop";
    const band = strip.outerFrame.width;
    const bgArea = isScallop
      ? { x: band, y: band, w: canvasW - band * 2, h: canvasH - band * 2 }
      : { x: 0, y: 0, w: canvasW, h: canvasH };

    if (isScallop) {
      fCanvas.add(
        new Rect({ left: 0, top: 0, width: canvasW, height: canvasH, fill: colors.accent, selectable: false, evented: false }),
      );
      fCanvas.add(
        new Rect({
          left: band,
          top: band,
          width: canvasW - band * 2,
          height: canvasH - band * 2,
          fill: paper,
          selectable: false,
          evented: false,
        }),
      );
      const r = band;
      const step = r * 1.9;
      const addScallop = (x: number, y: number) =>
        fCanvas.add(new Circle({ left: x - r, top: y - r, radius: r, fill: paper, selectable: false, evented: false }));
      for (let x = band; x <= canvasW - band; x += step) {
        addScallop(x, band);
        addScallop(x, canvasH - band);
      }
      for (let y = band; y <= canvasH - band; y += step) {
        addScallop(band, y);
        addScallop(canvasW - band, y);
      }
    } else {
      fCanvas.backgroundColor = paper;
    }

    // Decorative background pattern/texture — never let this take the whole
    // strip down; worst case the theme just renders on a plain paper colour.
    try {
      if (strip.background.kind !== "solid") {
        const bgTile = document.createElement("canvas");
        bgTile.width = bgArea.w;
        bgTile.height = bgArea.h;
        const bgCtx = bgTile.getContext("2d");
        if (bgCtx) {
          const second = strip.background.patternUsesAccent ? colors.accent2 : colors.accent;
          const localArea = { x: 0, y: 0, w: bgArea.w, h: bgArea.h };
          if (strip.background.kind === "pattern" || strip.background.kind === "pattern+texture") {
            if (strip.background.patternId) {
              paintPattern(bgCtx, localArea, strip.background.patternId, paper, second, 1.4);
            }
          }
          if (strip.background.kind === "texture" || strip.background.kind === "pattern+texture") {
            if (strip.background.textureId) {
              paintTexture(bgCtx, localArea, strip.background.textureId, colors.ink, colors.accent, 1.4);
            }
          }
          fCanvas.add(new FabricImage(bgTile, { left: bgArea.x, top: bgArea.y, selectable: false, evented: false }));
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[strip-renderer] background pattern/texture failed, skipping", err);
    }

    // ---- header band (Boarding Pass's "BOARDING PASS" bar) --------------
    // Drawn into the theme's own outerPad margin, before the outer frame,
    // so the frame's border/perforation still wraps around it.
    if (strip.headerBand) {
      try {
        const headerColor = accentColor || colors.accent;
        const bandCanvas = renderHeaderBand(canvasW, strip.headerBand.height, headerColor, paper, strip.headerBand.label, strip.captionFontVar);
        fCanvas.add(new FabricImage(bandCanvas, { left: 0, top: 0, selectable: false, evented: false }));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[strip-renderer] header band failed, skipping", err);
      }
    }

    // ---- outer frame ---------------------------------------------------
    drawOuterFrame(strip, canvasW, canvasH, keyline, paper, colors, { fCanvas, Rect, Circle, FabricImage });

    // ---- decoration pieces: select + jitter, then frame-anchored back layer
    // Each theme offers a pool of candidate pieces (lib/themes/); which
    // ones actually appear, and their fine angle/scale/offset, is seed-
    // selected here — same session seed always reproduces the same
    // composition (pixel-identical preview/export), different sessions get
    // a different one ("looks slightly different every time"). Required
    // pieces (a theme's signature elements) always draw regardless of seed.
    const poolSeed = seedFrom(themeId, decorSeed, "pool");
    const selected = selectDecorPieces(strip.piecePool, strip.pieceCount, poolSeed);
    // Required pieces (a theme's signature/structural elements — a receipt
    // header, a route-field table) are precisely authored and meant to read
    // as intentional, not "handmade" — jitter's random rotation/offset is
    // for optional flourish pieces only.
    const piecesWithIndex = selected.map((piece, index) => ({
      piece: piece.required ? piece : jitterPiece(piece, seedFrom(themeId, decorSeed, "jitter", index)),
      index,
    }));
    const framePieces = piecesWithIndex.filter((p) => p.piece.anchor === "frame");
    const photoPieces = piecesWithIndex.filter((p) => p.piece.anchor !== "frame");
    // Bottom bound stops just above the caption band so frame-anchored
    // pieces never fight the caption for space.
    const frameMargin = strip.outerPad * 0.4;
    const frameBox: Box = {
      left: frameMargin,
      top: frameMargin,
      width: canvasW - frameMargin * 2,
      height: canvasH - strip.bottomPad - frameMargin * 2,
    };

    // Base width "asset-svg" pieces scale from — natural aspect is preserved,
    // "scale" multiplies this the same way it multiplies DEFAULT_SIZE for
    // every other piece kind (see lib/decor/strip-pieces.ts).
    const ASSET_SVG_BASE_WIDTH = 140;

    async function addPiece(piece: StripPiecePlacement, index: number, box: Box, source?: HTMLCanvasElement): Promise<void> {
      try {
        const anchorPoint = edgePoint(box, piece.edge);
        const x = anchorPoint.x + (piece.offset?.x ?? 0);
        const y = anchorPoint.y + (piece.offset?.y ?? 0);

        if (piece.kind === "asset-svg" && piece.assetSvg) {
          const img = await loadHtmlImage(svgToDataUrl(piece.assetSvg));
          const naturalW = img.naturalWidth || img.width || ASSET_SVG_BASE_WIDTH;
          const naturalH = img.naturalHeight || img.height || ASSET_SVG_BASE_WIDTH;
          let source2d: HTMLImageElement | HTMLCanvasElement = img;
          if (piece.assetFilter) {
            const raster = document.createElement("canvas");
            raster.width = naturalW;
            raster.height = naturalH;
            const rctx = raster.getContext("2d");
            if (rctx) {
              rctx.filter = piece.assetFilter;
              rctx.drawImage(img, 0, 0, naturalW, naturalH);
              source2d = raster;
            }
          }
          const targetW = ASSET_SVG_BASE_WIDTH * (piece.scale ?? 1);
          const s = targetW / naturalW;
          fCanvas.add(
            new FabricImage(source2d, {
              left: x,
              top: y,
              originX: "center",
              originY: "center",
              angle: piece.angle,
              opacity: piece.opacity ?? 1,
              scaleX: s,
              scaleY: s,
              selectable: false,
              evented: false,
            }),
          );
          return;
        }

        const color = pieceColor(piece.color, colors, paper);
        const secondaryColor = pieceColor(piece.secondaryColor, colors, paper);
        const seed = seedFrom(themeId, decorSeed, piece.kind, String(piece.anchor), piece.edge, index);
        const canvas = renderPiece(piece.kind, piece.material, color, piece.scale ?? 1, seed, {
          source,
          secondaryColor,
        });
        fCanvas.add(
          new FabricImage(canvas, {
            left: x,
            top: y,
            originX: "center",
            originY: "center",
            angle: piece.angle,
            opacity: piece.opacity ?? 1,
            selectable: false,
            evented: false,
          }),
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[strip-renderer] decoration piece failed, skipping", err);
      }
    }

    for (const { piece, index } of framePieces) {
      if (piece.layer === "back") await addPiece(piece, index, frameBox);
    }

    // ---- photos ----------------------------------------------------------
    // `boxes` (from lib/layouts/) replaces the old fixed vertical-stack
    // formula — every layout (single photo, grid, asymmetric, ...) is just
    // a different box list over the same drawing order.
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      const src = frames[i] ?? frames[frames.length - 1];
      const prepped = await prepFrame(src, box.width, box.height, strip.radius, css);
      const angle = strip.photoRotationJitter ? ROTATION_JITTER[i % ROTATION_JITTER.length] : 0;
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;

      for (const { piece, index } of photoPieces) {
        if (piece.anchor === i && piece.layer === "back") await addPiece(piece, index, box, prepped);
      }

      const fabricImg = new FabricImage(prepped, {
        left: cx,
        top: cy,
        originX: "center",
        originY: "center",
        angle,
        selectable: false,
        evented: false,
      });
      fCanvas.add(fabricImg);

      if (strip.photoBorder > 0) {
        fCanvas.add(
          new Rect({
            left: cx,
            top: cy,
            originX: "center",
            originY: "center",
            angle,
            width: box.width,
            height: box.height,
            rx: strip.radius,
            ry: strip.radius,
            fill: "transparent",
            stroke: keyline,
            strokeWidth: strip.photoBorder,
            selectable: false,
            evented: false,
          }),
        );
      }

      for (const { piece, index } of photoPieces) {
        if (piece.anchor === i && piece.layer === "front") await addPiece(piece, index, box, prepped);
      }
    }

    // ---- decoration pieces: frame-anchored front layer -------------------
    for (const { piece, index } of framePieces) {
      if (piece.layer === "front") await addPiece(piece, index, frameBox);
    }

    // ---- stickers (user-placed) ----------------------------------------
    const sorted = [...stickers].sort((a, b) => a.z - b.z);
    for (const sticker of sorted) {
      if (sticker.kind === "emoji") {
        fCanvas.add(
          new FabricText(sticker.content, {
            left: sticker.x,
            top: sticker.y,
            originX: "center",
            originY: "center",
            angle: sticker.angle,
            scaleX: sticker.scale,
            scaleY: sticker.scale,
            fontSize: 64,
            fontFamily:
              "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif",
            selectable: false,
            evented: false,
          }),
        );
      } else {
        try {
          const img = await loadHtmlImage(svgToDataUrl(sticker.content));
          const width = img.naturalWidth || img.width || 64;
          const height = img.naturalHeight || img.height || 64;
          fCanvas.add(
            new FabricImage(img, {
              left: sticker.x,
              top: sticker.y,
              width,
              height,
              originX: "center",
              originY: "center",
              angle: sticker.angle,
              scaleX: sticker.scale,
              scaleY: sticker.scale,
              objectCaching: false,
              selectable: false,
              evented: false,
            }),
          );
        } catch {
          // skip stickers that fail to rasterise rather than aborting the export
        }
      }
    }

    // ---- caption -----------------------------------------------------
    try {
      const parts: string[] = [];
      const trimmed = caption.trim();
      if (trimmed) parts.push(trimmed);
      // "now-playing" (Streaming Card) is a title/artist row and
      // "boarding-pass" (Boarding Pass) is a FROM/TO route row — neither is
      // a caption+date line, so both ignore the date entirely and always
      // draw (with placeholder text) since a structural piece below each
      // (now-playing-panel / the barcode+tear line) expects this row present.
      const hasOwnFixedLayout = strip.captionTreatment === "now-playing" || strip.captionTreatment === "boarding-pass";
      if (showDate && !hasOwnFixedLayout) {
        const locale = lang === "ar" ? "ar" : undefined;
        parts.push(new Date().toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" }));
      }
      if (parts.length > 0 || hasOwnFixedLayout) {
        const label = parts.join("   ·   ");
        const captionCanvas = renderCaptionBitmap(
          canvasW,
          strip.bottomPad,
          label,
          colors,
          strip.captionFontVar,
          strip.captionFontSize,
          strip.captionTreatment,
          lang,
          subtitle,
        );
        fCanvas.add(
          new FabricImage(captionCanvas, {
            left: 0,
            top: canvasH - strip.bottomPad,
            selectable: false,
            evented: false,
          }),
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[strip-renderer] caption bitmap failed, skipping", err);
    }

    fCanvas.renderAll();
    let dataUrl = fCanvas.toDataURL({ format: "png", multiplier: scale, enableRetinaScaling: false });

    // ---- postprocessing: theme tilt, then layout double-print -----------
    // Both operate on the fully-composited raster (photos + pieces +
    // stickers + caption already baked in) so layout and theme stay
    // independent, composable axes.
    if (strip.tiltDeg) {
      const jitterSeed = seedFrom(themeId, decorSeed, "tilt");
      const jitter = (mulberry32(jitterSeed)() * 2 - 1) * 2;
      dataUrl = await applyTilt(dataUrl, strip.tiltDeg + jitter);
    }
    if (finalize && layoutId === "double-strip-4") {
      dataUrl = await applyDoublePrint(dataUrl, DOUBLE_PRINT_GAP * scale);
    }

    return dataUrl;
  } finally {
    // Never let cleanup mask a successful render: dispose() is async in
    // Fabric v6, and a rejection here must not replace the value/error the
    // try block already produced.
    try {
      void fCanvas.dispose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[strip-renderer] canvas dispose failed (non-fatal)", err);
    }
  }
}

/** Logical (unscaled) strip dimensions for a theme + layout — used to size the interactive editor canvas. */
export function stripDimensions(themeId: StripThemeId, layoutId: LayoutId): { width: number; height: number } {
  const theme = getTheme(themeId);
  const { canvasW, canvasH } = getLayout(layoutId).computeLayout(theme);
  if (theme.strip.tiltDeg) {
    // Must match applyTilt()'s own padding exactly: a square whose side is
    // the untilted strip's diagonal is big enough to hold it at ANY
    // rotation angle, which is why this doesn't need the actual (jittered)
    // angle to compute — same square, regardless of angle. Getting this
    // out of sync with applyTilt() is exactly what made the editor frame
    // show a cropped, zoomed-in corner instead of the whole tilted strip.
    const diag = Math.ceil(Math.sqrt(canvasW * canvasW + canvasH * canvasH));
    return { width: diag, height: diag };
  }
  return { width: canvasW, height: canvasH };
}
