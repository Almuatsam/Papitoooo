import { PHOTO_HEIGHT, PHOTO_WIDTH } from "@/lib/constants";
import type { LayoutDef } from "@/lib/layouts/types";
import { resolvePads } from "@/lib/layouts/pads";

/** One vertical column of 3 photos — the same column formula as strip-4, one shot fewer. */
export const strip3: LayoutDef = {
  id: "strip-3",
  label: "Short Strip",
  tagline: "3-photo vertical strip",
  photoCount: 3,
  computeLayout(theme) {
    const { gap, bottomPad } = theme.strip;
    const { leftPad, rightPad, topPad } = resolvePads(theme.strip);
    const photoW = PHOTO_WIDTH;
    const photoH = PHOTO_HEIGHT;
    const canvasW = photoW + leftPad + rightPad;
    const canvasH = topPad + 3 * photoH + 2 * gap + bottomPad;
    const boxes = Array.from({ length: 3 }, (_, i) => ({
      left: leftPad,
      top: topPad + i * (photoH + gap),
      width: photoW,
      height: photoH,
    }));
    return { canvasW, canvasH, boxes };
  },
};
