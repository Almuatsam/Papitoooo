import type { ThemeDef } from "@/lib/themes/types";

/**
 * Halloween is a template theme: its look is the fixed artwork in
 * public/themes/halloween/, selected through the template layouts in
 * lib/layouts/templates/halloween.ts. The strip fields below are only the
 * inert minimum the ThemeDef shape requires; the template renderer
 * (lib/template-renderer.ts) never reads spacing, pieces or caption settings.
 */
export const halloween: ThemeDef = {
  id: "halloween",
  label: "Halloween",
  tagline: "Purple night & glowing jack-o'-lanterns",
  features: { stickers: false },
  colors: {
    paper: "#1d0b22",
    panel: "#2a1230",
    ink: "#f6a230",
    muted: "#8c6a94",
    accent: "#b9d02d",
    accent2: "#f6a230",
    line: "#b9d02d",
  },
  strip: {
    outerPad: 0,
    bottomPad: 0,
    gap: 0,
    photoBorder: 0,
    radius: 0,
    background: { kind: "solid" },
    photoRotationJitter: false,
    piecePool: [],
    pieceCount: [0, 0],
    captionTreatment: "plain",
    captionFontVar: "--font-fredoka",
    captionFontSize: 26,
    outerFrame: { style: "none", width: 0 },
  },
};
