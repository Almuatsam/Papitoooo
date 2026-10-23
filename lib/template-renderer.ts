import { addStickers } from "@/lib/decor/add-stickers";
import { loadHtmlImage } from "@/lib/decor/load-image";
import { ensureDateFont, formatTemplateDate, renderTemplateDate } from "@/lib/decor/template-date";
import type { LayoutDef } from "@/lib/layouts";
import type { ThemeDef } from "@/lib/themes";
import type { Frame, Lang, StickerInstance } from "@/types";

export interface TemplateRenderInput {
  layout: LayoutDef;
  theme: ThemeDef;
  frames: Frame[];
  stickers: StickerInstance[];
  showDate: boolean;
  lang: Lang;
  /** Cover-crops + grades one captured frame to the slot size (strip-renderer's `prepFrame`, injected to avoid a circular import). */
  prepFrame: (src: string, width: number, height: number) => Promise<HTMLCanvasElement>;
}

/**
 * Composites a template layout: artwork first, then each photo cover-cropped
 * into its measured slot (the slot is the artwork's grey fill, so the lime
 * keyline around it stays visible), then the date, then stickers. Always
 * rendered at the template's native pixel size, which is already print
 * resolution (300 dpi), so there is no export multiplier.
 */
export async function renderTemplateStrip(input: TemplateRenderInput): Promise<string> {
  const { layout, theme, frames, stickers, showDate, lang, prepFrame } = input;
  const template = layout.template;
  if (!template) throw new Error(`Layout ${layout.id} is not a template layout`);

  const { StaticCanvas, FabricImage, FabricText } = await import("fabric");
  const { canvasW, canvasH, boxes } = layout.computeLayout(theme);

  const el = document.createElement("canvas");
  const fCanvas = new StaticCanvas(el, { width: canvasW, height: canvasH, enableRetinaScaling: false });

  try {
    const art = await loadHtmlImage(template.image);
    const artW = art.naturalWidth || art.width;
    const artH = art.naturalHeight || art.height;
    fCanvas.add(
      new FabricImage(art, {
        left: 0,
        top: 0,
        scaleX: artW ? canvasW / artW : 1,
        scaleY: artH ? canvasH / artH : 1,
        selectable: false,
        evented: false,
      }),
    );

    // A frame shown in several slots (double prints) is graded and cropped
    // once, at the largest of its slots, and each slot shows the top-left
    // crop of that one bitmap. The measured slots of a pair differ by a pixel
    // or two, so preparing per slot would resample the copies differently.
    const frameIndexOf = (slot: number): number => template.slotFrames[slot] ?? slot;
    const bounds = new Map<number, { width: number; height: number }>();
    boxes.forEach((box, i) => {
      const key = frameIndexOf(i);
      const seen = bounds.get(key);
      bounds.set(key, {
        width: Math.max(seen?.width ?? 0, box.width),
        height: Math.max(seen?.height ?? 0, box.height),
      });
    });
    const prepared = new Map<number, HTMLCanvasElement>();

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      const key = frameIndexOf(i);
      let prepped = prepared.get(key);
      if (!prepped) {
        const size = bounds.get(key) ?? box;
        prepped = await prepFrame(frames[key] ?? frames[frames.length - 1], size.width, size.height);
        prepared.set(key, prepped);
      }
      fCanvas.add(
        new FabricImage(prepped, {
          left: box.left,
          top: box.top,
          width: box.width,
          height: box.height,
          cropX: 0,
          cropY: 0,
          selectable: false,
          evented: false,
        }),
      );
    }

    if (showDate && template.dateBoxes.length > 0) {
      const text = formatTemplateDate(lang);
      await ensureDateFont(lang, text);
      for (const dateBox of template.dateBoxes) {
        const { canvas, left, top } = renderTemplateDate(dateBox, text, lang);
        fCanvas.add(new FabricImage(canvas, { left, top, selectable: false, evented: false }));
      }
    }

    await addStickers(fCanvas, stickers, { FabricImage, FabricText });

    fCanvas.renderAll();
    return fCanvas.toDataURL({ format: "png", multiplier: 1, enableRetinaScaling: false });
  } finally {
    try {
      void fCanvas.dispose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[template-renderer] canvas dispose failed (non-fatal)", err);
    }
  }
}
