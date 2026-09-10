import type { FilterId } from "@/types";

/**
 * Photo filters. The reference project had none — these are new.
 *
 * A filter is a single CSS `filter` string. The same string drives the live
 * `<video>` preview (inline style) and the exported strip (Canvas 2D
 * `ctx.filter` while each photo is drawn), so what you preview is exactly what
 * you download. Every one of the four photos carries the filter — it is baked
 * into the pixels, not laid over the finished strip.
 */
export interface FilterDef {
  id: FilterId;
  label: string;
  css: string;
}

export const FILTERS: FilterDef[] = [
  { id: "natural", label: "Natural", css: "none" },
  {
    id: "vintage",
    label: "Vintage",
    css: "sepia(0.38) contrast(1.05) saturate(0.82) brightness(1.03)",
  },
  { id: "bw", label: "B&W", css: "grayscale(1) contrast(1.12) brightness(1.02)" },
  {
    id: "warm",
    label: "Warm",
    css: "sepia(0.22) saturate(1.32) hue-rotate(-12deg) brightness(1.05)",
  },
  {
    id: "cool",
    label: "Cool",
    css: "saturate(1.12) hue-rotate(16deg) brightness(1.02) contrast(1.06)",
  },
  {
    id: "film",
    label: "Film",
    css: "contrast(1.16) saturate(1.08) sepia(0.16) brightness(0.98)",
  },
  {
    id: "retro",
    label: "Retro",
    css: "sepia(0.5) contrast(0.92) saturate(1.45) hue-rotate(-16deg)",
  },
  {
    id: "soft",
    label: "Soft",
    css: "contrast(0.9) brightness(1.09) saturate(0.94) blur(0.4px)",
  },
  { id: "contrast", label: "High contrast", css: "contrast(1.42) saturate(1.16)" },
];

const FILTER_MAP: Record<FilterId, FilterDef> = FILTERS.reduce(
  (acc, f) => {
    acc[f.id] = f;
    return acc;
  },
  {} as Record<FilterId, FilterDef>,
);

export function getFilter(id: FilterId): FilterDef {
  return FILTER_MAP[id] ?? FILTERS[0];
}

/** CSS `filter` value for a given filter id, safe for inline styles and ctx.filter. */
export function filterCss(id: FilterId): string {
  return getFilter(id).css;
}
