import { PHOTO_WIDTH } from "@/lib/constants";
import type { LayoutDef } from "@/lib/layouts/types";
import { resolvePads } from "@/lib/layouts/pads";

/** A single wide landscape-proportioned photo — a 4x6-style horizontal card, one shot. */
export const singleLandscape: LayoutDef = {
  id: "single-landscape",
  label: "Single Landscape",
  tagline: "1 wide photo",
  photoCount: 1,
  computeLayout(theme) {
    const { bottomPad } = theme.strip;
    const { leftPad, rightPad, topPad } = resolvePads(theme.strip);
    const cellW = PHOTO_WIDTH * 1.3;
    const cellH = cellW * 0.66;
    const canvasW = leftPad + rightPad + cellW;
    const canvasH = topPad + cellH + bottomPad;
    return { canvasW, canvasH, boxes: [{ left: leftPad, top: topPad, width: cellW, height: cellH }] };
  },
};
