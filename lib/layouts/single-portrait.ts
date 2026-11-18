import { PHOTO_WIDTH } from "@/lib/constants";
import type { LayoutDef } from "@/lib/layouts/types";
import { resolvePads } from "@/lib/layouts/pads";

/** A single tall portrait-proportioned photo — a 4x6-style vertical card, one shot. */
export const singlePortrait: LayoutDef = {
  id: "single-portrait",
  label: "Single Portrait",
  tagline: "1 tall photo",
  photoCount: 1,
  computeLayout(theme) {
    const { bottomPad } = theme.strip;
    const { leftPad, rightPad, topPad } = resolvePads(theme.strip);
    const cellW = PHOTO_WIDTH * 0.85;
    const cellH = cellW * 1.5;
    const canvasW = leftPad + rightPad + cellW;
    const canvasH = topPad + cellH + bottomPad;
    return { canvasW, canvasH, boxes: [{ left: leftPad, top: topPad, width: cellW, height: cellH }] };
  },
};
