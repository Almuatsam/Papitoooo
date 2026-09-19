/**
 * A theme pack split out of lib/decor/stickers.tsx purely to keep each
 * file under a reasonable line budget. Same registry, same materials; see
 * lib/decor/sticker-registry-core.ts for the shared bits.
 */

import { starPath, wrap } from "@/lib/decor/sticker-shapes";
import { plasticFinish } from "@/lib/decor/sticker-materials";
import { seedFrom } from "@/lib/decor/strip-pieces";
import { INK, WHITE, nextId, type StickerDef } from "@/lib/decor/sticker-registry-core";

const OFF_WHITE = "#f7f4ec";

export const STICKERS_C: StickerDef[] = [
  // ---- Receipt: thermal-paper world --------------------------------------
  {
    id: nextId("receipt"),
    collection: "receipt",
    label: "Mini receipt",
    svg: wrap(
      `<rect x="10" y="4" width="44" height="56" fill="${OFF_WHITE}" stroke="${INK}" stroke-width="1.5"/>` +
        `<line x1="16" y1="14" x2="48" y2="14" stroke="${INK}" stroke-width="1.2" stroke-dasharray="2 2"/>` +
        `<line x1="16" y1="24" x2="48" y2="24" stroke="${INK}" stroke-width="1" opacity="0.6"/>` +
        `<line x1="16" y1="32" x2="48" y2="32" stroke="${INK}" stroke-width="1" opacity="0.6"/>` +
        `<line x1="16" y1="40" x2="48" y2="40" stroke="${INK}" stroke-width="1" opacity="0.6"/>` +
        `<line x1="16" y1="50" x2="48" y2="50" stroke="${INK}" stroke-width="1.2" stroke-dasharray="2 2"/>`,
    ),
  },
  {
    id: nextId("receipt"),
    collection: "receipt",
    label: "Barcode sticker",
    svg: wrap(
      `<rect x="4" y="20" width="56" height="24" fill="${WHITE}" stroke="${INK}" stroke-width="1"/>` +
        Array.from({ length: 16 }, (_, i) => {
          const seed = seedFrom("receipt-barcode-sticker", i);
          const w = 1 + (seed % 3);
          return `<rect x="${7 + i * 3.2}" y="24" width="${w}" height="16" fill="${INK}"/>`;
        }).join(""),
    ),
  },
  {
    id: nextId("receipt"),
    collection: "receipt",
    label: "Price tag",
    svg: wrap(
      `<path d="M8 32 L28 12 h20 v20 L28 52 Z" fill="${WHITE}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` +
        `<circle cx="40" cy="20" r="4" fill="none" stroke="${INK}" stroke-width="2"/>`,
    ),
  },
  {
    id: nextId("receipt"),
    collection: "receipt",
    label: "Star rating",
    svg: wrap(
      [0, 1, 2].map((i) => `<path d="${starPath(16 + i * 16, 32, 8, 3.4, 5, seedFrom("receipt-star", i))}" fill="${INK}"/>`).join(""),
    ),
  },
  {
    id: nextId("receipt"),
    collection: "receipt",
    label: "Shopping bag",
    svg: wrap(
      plasticFinish(`M14 22 h36 l-4 34 h-28 Z`, OFF_WHITE, seedFrom("receipt-bag")) +
        `<path d="M24 22 v-6 a8 8 0 0 1 16 0 v6" fill="none" stroke="${INK}" stroke-width="2"/>`,
    ),
  },
  {
    id: nextId("receipt"),
    collection: "receipt",
    label: "PAID stamp",
    svg: wrap(
      `<g transform="rotate(-10 32 32)"><rect x="10" y="22" width="44" height="20" fill="none" stroke="${INK}" stroke-width="2.4"/>` +
        `<text x="32" y="36" font-size="12" text-anchor="middle" font-family="Georgia, serif" font-weight="900" fill="${INK}">PAID</text></g>`,
    ),
  },
];
