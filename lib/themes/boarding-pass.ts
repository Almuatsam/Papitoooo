import type { ThemeDef } from "@/lib/themes/types";

export const boardingPass: ThemeDef = {
  id: "boarding-pass",
  label: "Boarding Pass",
  tagline: "Perforated ticket, route fields",
  colors: {
    paper: "#ffffff",
    panel: "#f0f3f7",
    ink: "#0a1f44",
    muted: "#5c6b85",
    accent: "#0a1f44",
    accent2: "#c9a227",
    line: "#0a1f44",
  },
  strip: {
    outerPad: 28,
    bottomPad: 84,
    gap: 10,
    photoBorder: 2,
    radius: 6,
    background: { kind: "pattern", patternId: "polka-dot", patternUsesAccent: true },
    photoRotationJitter: false,
    // A real ticket: route fields, a barcode, a fabric "lace" panel along
    // one edge, and a perforated card edge via the "ticket" outer frame.
    piecePool: [
      { kind: "route-field-block", material: "paper-cutout", anchor: "frame", edge: "top", color: "ink", angle: 0, scale: 0.85, layer: "front", required: true },
      { kind: "barcode", material: "hand-drawn", anchor: "frame", edge: "bottom", color: "ink", angle: 0, scale: 1, layer: "front", required: true },
      { kind: "thin-band", material: "fabric", anchor: "frame", edge: "left", color: "accent2", angle: 90, scale: 0.9, layer: "back", required: true },
      { kind: "diamond", material: "plastic", anchor: 0, edge: "tr", color: "accent2", angle: 0, scale: 0.3, layer: "front" },
      { kind: "triangle", material: "plastic", anchor: 2, edge: "br", color: "accent", angle: 6, scale: 0.32, layer: "front" },
    ],
    pieceCount: [3, 5],
    captionTreatment: "stamp",
    captionFontVar: "--font-space-mono",
    captionFontSize: 18,
    outerFrame: { style: "ticket", width: 12 },
  },
};
