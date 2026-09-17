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
    // Generous top spacing above the art (a real now-playing screen never
    // crowds the album art to the top edge) and a tall bottom band that
    // fits the title/artist row + the full transport-controls panel below
    // it — see captionTreatment "now-playing" and the now-playing-panel
    // piece, which split that band between them (see their offsets below).
    outerPad: 60,
    bottomPad: 360,
    gap: 14,
    photoBorder: 0,
    radius: 22,
    background: { kind: "solid" },
    photoRotationJitter: false,
    // Deliberately the cleanest theme: the photo strip reads as album art,
    // one title/artist row, one controls panel — no other clutter.
    piecePool: [
      {
        kind: "now-playing-panel",
        material: "hand-drawn",
        anchor: "frame",
        edge: "bottom",
        color: "ink",
        secondaryColor: "muted",
        angle: 0,
        scale: 1.15,
        offset: { x: 0, y: 235 },
        layer: "front",
        required: true,
      },
    ],
    pieceCount: [1, 1],
    captionTreatment: "now-playing",
    captionFontVar: "--font-archivo",
    captionFontSize: 30,
    outerFrame: { style: "none", width: 0 },
  },
};
