import { PHOTO_WIDTH, PHOTO_HEIGHT, PHOTO_COUNT } from "@/lib/constants";
import { filterCss } from "@/lib/filters";
import { getStripStyle } from "@/lib/strip-styles";
import type { FilterId, Frame, StripStyleId } from "@/types";

export interface RenderStripInput {
  frames: Frame[];
  filterId: FilterId;
  styleId: StripStyleId;
  /** "" = use the style default. */
  borderColor: string;
  /** "" = use the style default. */
  bgColor: string;
  caption: string;
  showDate: boolean;
  /** Export multiplier. 1 for preview, higher for download. */
  scale?: number;
}

const SPROCKET_COL = 34; // width of each film sprocket column

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load frame"));
    img.src = src;
  });
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.arcTo(w, 0, w, h, radius);
  ctx.arcTo(w, h, 0, h, radius);
  ctx.arcTo(0, h, 0, 0, radius);
  ctx.arcTo(0, 0, w, 0, radius);
  ctx.closePath();
}

/**
 * Draws one frame into an offscreen canvas: cover-cropped to the photo box,
 * corners rounded, and the selected filter baked in via `ctx.filter`. The
 * filter is identical to the one used on the live preview, so preview and
 * export match.
 */
async function prepFrame(
  src: string,
  w: number,
  h: number,
  radius: number,
  css: string,
): Promise<HTMLCanvasElement> {
  const img = await loadHtmlImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");

  if (radius > 0) {
    roundRectPath(ctx, w, h, radius);
    ctx.clip();
  }

  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;

  if (css && css !== "none") ctx.filter = css;
  ctx.drawImage(img, dx, dy, dw, dh);
  return canvas;
}

/**
 * Composites the four photos into a single film-strip image and returns a PNG
 * data URL. Used for both the on-screen preview and the download (via `scale`).
 * Fabric.js handles layout, borders, decoration and caption text; it is loaded
 * on demand so it never runs during SSR or bloats the initial bundle.
 */
export async function renderStrip(input: RenderStripInput): Promise<string> {
  const {
    frames,
    filterId,
    styleId,
    borderColor,
    bgColor,
    caption,
    showDate,
    scale = 1,
  } = input;

  const { StaticCanvas, FabricImage, Rect, FabricText } = await import("fabric");

  const style = getStripStyle(styleId);
  const css = filterCss(filterId);
  const paper = bgColor || style.bg;
  const keyline = borderColor || style.photoBorderColor;
  const isFilm = style.decoration === "sprockets";

  const photoW = PHOTO_WIDTH;
  const photoH = PHOTO_HEIGHT;
  const sideCol = isFilm ? SPROCKET_COL + 12 : 0;
  const contentLeft = style.outerPad + sideCol;

  const canvasW = photoW + 2 * contentLeft;
  const canvasH =
    style.outerPad +
    PHOTO_COUNT * photoH +
    (PHOTO_COUNT - 1) * style.gap +
    style.bottomPad;

  const el = document.createElement("canvas");
  const canvas = new StaticCanvas(el, {
    width: canvasW,
    height: canvasH,
    enableRetinaScaling: false,
  });
  canvas.backgroundColor = paper;

  try {
    if (isFilm) {
      const holeH = 26;
      const holeW = SPROCKET_COL - 12;
      const step = holeH + 16;
      for (let y = style.outerPad; y + holeH < canvasH - style.outerPad; y += step) {
        for (const x of [style.outerPad, canvasW - style.outerPad - holeW]) {
          canvas.add(
            new Rect({
              left: x,
              top: y,
              width: holeW,
              height: holeH,
              rx: 5,
              ry: 5,
              fill: "#3a3a3d",
              selectable: false,
              evented: false,
            }),
          );
        }
      }
    }

    for (let i = 0; i < PHOTO_COUNT; i++) {
      const top = style.outerPad + i * (photoH + style.gap);
      const src = frames[i] ?? frames[frames.length - 1];
      const prepped = await prepFrame(src, photoW, photoH, style.radius, css);

      canvas.add(
        new FabricImage(prepped, {
          left: contentLeft,
          top,
          selectable: false,
          evented: false,
        }),
      );

      if (style.photoBorder > 0) {
        canvas.add(
          new Rect({
            left: contentLeft,
            top,
            width: photoW,
            height: photoH,
            rx: style.radius,
            ry: style.radius,
            fill: "transparent",
            stroke: keyline,
            strokeWidth: style.photoBorder,
            selectable: false,
            evented: false,
          }),
        );
      }
    }

    const parts: string[] = [];
    const trimmed = caption.trim();
    if (trimmed) parts.push(trimmed);
    if (showDate) {
      parts.push(
        new Date().toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      );
    }
    if (parts.length > 0) {
      const text = new FabricText(parts.join("   ·   "), {
        left: canvasW / 2,
        top: canvasH - style.bottomPad / 2 - style.fontSize / 2,
        originX: "center",
        originY: "top",
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fill: style.textColor,
        selectable: false,
        evented: false,
      });
      canvas.add(text);
    }

    canvas.renderAll();
    return canvas.toDataURL({
      format: "png",
      multiplier: scale,
      enableRetinaScaling: false,
    });
  } finally {
    canvas.dispose();
  }
}
