import { PHOTO_WIDTH } from "@/lib/constants";
import type { LayoutDef } from "@/lib/layouts/types";
import { resolvePads } from "@/lib/layouts/pads";

/** 3 stacked wide (panoramic) photos — same column arrangement as strip-3, but each cell is wider/shorter than the default 4:3 cell. */
export const tripleHorizontal: LayoutDef = {
  id: "triple-horizontal",
  label: "Triple Wide",
  tagline: "3 stacked wide photos",
  photoCount: 3,
  computeLayout(theme) {
    const { gap, bottomPad } = theme.strip;
    const { leftPad, rightPad, topPad } = resolvePads(theme.strip);
    const cellW = PHOTO_WIDTH * 1.15;
    const cellH = cellW * 0.45;
    const canvasW = leftPad + rightPad + cellW;
    const canvasH = topPad + 3 * cellH + 2 * gap + bottomPad;
    const boxes = Array.from({ length: 3 }, (_, i) => ({
      left: leftPad,
      top: topPad + i * (cellH + gap),
      width: cellW,
      height: cellH,
    }));
    return { canvasW, canvasH, boxes };
  },
};
