import { PHOTO_WIDTH, PHOTO_HEIGHT, PHOTO_COUNT } from "@/lib/constants";
import { filterCss } from "@/lib/filters";
import { getTheme } from "@/lib/themes";
import { paintPattern } from "@/lib/decor/patterns";
import { paintTexture } from "@/lib/decor/textures";
import { readThemeColors, readCssVar } from "@/lib/decor/theme-vars";
import { svgToDataUrl } from "@/lib/decor/stickers";
import { loadHtmlImage } from "@/lib/decor/load-image";
import type { FilterId, Frame, Lang, StickerInstance, StripThemeId } from "@/types";

export interface RenderStripInput {
  frames: Frame[];
  filterId: FilterId;
  themeId: StripThemeId;
  /** "" = use the theme default. */
  borderColor: string;
  /** "" = use the theme default. */
  bgColor: string;
  caption: string;
  showDate: boolean;
  stickers?: StickerInstance[];
  lang?: Lang;
  /** Export multiplier. 1 for preview, higher for download. */
  scale?: number;
}

/** Alternating tilt for the "stuck onto a page" scrapbook look. Deterministic. */
const ROTATION_JITTER = [-3, 2.4, -2.2, 3.2];

function roundRectPath(ctx: CanvasRenderingContext2D, w: number, h: number, r: number): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.arcTo(w, 0, w, h, radius);
  ctx.arcTo(w, h, 0, h, radius);
  ctx.arcTo(0, h, 0, 0, radius);
  ctx.arcTo(0, 0, w, 0, radius);
  ctx.closePath();
}

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

/** Small translucent "washi tape" rect, pre-rotated on its own canvas so Fabric can place it as one image. */
function tapeStrip(color: string, w = 70, h = 24): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.68;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  // torn-edge notches
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let x = 0; x < w; x += 6) {
    ctx.fillRect(x, 0, 2, 2);
    ctx.fillRect(x, h - 2, 2, 2);
  }
  return canvas;
}

/** Renders the caption + optional date as a single bitmap so Arabic/RTL text shapes correctly. */
function renderCaptionBitmap(
  width: number,
  height: number,
  text: string,
  colors: ReturnType<typeof readThemeColors>,
  fontVar: string,
  fontSize: number,
  treatment: string,
  lang: Lang,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx || !text.trim()) return canvas;

  const family = readCssVar(fontVar) || "sans-serif";
  ctx.direction = lang === "ar" ? "rtl" : "ltr";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cx = width / 2;
  const cy = height / 2;

  if (treatment === "cover-line") {
    ctx.fillStyle = colors.accent;
    const barH = fontSize * 1.5;
    ctx.fillRect(0, cy - barH / 2, width, barH);
    ctx.fillStyle = "#ffffff";
    ctx.font = `900 ${fontSize}px ${family}`;
    ctx.fillText(text, cx, cy + fontSize * 0.04);
  } else if (treatment === "bubble") {
    const padX = fontSize * 0.9;
    ctx.font = `700 ${fontSize}px ${family}`;
    const metrics = ctx.measureText(text);
    const bw = Math.min(width - 8, metrics.width + padX * 2);
    const bh = fontSize * 1.9;
    ctx.fillStyle = colors.accent;
    roundRectPath(ctx, bw, bh, bh / 2);
    ctx.save();
    ctx.translate(cx - bw / 2, cy - bh / 2);
    roundRectPath(ctx, bw, bh, bh / 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, cx, cy + fontSize * 0.04);
  } else if (treatment === "stamp") {
    ctx.font = `700 ${fontSize}px ${family}`;
    ctx.fillStyle = colors.accent2;
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 1;
    const metrics = ctx.measureText(text);
    const bw = metrics.width + fontSize * 1.4;
    const bh = fontSize * 1.7;
    ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);
    ctx.fillText(text, cx, cy + fontSize * 0.04);
  } else if (treatment === "handwritten") {
    ctx.font = `400 ${fontSize}px ${family}`;
    ctx.fillStyle = colors.ink;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.03);
    ctx.fillText(text, 0, fontSize * 0.05);
    ctx.restore();
  } else if (treatment === "pixel") {
    ctx.font = `400 ${fontSize}px ${family}`;
    ctx.fillStyle = colors.ink;
    ctx.fillText(text, cx, cy + fontSize * 0.04);
  } else {
    ctx.font = `400 ${fontSize}px ${family}`;
    ctx.fillStyle = colors.muted;
    ctx.fillText(text, cx, cy + fontSize * 0.04);
  }

  return canvas;
}

/**
 * Composites the four photos into one themed film-strip image and returns a
 * PNG data URL. Single source of truth for both the live editor preview and
 * the download (via `scale`). Every colour and font comes from the live
 * theme CSS custom properties (see lib/decor/theme-vars.ts) so the export
 * always matches whatever is on screen.
 */
