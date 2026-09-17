import { PHOTO_HEIGHT, PHOTO_WIDTH } from "@/lib/constants";
import type { LayoutDef } from "@/lib/layouts/types";

/** A tall block on the left, three smaller photos stacked on the right — an uneven grid mix. Hand-tuned proportions, not a formula. */
export const asymmetric4: LayoutDef = {
  id: "asymmetric-4",
  label: "Uneven Grid",
  tagline: "1 large + 3 small photos",
  photoCount: 4,
  computeLayout(theme) {
    const { outerPad, gap, bottomPad } = theme.strip;
    const bigW = PHOTO_WIDTH * 0.55;
    const rightW = PHOTO_WIDTH * 0.4;
    const smallH = PHOTO_HEIGHT * 0.55;
    const bigH = smallH * 3 + gap * 2;
    const canvasW = outerPad * 2 + bigW + gap + rightW;
    const canvasH = outerPad + bigH + bottomPad;
    const rightLeft = outerPad + bigW + gap;
    const boxes = [
      { left: outerPad, top: outerPad, width: bigW, height: bigH },
      { left: rightLeft, top: outerPad, width: rightW, height: smallH },
      { left: rightLeft, top: outerPad + smallH + gap, width: rightW, height: smallH },
      { left: rightLeft, top: outerPad + (smallH + gap) * 2, width: rightW, height: smallH },
    ];
    return { canvasW, canvasH, boxes };
  },
};
