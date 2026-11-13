import type { ThemeDef } from "@/lib/themes/types";

/**
 * Graduation is an overlay-frame theme: each standard layout has a ready-made
 * frame PNG in public/themes/graduation/ (named by layout id), drawn over the
 * photos at native size. The numbers below are the frame's own geometry —
 * 62px sides, a 230px logo area on top, 44px between photos, a 380px bottom
 * band (GRADUATION / name / 2026) — so the standard layouts land exactly in
 * the frame's transparent windows. Everything else a theme usually draws
 * (background, pieces, outer frame, stickers, date) is already in the frame.
 */
export const graduation: ThemeDef = {
  id: "graduation",
  label: "Graduation",
  tagline: "Pixel-art cap, stars & a ready-made frame",
  features: { stickers: false, date: false, swatches: false },
  colors: {
    paper: "#ffffff",
    panel: "#ffffff",
    ink: "#1C2B4A",
    muted: "#1C2B4A",
    accent: "#BA3324",
    accent2: "#00A5F1",
    line: "#1C2B4A",
  },
  strip: {
    outerPad: 62,
    topPad: 230,
    gap: 44,
    bottomPad: 380,
    photoBorder: 0,
    radius: 0,
    background: { kind: "solid" },
    photoRotationJitter: false,
    piecePool: [],
    pieceCount: [0, 0],
    captionTreatment: "name-band",
    captionFontVar: "--font-press-start",
    captionFontSize: 44,
    outerFrame: { style: "none", width: 0 },
    overlayFrame: { dir: "/themes/graduation" },
    // The empty band between the GRADUATION letters (end 70px into the
    // bottom area) and "2026" (starts 276px in), measured from the frames.
    captionBand: { top: 84, height: 178 },
  },
};
