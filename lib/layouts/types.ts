import type { LayoutId } from "@/types";
import type { ThemeDef } from "@/lib/themes";

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface LayoutResult {
  canvasW: number;
  canvasH: number;
  boxes: Box[];
}

export interface LayoutDef {
  id: LayoutId;
  label: string;
  tagline: string;
  photoCount: number;
  /** Arrangement is a pure function of the theme's own spacing tokens (outerPad/gap/bottomPad) — layout and theme stay independent axes. */
  computeLayout(theme: ThemeDef): LayoutResult;
}
