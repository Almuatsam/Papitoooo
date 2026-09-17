import { PHOTO_HEIGHT, PHOTO_WIDTH } from "@/lib/constants";
import type { LayoutDef } from "@/lib/layouts/types";

/** 2 columns x 3 rows. Cell size halves the column width and keeps the same aspect ratio as every other layout's photo cell. */
export const grid6: LayoutDef = {
  id: "grid-6",
  label: "Grid Strip",
  tagline: "6-photo grid, 2x3",
  photoCount: 6,
  computeLayout(theme) {
    const { outerPad, gap, bottomPad } = theme.strip;
    const cellW = (PHOTO_WIDTH - gap) / 2;
    const cellH = cellW * (PHOTO_HEIGHT / PHOTO_WIDTH);
    const canvasW = outerPad * 2 + cellW * 2 + gap;
    const canvasH = outerPad + cellH * 3 + gap * 2 + bottomPad;
    const boxes = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 2; col++) {
        boxes.push({
          left: outerPad + col * (cellW + gap),
          top: outerPad + row * (cellH + gap),
          width: cellW,
          height: cellH,
        });
      }
    }
    return { canvasW, canvasH, boxes };
  },
};
