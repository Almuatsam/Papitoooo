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
    // outerPad is generous on top so the header band has room to paint into
    // that margin (see strip.headerBand doc comment) without shrinking the
    // photos; bottomPad fits the barcode (just above the tear line) plus the
    // FROM/TO stub band (below it) — see the "ticket" outerFrame and the
    // "boarding-pass" captionTreatment.
    outerPad: 96,
    bottomPad: 150,
    gap: 10,
    photoBorder: 2,
    radius: 6,
    // Flat white body, no dot/texture fill — none of the 3 reference
    // tickets have one; the airplane watermark, barcode, and FROM/TO
    // fields are the only texture on the card.
    background: { kind: "solid" },
    photoRotationJitter: false,
    // A real ticket: a large airplane watermark, a GATE/SEAT field, a
    // barcode, a fabric "lace" panel along one edge, and a perforated tear
    // line + notch cutouts via the "ticket" outer frame.
    piecePool: [
      // Large, faint watermark sitting behind the FROM/TO field row (drawn
      // just above it in z-order, but the caption bitmap's transparent
      // background lets it show through) — front layer + a bottom-edge
      // offset so it lands in the stub band below the tear line, not under
      // a photo.
      { kind: "airplane-motif", material: "paper-cutout", anchor: "frame", edge: "bottom", color: "ink", angle: -6, scale: 1, offset: { x: 0, y: 100 }, layer: "front", opacity: 0.08, required: true },
      { kind: "route-field-block", material: "paper-cutout", anchor: "frame", edge: "tr", color: "ink", angle: 0, scale: 0.65, offset: { x: -50, y: 54 }, layer: "front", required: true },
      { kind: "barcode", material: "hand-drawn", anchor: "frame", edge: "bottom", color: "ink", angle: 0, scale: 1.1, offset: { x: 0, y: 30 }, layer: "front", required: true },
      { kind: "thin-band", material: "fabric", anchor: "frame", edge: "left", color: "accent2", angle: 90, scale: 0.9, layer: "back", required: true },
      { kind: "diamond", material: "plastic", anchor: 0, edge: "tr", color: "accent2", angle: 0, scale: 0.3, layer: "front" },
      { kind: "triangle", material: "plastic", anchor: 2, edge: "br", color: "accent", angle: 6, scale: 0.32, layer: "front" },
    ],
    pieceCount: [4, 6],
    captionTreatment: "boarding-pass",
    captionFontVar: "--font-bebas-neue",
    captionFontSize: 34,
    outerFrame: { style: "ticket", width: 12 },
    headerBand: { height: 76, label: "BOARDING PASS" },
  },
};
