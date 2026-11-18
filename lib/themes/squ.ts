import type { ThemeDef } from "@/lib/themes/types";

/**
 * SQU (Sultan Qaboos University) is an overlay-frame theme like Muscat
 * College: each standard layout has a ready-made frame PNG in
 * public/themes/squ/ (named by layout id) with fully transparent photo
 * windows. The frame is asymmetric — a lace strip runs down the left — so it
 * uses separate left/right/top margins: 236px left, 64px right, a 460px
 * header, 24px between photos and a 368px bottom band (crest and flourishes).
 */
export const squ: ThemeDef = {
  id: "squ",
  label: "SQU",
  tagline: "Navy & gold graduation frame with lace",
  features: { stickers: false, date: false, swatches: false },
  colors: {
    paper: "#212B45",
    panel: "#212B45",
    ink: "#E8B923",
    muted: "#E8B923",
    accent: "#C9981A",
    accent2: "#C9981A",
    line: "#F4D56B",
  },
  strip: {
    outerPad: 64,
    leftPad: 236,
    rightPad: 64,
    topPad: 460,
    gap: 24,
    bottomPad: 368,
    photoBorder: 0,
    radius: 0,
    background: { kind: "solid" },
    photoRotationJitter: false,
    piecePool: [],
    pieceCount: [0, 0],
    captionTreatment: "name-band",
    captionFontVar: "--font-cinzel",
    captionFontSize: 40,
    captionStyle: { gradient: ["#F7E39A", "#E8B923", "#A9790F"], letterSpacing: 1.5 },
    outerFrame: { style: "none", width: 0 },
    overlayFrame: {
      dir: "/themes/squ",
      perLayout: {
        // strip-3 is drawn on a 900x2700 canvas (exactly 1:3) with the three
        // photos centred vertically: the first one starts at y = 697.
        "strip-3": { topPad: 697, bottomPad: 605 },
      },
      // 4x6 in at 300 dpi: both 900x2700 strips fitted into the halves.
      printSheet: { width: 1200, height: 1800 },
    },
    // The empty band between the crest (ends about 238px into the bottom
    // area) and the bottom edge of the strip.
    captionBand: { top: 255, height: 90 },
  },
};
