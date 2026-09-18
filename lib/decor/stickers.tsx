/**
 * Curated sticker packs, one per theme — "no shared generic sticker drawer
 * across themes." Each is a small, self-contained SVG string (portable —
 * works as `<img src="data:image/svg+xml,...">` in the tray, and
 * rasterises the same way when baked into the strip export). Split across
 * this file (Streaming Card, Arcade Corkboard) and
 * lib/decor/sticker-library-b.tsx / -c.tsx purely to keep each file under
 * a reasonable line budget — see lib/decor/sticker-registry-core.ts for
 * the shared bits (StickerDef, nextId, colour constants, heartSticker).
 */

import { flowerPetalsSvg, heartPath, wrap } from "@/lib/decor/sticker-shapes";
import { chromeFinish, plasticFinish } from "@/lib/decor/sticker-materials";
import { seedFrom } from "@/lib/decor/strip-pieces";
import { STICKERS_B } from "@/lib/decor/sticker-library-b";
import { STICKERS_C } from "@/lib/decor/sticker-library-c";
import { INK, nextId, type StickerCollectionId, type StickerDef } from "@/lib/decor/sticker-registry-core";

export type { StickerCollectionId, StickerDef };

const NEAR_BLACK = "#2f2f33";
const CYAN = "#00e5ff";
const MAGENTA = "#ff2fd6";

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

  // ---- Arcade Corkboard: original pixel sprites, neon plastic ------------
  {
    id: nextId("arcade-corkboard"),
    collection: "arcade-corkboard",
    label: "Pixel critter",
    svg: wrap(
      plasticFinish(`M14 50 V28 a18 18 0 0 1 36 0 V50 l-6 -6 -6 6 -6 -6 -6 6 -6 -6 Z`, MAGENTA, seedFrom("ac-ghost")) +
        `<circle cx="24" cy="28" r="3" fill="#fff"/><circle cx="40" cy="28" r="3" fill="#fff"/>`,
    ),
  },
  {
    id: nextId("arcade-corkboard"),
    collection: "arcade-corkboard",
    label: "Pixel spark",
    svg: wrap(
      `<rect x="28" y="8" width="8" height="8" fill="${CYAN}"/><rect x="28" y="48" width="8" height="8" fill="${CYAN}"/>` +
        `<rect x="8" y="28" width="8" height="8" fill="${CYAN}"/><rect x="48" y="28" width="8" height="8" fill="${CYAN}"/>` +
        `<rect x="28" y="28" width="8" height="8" fill="${CYAN}"/>`,
    ),
  },
  {
    id: nextId("arcade-corkboard"),
    collection: "arcade-corkboard",
    label: "Spiderweb",
    svg: wrap(
      `<g stroke="${CYAN}" stroke-width="1.5" fill="none">${Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 6;
        return `<line x1="32" y1="32" x2="${(32 + Math.cos(a) * 26).toFixed(1)}" y2="${(32 + Math.sin(a) * 26).toFixed(1)}"/>`;
      }).join("")}${[10, 17, 24].map((r) => `<circle cx="32" cy="32" r="${r}"/>`).join("")}</g>`,
    ),
  },
  {
    id: nextId("arcade-corkboard"),
    collection: "arcade-corkboard",
    label: "Wobbly flower",
    svg: wrap(`<g stroke="${INK}" stroke-width="1" stroke-linejoin="round">${flowerPetalsSvg(32, 32, 50, MAGENTA, seedFrom("ac-flower"))}</g>`),
  },
  {
    id: nextId("arcade-corkboard"),
    collection: "arcade-corkboard",
    label: "Push-pin",
    svg: wrap(
      `<ellipse cx="34" cy="38" rx="8" ry="4" fill="rgba(0,0,0,0.25)"/><line x1="32" y1="30" x2="32" y2="52" stroke="#8a8a92" stroke-width="2"/>` +
        `<circle cx="32" cy="26" r="10" fill="${CYAN}"/><ellipse cx="28" cy="22" rx="3" ry="1.6" fill="#fff" opacity="0.6"/>`,
    ),
  },
  {
    id: nextId("arcade-corkboard"),
    collection: "arcade-corkboard",
    label: "Neon diamond",
    svg: wrap(chromeFinish(`M32 8 L52 32 L32 56 L12 32 Z`, seedFrom("ac-diamond"))),
  },
  {
    id: nextId("arcade-corkboard"),
    collection: "arcade-corkboard",
    label: "8-bit heart",
    svg: wrap(
      [
        [16, 16],
        [40, 16],
        [8, 24],
        [24, 24],
        [40, 24],
        [56, 24],
        [8, 32],
        [16, 32],
        [24, 32],
        [32, 32],
        [40, 32],
        [48, 32],
        [16, 40],
        [24, 40],
        [32, 40],
        [40, 40],
        [24, 48],
        [32, 48],
      ]
        .map(([x, y]) => `<rect x="${x}" y="${y}" width="8" height="8" fill="${MAGENTA}"/>`)
        .join(""),
    ),
  },
  {
    id: nextId("arcade-corkboard"),
    collection: "arcade-corkboard",
    label: "Joystick",
    svg: wrap(
      `<rect x="20" y="40" width="24" height="14" rx="2" fill="${INK}"/><circle cx="32" cy="24" r="10" fill="${CYAN}"/><rect x="29" y="24" width="6" height="20" fill="#8a8a92"/>`,
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
