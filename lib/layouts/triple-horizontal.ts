import { PHOTO_WIDTH } from "@/lib/constants";
import type { LayoutDef } from "@/lib/layouts/types";

/** 3 stacked wide (panoramic) photos — same column arrangement as strip-3, but each cell is wider/shorter than the default 4:3 cell. */
export const tripleHorizontal: LayoutDef = {
  id: "triple-horizontal",
  label: "Triple Wide",
  tagline: "3 stacked wide photos",
  photoCount: 3,
  computeLayout(theme) {
    const { outerPad, gap, bottomPad } = theme.strip;
    const cellW = PHOTO_WIDTH * 1.15;
    const cellH = cellW * 0.45;
    const canvasW = outerPad * 2 + cellW;
    const canvasH = outerPad + 3 * cellH + 2 * gap + bottomPad;
    const boxes = Array.from({ length: 3 }, (_, i) => ({
      left: outerPad,
      top: outerPad + i * (cellH + gap),
      width: cellW,
      height: cellH,
    }));
    return { canvasW, canvasH, boxes };
  },
};
