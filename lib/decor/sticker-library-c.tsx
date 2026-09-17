/**
 * Two theme packs split out of lib/decor/stickers.tsx purely to keep each
 * file under a reasonable line budget. Same registry, same materials; see
 * lib/decor/sticker-registry-core.ts for the shared bits.
 */

import { gemPolygonPath, starPath, wrap } from "@/lib/decor/sticker-shapes";
import { paperCutoutFinish, plasticFinish } from "@/lib/decor/sticker-materials";
import { seedFrom } from "@/lib/decor/strip-pieces";
import { INK, NAVY, WHITE, nextId, type StickerDef } from "@/lib/decor/sticker-registry-core";

const OFF_WHITE = "#f7f4ec";
const RED = "#c8102e";

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

  // ---- Par Avion: postal world --------------------------------------------
  {
    id: nextId("par-avion"),
    collection: "par-avion",
    label: "Wax seal",
    svg: wrap(
      (() => {
        const pts = Array.from({ length: 10 }, (_, i) => {
          const angle = (Math.PI * 2 * i) / 10;
          const r = 24 * (0.85 + (seedFrom("pa-seal-sticker", i) % 100) / 500);
          return `${32 + Math.cos(angle) * r},${32 + Math.sin(angle) * r}`;
        }).join(" L");
        return `<path d="M${pts} Z" fill="${RED}" stroke="rgba(0,0,0,0.2)" stroke-width="1.5"/>`;
      })(),
    ),
  },
  {
    id: nextId("par-avion"),
    collection: "par-avion",
    label: "Envelope",
    svg: wrap(
      paperCutoutFinish(`M8 14 h48 v36 h-48 Z`, WHITE, seedFrom("pa-envelope")) +
        `<path d="M8 14 L32 36 L56 14" fill="none" stroke="${NAVY}" stroke-width="2"/>`,
    ),
  },
  {
    id: nextId("par-avion"),
    collection: "par-avion",
    label: "Postage stamp",
    svg: wrap(
      `<g>${Array.from({ length: 18 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 18;
        const x = 32 + Math.cos(a) * 28;
        const y = 32 + Math.sin(a) * 28;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="${WHITE}"/>`;
      }).join("")}</g>` +
        paperCutoutFinish(`M10 10 h44 v44 h-44 Z`, RED, seedFrom("pa-stamp")) +
        `<path d="M32 20 L44 40 H20 Z" fill="${WHITE}" opacity="0.85"/>`,
    ),
  },
  {
    id: nextId("par-avion"),
    collection: "par-avion",
    label: "Parcel",
    svg: wrap(
      paperCutoutFinish(`M10 20 h44 v34 h-44 Z`, "#d9c9a3", seedFrom("pa-parcel")) +
        `<line x1="32" y1="20" x2="32" y2="54" stroke="${NAVY}" stroke-width="3"/><line x1="10" y1="36" x2="54" y2="36" stroke="${NAVY}" stroke-width="3"/>`,
    ),
  },
  {
    id: nextId("par-avion"),
    collection: "par-avion",
    label: "Airplane trail",
    svg: wrap(
      `<path d="M8 48 Q 24 30 40 20" fill="none" stroke="${NAVY}" stroke-width="2" stroke-dasharray="4 3"/>` +
        `<path d="M40 20 L48 16 L58 24 L50 26 L52 34 L44 28 Z" fill="${RED}"/>`,
    ),
  },
  {
    id: nextId("par-avion"),
    collection: "par-avion",
    label: "APPROVED sticker",
    svg: wrap(
      `<g transform="rotate(-8 32 32)"><rect x="8" y="22" width="48" height="20" fill="none" stroke="${RED}" stroke-width="2.2"/>` +
        `<text x="32" y="36" font-size="10" text-anchor="middle" font-family="Georgia, serif" font-weight="900" fill="${RED}">APPROVED</text></g>`,
    ),
  },
  {
    id: nextId("par-avion"),
    collection: "par-avion",
    label: "Compass",
    svg: wrap(
      `<circle cx="32" cy="32" r="22" fill="none" stroke="${NAVY}" stroke-width="2"/>` +
        `<path d="${gemPolygonPath(32, 32, 14, seedFrom("pa-compass"))}" fill="${RED}" opacity="0.85"/>` +
        `<circle cx="32" cy="32" r="2.4" fill="${NAVY}"/>`,
    ),
  },
];
