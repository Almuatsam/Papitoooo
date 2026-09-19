import type { ThemeDef } from "@/lib/themes/types";
import { GLITTER_CORNER_BOTTOM_LEFT } from "@/lib/decor/assets/glitter-frame";

export const glitterStar: ThemeDef = {
  id: "glitter-star",
  label: "Glitter Star",
  tagline: "Hot pink sequins & a chrome star",
  colors: {
    paper: "#ffffff",
    panel: "#ffffff",
    ink: "#1a1a1a",
    muted: "#8a8a90",
    accent: "#e01a83",
    accent2: "#c7c7cf",
    line: "#e01a83",
  },
  strip: {
    // GLITTER_FRAME_BORDER / GLITTER_CORNER_BOTTOM_LEFT (lib/decor/assets/
    // glitter-frame.ts) are asymmetric on purpose — the source art's border
    // is thicker on the bottom (for the star) than the other 3 sides, and
    // the bottom-left corner is much bigger still (to hold the star without
    // clipping it).
    // - outerPad only needs to clear the 3 PLAIN corners/sides (left 60,
    //   top 47, right 59) — an earlier version of this comment assumed it
    //   also had to clear the star corner's 288px width, but the star is
    //   only ever reached vertically (it's confined to the bottom
    //   `GLITTER_CORNER_BOTTOM_LEFT.h` px of the canvas, which bottomPad
    //   alone already keeps every photo clear of), so 62 (60 + a 2px
    //   buffer) is enough to put photos flush against the border on
    //   top/left/right with no separate white margin.
    // - bottomPad has to clear GLITTER_CORNER_BOTTOM_LEFT.h (276) so the
    //   star corner never overlaps a photo, AND separately leave enough
    //   room for the caption (vertically centered in the whole bottomPad
    //   band by renderCaptionBitmap) to clear the plain bottom border
    //   (119) with a margin — that second requirement is the binding one
    //   (it needs bottomPad a bit over 2x 119), so 300 clears both.
    outerPad: 62,
    bottomPad: 300,
    gap: 14,
    photoBorder: 2,
    radius: 8,
    // Plain white, matching the PNG's white interior — no pattern/texture,
    // not copied from the leopard/zebra themes' own choices here.
    background: { kind: "solid" },
    photoRotationJitter: false,
    piecePool: [],
    pieceCount: [0, 0],
    captionTreatment: "plain",
    captionFontVar: "--font-fredoka",
    captionFontSize: 26,
    // With outerPad tightened to 62 (just enough to clear the plain
    // border), canvasW is only ~724px for a 4-photo strip — nowhere near
    // wide enough for a full-width-centered caption to clear the star
    // corner's 288px footprint (measured: even a short caption like "DISCO
    // · Sep 19, 2026" is ~270px wide, so dead-centered it would render
    // straight over the star). Shrinking+shifting the caption's own box to
    // start just right of the star, rather than widening outerPad (which
    // would just reopen the top/right white-margin gap this theme was
    // just tightened to remove), keeps it centered in the actual clear
    // space instead.
    captionInsetLeft: GLITTER_CORNER_BOTTOM_LEFT.w + 20,
    // width here is inert: "glitter-frame" isn't in strip-renderer.ts's
    // insetsBackground list (that logic assumes one symmetric band, which
    // doesn't fit this frame's asymmetric geometry) and background.kind is
    // "solid", which fills the whole canvas directly and never reads it.
    outerFrame: { style: "glitter-frame", width: 60 },
  },
};
