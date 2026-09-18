/**
 * Theme pack split out of lib/decor/stickers.tsx purely to keep each file
 * under a reasonable line budget. Same registry, same materials; see
 * lib/decor/sticker-registry-core.ts for the shared bits.
 */

import { handwrittenNoteShape, wrap } from "@/lib/decor/sticker-shapes";
import { chromeFinish, fabricFinish, paperCutoutFinish, plasticFinish } from "@/lib/decor/sticker-materials";
import { seedFrom } from "@/lib/decor/strip-pieces";
import { NAVY, WHITE, nextId, type StickerDef } from "@/lib/decor/sticker-registry-core";

const GOLD_ACCENT = "#c9a227";

export const STICKERS_B: StickerDef[] = [
  // ---- Boarding Pass: airplane, luggage, stamps, globe -------------------
  {
    id: nextId("boarding-pass"),
    collection: "boarding-pass",
    label: "Airplane",
    svg: wrap(plasticFinish(`M32 6 L38 26 L58 34 L38 36 L34 56 L30 36 L6 34 L26 26 Z`, NAVY, seedFrom("bp-plane"))),
  },
  {
    id: nextId("boarding-pass"),
    collection: "boarding-pass",
    label: "Boarding tag",
    svg: wrap(
      paperCutoutFinish(`M10 10 h32 v30 l-10 14 -10 -14 h-12 Z`, WHITE, seedFrom("bp-tag")) +
        `<circle cx="26" cy="18" r="3" fill="${NAVY}"/><line x1="16" y1="30" x2="46" y2="30" stroke="${NAVY}" stroke-width="1.5"/>`,
    ),
  },
  {
    id: nextId("boarding-pass"),
    collection: "boarding-pass",
    label: "Barcode sticker",
    svg: wrap(
      `<rect x="4" y="18" width="56" height="28" fill="${WHITE}" stroke="${NAVY}" stroke-width="1.5"/>` +
        Array.from({ length: 14 }, (_, i) => {
          const seed = seedFrom("bp-barcode-sticker", i);
          const w = 1 + (seed % 3);
          return `<rect x="${8 + i * 3.6}" y="22" width="${w}" height="20" fill="${NAVY}"/>`;
        }).join(""),
    ),
  },
  {
    id: nextId("boarding-pass"),
    collection: "boarding-pass",
    label: "Suitcase",
    svg: wrap(
      fabricFinish(`M12 24 h40 v26 h-40 Z`, GOLD_ACCENT, seedFrom("bp-suitcase")) +
        `<rect x="24" y="16" width="16" height="10" rx="2" fill="none" stroke="${NAVY}" stroke-width="2"/>`,
    ),
  },
  {
    id: nextId("boarding-pass"),
    collection: "boarding-pass",
    label: "Globe",
    svg: wrap(
      chromeFinish(`M32 6 A26 26 0 1 1 31.9 6 Z`, seedFrom("bp-globe")) +
        `<ellipse cx="32" cy="32" rx="26" ry="12" fill="none" stroke="${NAVY}" stroke-width="1.4"/><line x1="6" y1="32" x2="58" y2="32" stroke="${NAVY}" stroke-width="1.4"/>`,
    ),
  },
  {
    id: nextId("boarding-pass"),
    collection: "boarding-pass",
    label: "Passport stamp",
    svg: wrap(
      `<circle cx="32" cy="32" r="24" fill="none" stroke="${NAVY}" stroke-width="2.5" stroke-dasharray="4 3"/>` +
        `<text x="32" y="37" font-size="11" text-anchor="middle" font-family="monospace" font-weight="700" fill="${NAVY}">PASS</text>`,
    ),
  },
  { id: nextId("boarding-pass"), collection: "boarding-pass", label: "Handwritten tag note", svg: wrap(handwrittenNoteShape(WHITE, seedFrom("bp-note"))) },
];
