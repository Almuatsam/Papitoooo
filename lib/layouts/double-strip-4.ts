import type { LayoutDef } from "@/lib/layouts/types";
import { strip4 } from "@/lib/layouts/strip-4";

/**
 * Two copies of the classic 4-photo strip side by side — "people keep one,
 * give one away." The box arrangement is identical to strip-4 (this reuses
 * it directly); the actual duplication happens as a raster-level
 * postprocessing step in lib/strip-renderer.ts once the single strip is
 * fully composited (photos + pieces + stickers + caption), not here.
 */
export const doubleStrip4: LayoutDef = {
  id: "double-strip-4",
  label: "Double Print",
  tagline: "Two 4-photo strips, side by side",
  photoCount: 4,
  computeLayout(theme) {
    return strip4.computeLayout(theme);
  },
};
