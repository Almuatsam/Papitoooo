import type { ThemeDef } from "@/lib/themes/types";

export const receipt: ThemeDef = {
  id: "receipt",
  label: "Receipt",
  tagline: "Itemized header, barcode footer",
  colors: {
    paper: "#f7f4ec",
    panel: "#ffffff",
    ink: "#101014",
    muted: "#5a5a5a",
    accent: "#101014",
    accent2: "#101014",
    line: "#101014",
  },
  strip: {
    // outerPad/bottomPad are deliberately large here (not a typical strip's
    // spacing) — they're the header/footer's clearance band, not just
    // margin. See the piece offsets below for how they land inside it.
    outerPad: 140,
    bottomPad: 280,
    gap: 10,
    photoBorder: 1,
    radius: 0,
    background: { kind: "texture", textureId: "paper" },
    photoRotationJitter: false,
    // The itemized RECEIPT header and barcode+THANK YOU footer always
    // render — that's the design-test's whole checklist for this theme.
    // Their offsets are hand-tuned against this theme's own outerPad/
    // bottomPad so they land inside those margins instead of colliding
    // with the photos or the caption line (verified by rendering, not
    // just computed — see the visual-design-iteration pass).
    piecePool: [
      { kind: "receipt-header", material: "hand-drawn", anchor: "frame", edge: "top", color: "ink", angle: 0, scale: 1, offset: { x: 0, y: 14 }, layer: "front", required: true },
      { kind: "receipt-footer", material: "hand-drawn", anchor: "frame", edge: "bottom", color: "ink", angle: 0, scale: 1, offset: { x: 0, y: 111 }, layer: "front", required: true },
      { kind: "torn-strip", material: "paper-cutout", anchor: 0, edge: "bl", color: "paper", angle: -3, scale: 0.4, layer: "back" },
      { kind: "broken-band", material: "paper-cutout", anchor: 1, edge: "br", color: "muted", angle: 2, scale: 0.35, layer: "back" },
    ],
    pieceCount: [2, 4],
    captionTreatment: "plain",
    captionFontVar: "--font-space-mono",
    captionFontSize: 16,
    outerFrame: { style: "none", width: 0 },
  },
};
