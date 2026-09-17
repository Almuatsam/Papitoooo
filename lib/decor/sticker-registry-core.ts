/**
 * Shared registry primitives for the sticker library, which is split across
 * lib/decor/stickers.tsx, lib/decor/sticker-library-b.tsx, and
 * lib/decor/sticker-library-c.tsx (one dedicated pack per theme, split
 * purely to keep each file under budget). All three import from here
 * rather than from each other, so there's no cycle.
 *
 * Each theme owns exactly one sticker pack — "no shared generic sticker
 * drawer across themes" — so a collection *is* a theme; there's no
 * separate tab list to maintain.
 */

import { heartPath, outlined, starPath, wrap } from "@/lib/decor/sticker-shapes";
import { chromeFinish, paperCutoutFinish, plasticFinish, puffyFinish } from "@/lib/decor/sticker-materials";
import { seedFrom } from "@/lib/decor/strip-pieces";
import type { StripThemeId } from "@/types";

export type StickerCollectionId = StripThemeId;

export interface StickerDef {
  id: string;
  collection: StickerCollectionId;
  label: string;
  svg: string;
}

let uid = 0;
export function nextId(prefix: string): string {
  uid += 1;
  return `${prefix}-${uid}`;
}

// Hand-cut irregularity is seeded from the sticker's own (stable) id, so
// every call site stays simple while every heart/star still gets a
// deterministic, non-perfect shape.
export function heartSticker(
  id: string,
  collection: StickerCollectionId,
  label: string,
  fill: string,
  finish: "puffy" | "plastic" | "paper" | "hand-drawn" = "hand-drawn",
): StickerDef {
  const d = heartPath(32, 34, 22, seedFrom(id));
  let inner: string;
  if (finish === "puffy") inner = puffyFinish(d, fill, seedFrom(id, "finish"));
  else if (finish === "plastic") inner = plasticFinish(d, fill, seedFrom(id, "finish"));
  else if (finish === "paper") inner = paperCutoutFinish(d, fill, seedFrom(id, "finish"));
  else inner = outlined(`<path d="${d}" fill="${fill}"/>`);
  return { id, collection, label, svg: wrap(inner) };
}

export function starSticker(
  id: string,
  collection: StickerCollectionId,
  label: string,
  fill: string,
  finish: "chrome" | "paper" | "hand-drawn" = "hand-drawn",
  points = 5,
): StickerDef {
  const d = starPath(32, 32, 26, 11, points, seedFrom(id));
  let inner: string;
  if (finish === "chrome") inner = chromeFinish(d, seedFrom(id, "finish"));
  else if (finish === "paper") inner = paperCutoutFinish(d, fill, seedFrom(id, "finish"));
  else inner = outlined(`<path d="${d}" fill="${fill}"/>`);
  return { id, collection, label, svg: wrap(inner) };
}

export const PINK = "#ff2f92";
export const RED = "#e2231a";
export const YELLOW = "#ffd400";
export const BLUE = "#6ec3ff";
export const BABY_BLUE = "#a8d8ff";
export const ORANGE = "#ff6a13";
export const SILVER = "#c8ccd0";
export const CREAM = "#fbf3e3";
export const GOLD = "#d8a93a";
export const WHITE = "#ffffff";
export const INK = "#101014";
export const NAVY = "#0a1f44";
