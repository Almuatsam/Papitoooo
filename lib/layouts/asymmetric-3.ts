import { PHOTO_HEIGHT, PHOTO_WIDTH } from "@/lib/constants";
import type { LayoutDef } from "@/lib/layouts/types";
import { resolvePads } from "@/lib/layouts/pads";

/** One large block on top, two smaller photos side by side beneath it. Hand-tuned proportions, not a formula — "uneven" is inherently authored. */
export const asymmetric3: LayoutDef = {
  id: "asymmetric-3",
  label: "Big + Two",
  tagline: "1 large + 2 small photos",
  photoCount: 3,
  computeLayout(theme) {
    const { gap, bottomPad } = theme.strip;
    const { leftPad, rightPad, topPad } = resolvePads(theme.strip);
    const bigW = PHOTO_WIDTH;
    const bigH = PHOTO_HEIGHT * 1.3;
    const smallW = (PHOTO_WIDTH - gap) / 2;
    const smallH = PHOTO_HEIGHT * 0.75;
    const canvasW = leftPad + rightPad + PHOTO_WIDTH;
    const canvasH = topPad + bigH + gap + smallH + bottomPad;
    const smallTop = topPad + bigH + gap;
    const boxes = [
      { left: leftPad, top: topPad, width: bigW, height: bigH },
      { left: leftPad, top: smallTop, width: smallW, height: smallH },
      { left: leftPad + smallW + gap, top: smallTop, width: smallW, height: smallH },
    ];
    return { canvasW, canvasH, boxes };
  },
};
