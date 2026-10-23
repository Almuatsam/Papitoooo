import type { LayoutId, StripThemeId } from "@/types";
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

/** Physical print size a template is authored for (pixels are 300 dpi: 1200x1800 = 4x6). */
export type PrintSize = "4x6" | "6x4" | "2x6";

/** Where a template draws its date: a text box centred on (cx, cy), in template px. */
export interface TemplateDateBox {
  cx: number;
  cy: number;
  maxWidth: number;
  fontSize: number;
}

/**
 * A layout that is fixed artwork owned by a single theme instead of a pure
 * function of theme spacing. The renderer paints `image`, then drops the
 * photos into the layout's `boxes` (measured from the artwork's grey slots),
 * then the date. Only shown/used while `themeId` is the active theme.
 */
export interface LayoutTemplate {
  themeId: StripThemeId;
  /** Public URL of the artwork; its natural size equals the layout's canvas size. */
  image: string;
  printSize: PrintSize;
  /** For each box, the index of the captured frame it shows (double prints repeat the same shot in both copies). */
  slotFrames: readonly number[];
  /** Empty = no date on this layout (the art has no clear band for one). */
  dateBoxes: TemplateDateBox[];
}

export interface LayoutDef {
  id: LayoutId;
  label: string;
  tagline: string;
  photoCount: number;
  /** Arrangement is a pure function of the theme's own spacing tokens (outerPad/gap/bottomPad) — layout and theme stay independent axes. */
  computeLayout(theme: ThemeDef): LayoutResult;
  /** Set on template layouts only, see {@link LayoutTemplate}. Absent on every standard layout. */
  template?: LayoutTemplate;
}
