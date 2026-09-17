import type { ThemeDef } from "@/lib/themes/types";

export const streamingCard: ThemeDef = {
  id: "streaming-card",
  label: "Streaming Card",
  tagline: "Clean white card, waveform bar",
  colors: {
    paper: "#ffffff",
    panel: "#ffffff",
    ink: "#101014",
    muted: "#6e6e76",
    accent: "#2f2f33",
    accent2: "#ff4d6d",
    line: "#101014",
  },
  strip: {
    outerPad: 26,
    bottomPad: 64,
    gap: 14,
    photoBorder: 0,
    radius: 18,
    background: { kind: "solid" },
    photoRotationJitter: false,
    // Deliberately the cleanest theme: only a top "now playing" bar and a
    // bottom playback-glyph row are always present — no clutter beyond that.
    piecePool: [
      { kind: "waveform-bar", material: "hand-drawn", anchor: "frame", edge: "top", color: "accent", angle: 0, scale: 1, layer: "front", required: true },
      { kind: "playback-row", material: "hand-drawn", anchor: "frame", edge: "bottom", color: "accent", angle: 0, scale: 1, layer: "front", required: true },
      { kind: "thin-band", material: "hand-drawn", anchor: "frame", edge: "left", color: "accent2", angle: 90, scale: 0.3, layer: "back" },
    ],
    pieceCount: [2, 3],
    captionTreatment: "plain",
    captionFontVar: "--font-space-mono",
    captionFontSize: 18,
    outerFrame: { style: "none", width: 0 },
  },
};
