import type { ThemeDef } from "@/lib/themes/types";

export const zebraStripes: ThemeDef = {
  id: "zebra-stripes",
  label: "Zebra Stripes",
  tagline: "Bold black & white stripes, hot pink caption",
  features: { stickers: false },
  colors: {
    paper: "#ffffff",
    panel: "#ffffff",
    ink: "#111111",
    muted: "#7a7a7a",
    accent: "#ff2d78",
    accent2: "#111111",
    line: "#111111",
  },
  strip: {
    // ZEBRA_FRAME_BORDER (lib/decor/assets/zebra-frame.ts) measures 108px.
    // outerPad is set to that exact thickness (+2px so the photo's own
    // keyline doesn't visually merge with the border) so photos sit flush
    // against the border's inner edge on top/left/right — no separate
    // white margin beyond the border itself. outerFrame.width below MUST
    // match ZEBRA_FRAME_BORDER exactly: it's what lib/strip-renderer.ts
    // uses to inset the background paint area under this border (see
    // insetsBackground there).
    //
    // bottomPad can't be brought down to that same 110 — renderCaptionBitmap
    // (lib/decor/caption-bitmap.ts) vertically centers "plain" caption text
    // at the MIDPOINT of the whole bottomPad band, with no awareness of a
    // border eating into part of that band, so bottomPad must be roughly
    // 2x the border thickness just to push the text's center above the
    // border's top edge with any margin at all. 280 is the tightened
    // minimum for that (vs. the previous 300) — the caption still reads as
    // its own distinct footer band below the last photo (matching every
    // other theme's layout, see the summary), it's just no longer padded
    // more than the centering math actually requires.
    outerPad: 110,
    bottomPad: 280,
    gap: 12,
    photoBorder: 2,
    radius: 4,
    background: { kind: "solid" },
    photoRotationJitter: false,
    piecePool: [],
    pieceCount: [0, 0],
    captionTreatment: "plain",
    captionFontVar: "--font-archivo-black",
    captionFontSize: 26,
    outerFrame: { style: "zebra-frame", width: 108 },
  },
};
