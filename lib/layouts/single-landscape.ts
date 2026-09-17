import { PHOTO_WIDTH } from "@/lib/constants";
import type { LayoutDef } from "@/lib/layouts/types";

/** A single wide landscape-proportioned photo — a 4x6-style horizontal card, one shot. */
export const singleLandscape: LayoutDef = {
  id: "single-landscape",
  label: "Single Landscape",
  tagline: "1 wide photo",
  photoCount: 1,
  computeLayout(theme) {
    const { outerPad, bottomPad } = theme.strip;
    const cellW = PHOTO_WIDTH * 1.3;
    const cellH = cellW * 0.66;
    const canvasW = outerPad * 2 + cellW;
    const canvasH = outerPad + cellH + bottomPad;
    return { canvasW, canvasH, boxes: [{ left: outerPad, top: outerPad, width: cellW, height: cellH }] };
  },
};
