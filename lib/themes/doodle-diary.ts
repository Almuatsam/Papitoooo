import type { ThemeDef } from "@/lib/themes/types";

export const doodleDiary: ThemeDef = {
  id: "doodle-diary",
  label: "Doodle Diary",
  tagline: "Grid paper & marker headline",
  colors: {
    paper: "#fdf6e8",
    panel: "#ffffff",
    ink: "#101014",
    muted: "#6e6e76",
    accent: "#2f6fed",
    accent2: "#ff6a13",
    line: "#101014",
  },
  strip: {
    outerPad: 26,
    bottomPad: 84,
    gap: 12,
    photoBorder: 3,
    radius: 4,
    background: { kind: "pattern", patternId: "grid-paper", patternUsesAccent: false },
    photoRotationJitter: true,
    // Comic-strip doodles scattered unevenly — the "headline" is the user's
    // own caption, styled boldly via the marker-headline captionTreatment.
    piecePool: [
      { kind: "scribble-strip", material: "hand-drawn", anchor: "frame", edge: "top", color: "ink", angle: -3, scale: 0.5, layer: "front" },
      { kind: "squiggle-piece", material: "hand-drawn", anchor: 0, edge: "tl", color: "accent", angle: 0, scale: 0.5, layer: "front" },
      { kind: "starburst-piece", material: "hand-drawn", anchor: 1, edge: "tr", color: "accent2", angle: -8, scale: 0.4, layer: "front" },
      { kind: "star-piece", material: "hand-drawn", anchor: 2, edge: "bl", color: "accent", angle: 10, scale: 0.35, layer: "front" },
      { kind: "organic-blob", material: "paper", anchor: 3, edge: "tr", color: "paper", angle: 4, scale: 0.4, layer: "back" },
      { kind: "broken-band", material: "paper-cutout", anchor: "frame", edge: "bottom", color: "accent2", angle: 0, scale: 0.45, layer: "back" },
      { kind: "zigzag-strip", material: "hand-drawn", anchor: 1, edge: "left", color: "ink", angle: -4, scale: 0.4, layer: "front" },
    ],
    pieceCount: [4, 7],
    captionTreatment: "marker-headline",
    captionFontVar: "--font-marker",
    captionFontSize: 32,
    outerFrame: { style: "solid", width: 3 },
  },
};
