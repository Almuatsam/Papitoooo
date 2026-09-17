import { PHOTO_HEIGHT, PHOTO_WIDTH } from "@/lib/constants";
import type { LayoutDef } from "@/lib/layouts/types";

/** One large block on top, two smaller photos side by side beneath it. Hand-tuned proportions, not a formula — "uneven" is inherently authored. */
export const asymmetric3: LayoutDef = {
  id: "asymmetric-3",
  label: "Big + Two",
  tagline: "1 large + 2 small photos",
  photoCount: 3,
  computeLayout(theme) {
    const { outerPad, gap, bottomPad } = theme.strip;
    const bigW = PHOTO_WIDTH;
    const bigH = PHOTO_HEIGHT * 1.3;
    const smallW = (PHOTO_WIDTH - gap) / 2;
    const smallH = PHOTO_HEIGHT * 0.75;
    const canvasW = outerPad * 2 + PHOTO_WIDTH;
    const canvasH = outerPad + bigH + gap + smallH + bottomPad;
    const smallTop = outerPad + bigH + gap;
    const boxes = [
      { left: outerPad, top: outerPad, width: bigW, height: bigH },
      { left: outerPad, top: smallTop, width: smallW, height: smallH },
      { left: outerPad + smallW + gap, top: smallTop, width: smallW, height: smallH },
    ];
    return { canvasW, canvasH, boxes };
  },
};
