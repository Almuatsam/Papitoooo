import { PHOTO_HEIGHT, PHOTO_WIDTH } from "@/lib/constants";
import type { LayoutDef } from "@/lib/layouts/types";

/** Today's default shape: one vertical column of 4 photos. Must reproduce the exact geometry that shipped before layout existed as a concept — the "no regression" case. */
export const strip4: LayoutDef = {
  id: "strip-4",
  label: "Classic Strip",
  tagline: "4-photo vertical strip",
  photoCount: 4,
  computeLayout(theme) {
    const { outerPad, gap, bottomPad } = theme.strip;
    const photoW = PHOTO_WIDTH;
    const photoH = PHOTO_HEIGHT;
    const canvasW = photoW + outerPad * 2;
    const canvasH = outerPad + 4 * photoH + 3 * gap + bottomPad;
    const boxes = Array.from({ length: 4 }, (_, i) => ({
      left: outerPad,
      top: outerPad + i * (photoH + gap),
      width: photoW,
      height: photoH,
    }));
    return { canvasW, canvasH, boxes };
  },
};
