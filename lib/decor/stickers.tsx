/**
 * Curated sticker packs, one per theme — "no shared generic sticker drawer
 * across themes." Each is a small, self-contained SVG string (portable —
 * works as `<img src="data:image/svg+xml,...">` in the tray, and
 * rasterises the same way when baked into the strip export). Split across
 * this file (Streaming Card) and
 * lib/decor/sticker-library-b.tsx / -c.tsx purely to keep each file under
 * a reasonable line budget — see lib/decor/sticker-registry-core.ts for
 * the shared bits (StickerDef, nextId, colour constants, heartSticker).
 */

import { heartPath, wrap } from "@/lib/decor/sticker-shapes";
import { STICKERS_B } from "@/lib/decor/sticker-library-b";
import { STICKERS_C } from "@/lib/decor/sticker-library-c";
import { nextId, type StickerCollectionId, type StickerDef } from "@/lib/decor/sticker-registry-core";

export type { StickerCollectionId, StickerDef };

const NEAR_BLACK = "#2f2f33";

export const STICKERS: StickerDef[] = [
  // ---- Streaming Card: flat minimal glyphs, no gloss/shadow --------------
  {
    id: nextId("streaming-card"),
    collection: "streaming-card",
    label: "Play",
    svg: wrap(
      `<circle cx="32" cy="32" r="26" fill="none" stroke="${NEAR_BLACK}" stroke-width="2.5"/><path d="M26 20 L46 32 L26 44 Z" fill="${NEAR_BLACK}"/>`,
    ),
  },
  {
    id: nextId("streaming-card"),
    collection: "streaming-card",
    label: "Heart outline",
    svg: wrap(`<path d="${heartPath(32, 34, 20)}" fill="none" stroke="${NEAR_BLACK}" stroke-width="2.5"/>`),
  },
  {
    id: nextId("streaming-card"),
    collection: "streaming-card",
    label: "Music note",
    svg: wrap(`<path d="M40 10 v30 a8 8 0 1 1 -4 -7 V18 l-14 4 v22 a8 8 0 1 1 -4 -7 V16 Z" fill="${NEAR_BLACK}"/>`),
  },
  {
    id: nextId("streaming-card"),
    collection: "streaming-card",
    label: "Skip forward",
    svg: wrap(`<path d="M20 18 L40 32 L20 46 Z" fill="${NEAR_BLACK}"/><rect x="42" y="18" width="4" height="28" fill="${NEAR_BLACK}"/>`),
  },
  {
    id: nextId("streaming-card"),
    collection: "streaming-card",
    label: "Volume bars",
    svg: wrap(
      Array.from({ length: 4 }, (_, i) => `<rect x="${14 + i * 10}" y="${44 - (i + 1) * 8}" width="6" height="${(i + 1) * 8}" fill="${NEAR_BLACK}"/>`).join(""),
    ),
  },
  {
    id: nextId("streaming-card"),
    collection: "streaming-card",
    label: "Repeat",
    svg: wrap(
      `<path d="M16 24 a16 16 0 0 1 16 -8 h16 M48 24 l-6 -6 M48 24 l-6 6" fill="none" stroke="${NEAR_BLACK}" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M48 40 a16 16 0 0 1 -16 8 h-16 M16 40 l6 -6 M16 40 l6 6" fill="none" stroke="${NEAR_BLACK}" stroke-width="3" stroke-linecap="round"/>`,
    ),
  },

  ...STICKERS_B,
  ...STICKERS_C,
];

export function stickersByCollection(id: StickerCollectionId): StickerDef[] {
  return STICKERS.filter((s) => s.collection === id);
}

/** SVG markup -> data URL, for <img> tags and Fabric image sources. */
export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
