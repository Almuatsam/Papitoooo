import { PHOTO_HEIGHT, PHOTO_WIDTH } from "@/lib/constants";
import type { LayoutDef } from "@/lib/layouts/types";
import { resolvePads } from "@/lib/layouts/pads";

/** 2 columns x 3 rows. Cell size halves the column width and keeps the same aspect ratio as every other layout's photo cell. */
export const grid6: LayoutDef = {
  id: "grid-6",
  label: "Grid Strip",
  tagline: "6-photo grid, 2x3",
  photoCount: 6,
  computeLayout(theme) {
    const { gap, bottomPad } = theme.strip;
    const { leftPad, rightPad, topPad } = resolvePads(theme.strip);
    const cellW = (PHOTO_WIDTH - gap) / 2;
    const cellH = cellW * (PHOTO_HEIGHT / PHOTO_WIDTH);
    const canvasW = leftPad + rightPad + cellW * 2 + gap;
    const canvasH = topPad + cellH * 3 + gap * 2 + bottomPad;
    const boxes = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 2; col++) {
        boxes.push({
          left: leftPad + col * (cellW + gap),
          top: topPad + row * (cellH + gap),
          width: cellW,
          height: cellH,
        });
      }
    }
    return { canvasW, canvasH, boxes };
  },
};
