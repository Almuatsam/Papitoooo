import type { ThemeDef } from "@/lib/themes/types";

export interface ResolvedPads {
  leftPad: number;
  rightPad: number;
  topPad: number;
}

/**
 * Left, right and top margins of a theme's strip. Each falls back to
 * `outerPad` when the theme does not set it, so themes without the optional
 * fields lay out exactly as they did when `outerPad` was the only margin.
 */
export function resolvePads(strip: ThemeDef["strip"]): ResolvedPads {
  const { outerPad } = strip;
  return {
    leftPad: strip.leftPad ?? outerPad,
    rightPad: strip.rightPad ?? outerPad,
    topPad: strip.topPad ?? outerPad,
  };
}
