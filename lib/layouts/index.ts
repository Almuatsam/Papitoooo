import type { LayoutId } from "@/types";
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

export type { Box, LayoutDef, LayoutResult } from "@/lib/layouts/types";

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

const LAYOUT_MAP: Record<LayoutId, LayoutDef> = LAYOUTS.reduce(
  (acc, l) => {
    acc[l.id] = l;
    return acc;
  },
  {} as Record<LayoutId, LayoutDef>,
);

export function getLayout(id: LayoutId): LayoutDef {
  return LAYOUT_MAP[id] ?? LAYOUTS[1];
}
