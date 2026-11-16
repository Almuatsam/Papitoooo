import type { ThemeDef } from "@/lib/themes/types";

/**
 * Muscat College is an overlay-frame theme, built like Graduation: each
 * standard layout has a ready-made frame PNG in public/themes/muscat-college/
 * (named by layout id), drawn over the photos at native size with fully
 * transparent photo windows. The numbers below are the frames' own geometry —
 * 124px sides, a 262px header, 34px between photos, a 380px bottom band
 * (script "Graduation", the name, the year) — so the standard layouts land
 * exactly in the transparent windows.
 */
export const muscatCollege: ThemeDef = {
  id: "muscat-college",
  label: "Muscat College",
  tagline: "Purple & gold graduation frame",
  features: { stickers: false, date: false, swatches: false },
  colors: {
    paper: "#3A1763",
    panel: "#3A1763",
    ink: "#D6A842",
    muted: "#D6A842",
    accent: "#B08028",
    accent2: "#B08028",
    line: "#F7EF8A",
  },
  strip: {
    outerPad: 124,
    topPad: 262,
    gap: 34,
    bottomPad: 380,
    photoBorder: 0,
    radius: 0,
    background: { kind: "solid" },
    photoRotationJitter: false,
    piecePool: [],
    pieceCount: [0, 0],
    captionTreatment: "name-band",
    captionFontVar: "--font-press-start",
    captionFontSize: 36,
    outerFrame: { style: "none", width: 0 },
    overlayFrame: {
      dir: "/themes/muscat-college",
      perLayout: {
        // strip-3 is drawn with extra space above and below so the strip is
        // exactly 1:3 (848x2544), like the 4-photo strips.
        "strip-3": { topPad: 504, bottomPad: 622 },
      },
      // 4x6 in at 300 dpi: both strips fitted into 600x1800 halves, uncropped.
      printSheet: { width: 1200, height: 1800 },
    },
    // The empty band between the script "Graduation" (ends 144px into the
    // bottom area) and the year (starts 204px in), measured from the frames,
    // with 1px of margin on each side.
    captionBand: { top: 146, height: 57 },
  },
};
