import type { ThemeDef } from "@/lib/themes/types";

export const parAvion: ThemeDef = {
  id: "par-avion",
  label: "Par Avion",
  tagline: "Airmail stripes, stamp & seal",
  colors: {
    paper: "#f5efe0",
    panel: "#ffffff",
    ink: "#0a1f44",
    muted: "#8a7a5c",
    accent: "#c8102e",
    accent2: "#0a1f44",
    line: "#0a1f44",
  },
  strip: {
    outerPad: 30,
    bottomPad: 80,
    gap: 14,
    photoBorder: 2,
    radius: 2,
    background: { kind: "solid" },
    photoRotationJitter: false,
    // A postage stamp in the corner, a wax seal, and an angled APPROVED
    // cancellation mark always appear — the airmail-striped border carries
    // the rest of the identity.
    piecePool: [
      { kind: "postage-stamp-piece", material: "paper-cutout", anchor: "frame", edge: "tr", color: "accent", angle: 6, scale: 1, layer: "front", required: true },
      { kind: "wax-seal", material: "plastic", anchor: "frame", edge: "bl", color: "accent", angle: 0, scale: 1, layer: "front", required: true },
      { kind: "approved-stamp", material: "hand-drawn", anchor: "frame", edge: "br", color: "accent2", angle: 0, scale: 0.9, layer: "front", required: true },
      { kind: "triangle", material: "paper-cutout", anchor: 0, edge: "tl", color: "accent2", angle: -8, scale: 0.3, layer: "front" },
      { kind: "chunky-block", material: "paper-cutout", anchor: 2, edge: "br", color: "muted", angle: 3, scale: 0.3, layer: "back" },
    ],
    pieceCount: [3, 5],
    captionTreatment: "airmail-tag",
    captionFontVar: "--font-marker",
    captionFontSize: 20,
    outerFrame: { style: "airmail", width: 10 },
  },
};
