import type { LayoutId, StripThemeId } from "@/types";
import type { LayoutDef } from "@/lib/layouts/types";
import { strip3 } from "@/lib/layouts/strip-3";
import { strip4 } from "@/lib/layouts/strip-4";
import { grid6 } from "@/lib/layouts/grid-6";
import { singlePortrait } from "@/lib/layouts/single-portrait";
import { singleLandscape } from "@/lib/layouts/single-landscape";
import { tripleHorizontal } from "@/lib/layouts/triple-horizontal";
import { asymmetric3 } from "@/lib/layouts/asymmetric-3";
import { asymmetric4 } from "@/lib/layouts/asymmetric-4";
import { doubleStrip4 } from "@/lib/layouts/double-strip-4";
import { HALLOWEEN_LAYOUTS } from "@/lib/layouts/templates/halloween";

export type { Box, LayoutDef, LayoutResult, LayoutTemplate, PrintSize, TemplateDateBox } from "@/lib/layouts/types";

/** The nine theme-independent layouts, usable with every theme. */
export const LAYOUTS: LayoutDef[] = [
  strip3,
  strip4,
  grid6,
  singlePortrait,
  singleLandscape,
  tripleHorizontal,
  asymmetric3,
  asymmetric4,
  doubleStrip4,
];

/** Fixed-artwork layouts, each owned by one theme (see LayoutDef.template). */
export const TEMPLATE_LAYOUTS: LayoutDef[] = [...HALLOWEEN_LAYOUTS];

const LAYOUT_MAP: Record<LayoutId, LayoutDef> = [...LAYOUTS, ...TEMPLATE_LAYOUTS].reduce(
  (acc, l) => {
    acc[l.id] = l;
    return acc;
  },
  {} as Record<LayoutId, LayoutDef>,
);

export function getLayout(id: LayoutId): LayoutDef {
  return LAYOUT_MAP[id] ?? LAYOUTS[1];
}

/**
 * The layouts a theme can offer: a template-owning theme offers only its own
 * templates (the standard layouts would render without its artwork); every
 * other theme offers the nine standard layouts.
 */
export function layoutsForTheme(themeId: StripThemeId): LayoutDef[] {
  const owned = TEMPLATE_LAYOUTS.filter((l) => l.template?.themeId === themeId);
  return owned.length > 0 ? owned : LAYOUTS;
}

/**
 * Keeps theme and layout compatible when either changes. Returns `layoutId`
 * untouched when the theme offers it; otherwise the first of the theme's
 * layouts with the same photo count (so an in-progress result keeps its
 * frames), falling back to the closest count.
 */
export function reconcileLayout(themeId: StripThemeId, layoutId: LayoutId): LayoutId {
  const available = layoutsForTheme(themeId);
  if (available.some((l) => l.id === layoutId)) return layoutId;
  const wanted = getLayout(layoutId).photoCount;
  const closest = available.reduce((best, l) =>
    Math.abs(l.photoCount - wanted) < Math.abs(best.photoCount - wanted) ? l : best,
  );
  return closest.id;
}
