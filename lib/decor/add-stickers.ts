import type { StaticCanvas } from "fabric";
import { svgToDataUrl } from "@/lib/decor/stickers";
import { loadHtmlImage } from "@/lib/decor/load-image";
import type { StickerInstance } from "@/types";

type FabricModule = typeof import("fabric");

/** Paints user-placed stickers onto a Fabric canvas in z order. Shared by the standard and template strip renderers. */
export async function addStickers(
  fCanvas: StaticCanvas,
  stickers: StickerInstance[],
  { FabricImage, FabricText }: Pick<FabricModule, "FabricImage" | "FabricText">,
): Promise<void> {
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
}