export async function renderStrip(input: RenderStripInput): Promise<string> {
  const {
    frames,
    filterId,
    themeId,
    borderColor,
    bgColor,
    caption,
    showDate,
    stickers = [],
    lang = "en",
    scale = 1,
  } = input;

  if (document.fonts?.ready) await document.fonts.ready;

  // Loaded on demand: never touches the server render, and keeps Fabric out
  // of screens that never build a strip (Home, Camera).
  const { StaticCanvas, FabricImage, FabricText, Rect, Circle } = await import("fabric");

  const theme = getTheme(themeId);
  const strip = theme.strip;
  const colors = readThemeColors();
  const css = filterCss(filterId);
  const paper = bgColor || colors.paper;
  const keyline = borderColor || colors.ink;

  const photoW = PHOTO_WIDTH;
  const photoH = PHOTO_HEIGHT;
  const contentLeft = strip.outerPad;
  const canvasW = photoW + contentLeft * 2;
  const canvasH = strip.outerPad + PHOTO_COUNT * photoH + (PHOTO_COUNT - 1) * strip.gap + strip.bottomPad;

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

    // ---- outer frame ---------------------------------------------------
    if (strip.outerFrame.style === "solid") {
      fCanvas.add(
        new Rect({
          left: strip.outerFrame.width / 2,
          top: strip.outerFrame.width / 2,
          width: canvasW - strip.outerFrame.width,
          height: canvasH - strip.outerFrame.width,
          fill: "transparent",
          stroke: keyline,
          strokeWidth: strip.outerFrame.width,
          selectable: false,
          evented: false,
        }),
      );
    } else if (strip.outerFrame.style === "dashed") {
      fCanvas.add(
        new Rect({
          left: strip.outerFrame.width,
          top: strip.outerFrame.width,
          width: canvasW - strip.outerFrame.width * 2,
          height: canvasH - strip.outerFrame.width * 2,
          fill: "transparent",
          stroke: keyline,
          strokeWidth: strip.outerFrame.width * 0.6,
          strokeDashArray: [strip.outerFrame.width * 1.6, strip.outerFrame.width],
          selectable: false,
          evented: false,
        }),
      );
    } else if (strip.outerFrame.style === "chrome") {
      const w = strip.outerFrame.width;
      fCanvas.add(
        new Rect({
          left: w / 2,
          top: w / 2,
          width: canvasW - w,
          height: canvasH - w,
          fill: "transparent",
          stroke: "#8b9096",
          strokeWidth: w,
          selectable: false,
          evented: false,
        }),
      );
      fCanvas.add(
        new Rect({
          left: w * 0.85,
          top: w * 0.85,
          width: canvasW - w * 1.7,
          height: canvasH - w * 1.7,
          fill: "transparent",
          stroke: "#f4f6f8",
          strokeWidth: Math.max(1.5, w * 0.22),
          selectable: false,
          evented: false,
        }),
      );
    }

    // ---- corner decoration behind photos -------------------------------
    try {
      if (strip.decoration === "checker-corners" || strip.decoration === "halftone-corners") {
        const size = Math.max(30, Math.min(strip.outerPad * 1.7, 46));
        const corners: Array<[number, number]> = [
          [6, 6],
          [canvasW - size - 6, 6],
          [6, canvasH - size - 6],
          [canvasW - size - 6, canvasH - size - 6],
        ];
        for (const [x, y] of corners) {
          const tile = document.createElement("canvas");
          tile.width = size;
          tile.height = size;
          const tctx = tile.getContext("2d");
          if (!tctx) continue;
          if (strip.decoration === "checker-corners") {
            paintPattern(tctx, { x: 0, y: 0, w: size, h: size }, "checker", paper, colors.ink, 1.1);
          } else {
            tctx.fillStyle = paper;
            tctx.fillRect(0, 0, size, size);
            paintTexture(tctx, { x: 0, y: 0, w: size, h: size }, "halftone", colors.ink, colors.accent, 2.2);
          }
          fCanvas.add(new FabricImage(tile, { left: x, top: y, selectable: false, evented: false }));
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[strip-renderer] corner decoration failed, skipping", err);
    }

    // ---- photos ----------------------------------------------------------
    for (let i = 0; i < PHOTO_COUNT; i++) {
      const top = strip.outerPad + i * (photoH + strip.gap);
      const src = frames[i] ?? frames[frames.length - 1];
      const prepped = await prepFrame(src, photoW, photoH, strip.radius, css);
      const angle = strip.photoRotationJitter ? ROTATION_JITTER[i % ROTATION_JITTER.length] : 0;
      const cx = contentLeft + photoW / 2;
      const cy = top + photoH / 2;

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
            width: photoW,
            height: photoH,
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

      if (strip.decoration === "tape") {
        const tapeColor = i % 2 === 0 ? colors.accent : colors.accent2;
        const t1 = tapeStrip(tapeColor);
        fCanvas.add(
          new FabricImage(t1, {
            left: cx - photoW / 2 + 14,
            top: top - 6,
            originX: "center",
            originY: "center",
            angle: -18,
            selectable: false,
            evented: false,
          }),
        );
        if (i % 2 === 0) {
          const t2 = tapeStrip(colors.accent2, 56, 20);
          fCanvas.add(
            new FabricImage(t2, {
              left: cx + photoW / 2 - 18,
              top: top + photoH - 4,
              originX: "center",
              originY: "center",
              angle: 16,
              selectable: false,
              evented: false,
            }),
          );
        }
      }
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
      if (showDate) {
        const locale = lang === "ar" ? "ar" : undefined;
        parts.push(new Date().toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" }));
      }
      if (parts.length > 0) {
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
    return fCanvas.toDataURL({ format: "png", multiplier: scale, enableRetinaScaling: false });
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

/** Logical (unscaled) strip dimensions for a theme — used to size the interactive editor canvas. */
export function stripDimensions(themeId: StripThemeId): { width: number; height: number } {
  const strip = getTheme(themeId).strip;
  return {
    width: PHOTO_WIDTH + strip.outerPad * 2,
    height: strip.outerPad + PHOTO_COUNT * PHOTO_HEIGHT + (PHOTO_COUNT - 1) * strip.gap + strip.bottomPad,
  };
}
