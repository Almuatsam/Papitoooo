import { PHOTO_WIDTH } from "@/lib/constants";
import type { LayoutDef } from "@/lib/layouts/types";

/** A single tall portrait-proportioned photo — a 4x6-style vertical card, one shot. */
export const singlePortrait: LayoutDef = {
  id: "single-portrait",
  label: "Single Portrait",
  tagline: "1 tall photo",
  photoCount: 1,
  computeLayout(theme) {
    const { outerPad, bottomPad } = theme.strip;
    const cellW = PHOTO_WIDTH * 0.85;
    const cellH = cellW * 1.5;
    const canvasW = outerPad * 2 + cellW;
    const canvasH = outerPad + cellH + bottomPad;
    return { canvasW, canvasH, boxes: [{ left: outerPad, top: outerPad, width: cellW, height: cellH }] };
  },
};
