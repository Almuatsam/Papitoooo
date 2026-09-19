import type { ThemeDef } from "@/lib/themes/types";

export const leopardScrapbook: ThemeDef = {
  id: "leopard-scrapbook",
  label: "Leopard Scrapbook",
  tagline: "Leopard scallops, sparkle stars & grid paper",
  features: { stickers: false },
  colors: {
    paper: "#f2ede1",
    panel: "#f2ede1",
    ink: "#1c120b",
    muted: "#8a7a68",
    accent: "#b9873f",
    accent2: "#3f5fc2",
    line: "#f2b6d4",
  },
  strip: {
    // The leopard border's real (measured, asymmetric) thickness is
    // LEOPARD_FRAME_BORDER in lib/decor/assets/leopard-scallop-frame.ts:
    // left 171 / top 148 / right 173 / bottom 139 — but the top-right and
    // bottom-left CORNERS are bigger than that (CORNER_SIZE: ~220x225 and
    // ~220x215) because the artwork's two pink stars are bigger than the
    // plain band and sit right at those corners. outerPad/bottomPad must
    // clear the corners, not just the plain band, or photos would sit under
    // part of a star. outerFrame.width itself is only used here to inset
    // where the background pattern paints (see strip-renderer.ts) — the
    // border drawing itself reads its real thickness from the PNG.
    outerPad: 230,
    bottomPad: 360,
    gap: 14,
    photoBorder: 3,
    radius: 6,
    background: { kind: "pattern", patternId: "graph-grid", patternUsesAccent: true },
    photoRotationJitter: false,
    // No decoration pieces: the source PNG's corner slices already contain
    // the two pink sparkle stars baked into the real artwork (top-right and
    // bottom-left corners both fall inside the star's painted area — see
    // lib/decor/assets/leopard-scallop-frame.ts) — drawing a separate
    // sparkle-star piece on top would double them up.
    piecePool: [],
    pieceCount: [0, 0],
    captionTreatment: "handwritten",
    captionFontVar: "--font-marker",
    captionFontSize: 26,
    outerFrame: { style: "leopard-scallop", width: 225 },
  },
};
