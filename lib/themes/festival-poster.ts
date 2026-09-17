import type { ThemeDef } from "@/lib/themes/types";

export const festivalPoster: ThemeDef = {
  id: "festival-poster",
  label: "Festival Poster",
  tagline: "Mustard, teal & corner medallions",
  colors: {
    paper: "#d4a017",
    panel: "#f5e6b8",
    ink: "#101014",
    muted: "#5c4a1a",
    accent: "#1f7a72",
    accent2: "#ff2f92",
    line: "#101014",
  },
  strip: {
    outerPad: 28,
    bottomPad: 82,
    gap: 12,
    photoBorder: 4,
    radius: 2,
    background: { kind: "pattern", patternId: "psychedelic-swirl", patternUsesAccent: true },
    photoRotationJitter: false,
    // Four ornate corner medallions always present (an event flyer's
    // corner badges) plus a handful of optional loud paper-cutout accents.
    piecePool: [
      { kind: "corner-medallion", material: "paper-cutout", anchor: "frame", edge: "tl", color: "accent2", secondaryColor: "ink", angle: 0, scale: 0.8, layer: "front", required: true },
      { kind: "corner-medallion", material: "paper-cutout", anchor: "frame", edge: "tr", color: "accent2", secondaryColor: "ink", angle: 0, scale: 0.8, layer: "front", required: true },
      { kind: "corner-medallion", material: "paper-cutout", anchor: "frame", edge: "bl", color: "accent2", secondaryColor: "ink", angle: 0, scale: 0.8, layer: "front", required: true },
      { kind: "corner-medallion", material: "paper-cutout", anchor: "frame", edge: "br", color: "accent2", secondaryColor: "ink", angle: 0, scale: 0.8, layer: "front", required: true },
      { kind: "thin-band", material: "paper-cutout", anchor: "frame", edge: "top", color: "accent2", angle: 0, scale: 0.7, layer: "back" },
      { kind: "thin-band", material: "paper-cutout", anchor: "frame", edge: "bottom", color: "accent", angle: 0, scale: 0.7, layer: "back" },
      { kind: "star-piece", material: "paper-cutout", anchor: 0, edge: "tr", color: "accent2", angle: -6, scale: 0.35, layer: "front" },
      { kind: "ribbon", material: "vinyl", anchor: 1, edge: "left", color: "accent", angle: -8, scale: 0.45, layer: "front" },
      { kind: "torn-strip", material: "paper-cutout", anchor: 0, edge: "bl", color: "accent", angle: 4, scale: 0.5, layer: "back" },
    ],
    pieceCount: [4, 7],
    captionTreatment: "poster-arc",
    captionFontVar: "--font-anton",
    captionFontSize: 26,
    outerFrame: { style: "solid", width: 9 },
  },
};
