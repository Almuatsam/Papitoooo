import type { ThemeDef } from "@/lib/themes/types";
import { ARCADE_CABINET_SVG } from "@/lib/decor/assets/arcade-cabinet-svg";
import { ENTERTAINMENT_CABINET_SVG, JOYSTICK_SVG, pushPinChromeSvg } from "@/lib/decor/assets/arcade-svgs";

export const arcadeCorkboard: ThemeDef = {
  id: "arcade-corkboard",
  label: "Arcade Corkboard",
  tagline: "Neon maze, pinned & tilted",
  colors: {
    paper: "#12163a",
    panel: "#1a2050",
    ink: "#e8f4ff",
    muted: "#6a7bb0",
    accent: "#00e5ff",
    accent2: "#ff2fd6",
    line: "#00e5ff",
  },
  strip: {
    outerPad: 30,
    bottomPad: 78,
    gap: 12,
    photoBorder: 3,
    radius: 4,
    // "grain" breaks up the flat navy fill with a very low-opacity speckle
    // (a corkboard/denim texture cue, not a paper one — see svg-material-
    // effects skill) so the background reads as a surface, not a flat color.
    background: { kind: "pattern+texture", patternId: "maze-lines", textureId: "grain", patternUsesAccent: false },
    photoRotationJitter: false,
    // The whole strip is tilted as a final postprocess (tiltDeg below) to
    // read as "pinned to a corkboard" — the push-pin piece rotates along
    // with everything else since it's just a normal frame-anchored piece.
    piecePool: [
      // Physically-lit push-pin (feSpecularLighting on a bump map, clipped
      // to the head) instead of a flat-filled circle — see
      // lib/decor/assets/arcade-svgs.ts's pushPinChromeSvg.
      {
        kind: "asset-svg",
        material: "plastic",
        anchor: "frame",
        edge: "tl",
        color: "accent2",
        angle: 0,
        scale: 0.7,
        offset: { x: 40, y: 55 },
        layer: "front",
        required: true,
        assetSvg: pushPinChromeSvg("#ff2fd6"),
      },
      // Real composited SVG assets (see lib/decor/assets/) — used as-is per
      // the visual-design-iteration skill, not redrawn as primitives. Corner
      // -anchored pieces are centered ON the corner (originX/Y: "center"),
      // so they need an inward offset or most of the image clips off-canvas
      // — verified by rendering, not just computed.
      // Scaled down deliberately: only a subset of the source SVG's ~150
      // paths were kept (see arcade-cabinet-svg.ts), so at full size the
      // remaining fragments don't cohere into a recognizable cabinet
      // silhouette — confirmed by rendering. Smaller, it reads as a
      // secondary corner accent instead of an object the eye tries (and
      // fails) to parse.
      {
        kind: "asset-svg",
        material: "plastic",
        anchor: "frame",
        edge: "br",
        color: "accent",
        angle: -4,
        scale: 0.6,
        offset: { x: -35, y: -100 },
        layer: "front",
        required: true,
        assetSvg: ARCADE_CABINET_SVG,
      },
      {
        kind: "asset-svg",
        material: "plastic",
        anchor: "frame",
        edge: "bl",
        color: "accent2",
        angle: -18,
        scale: 0.85,
        offset: { x: 55, y: -70 },
        layer: "front",
        required: true,
        assetSvg: JOYSTICK_SVG,
      },
      {
        kind: "asset-svg",
        material: "plastic",
        anchor: 1,
        edge: "tr",
        color: "accent",
        angle: 8,
        scale: 0.8,
        offset: { x: -70, y: 90 },
        layer: "front",
        required: true,
        assetSvg: ENTERTAINMENT_CABINET_SVG,
      },
      { kind: "hexagon", material: "plastic", anchor: 0, edge: "br", color: "accent", angle: -6, scale: 0.35, layer: "front" },
      { kind: "diamond", material: "plastic", anchor: 2, edge: "tr", color: "accent2", angle: 0, scale: 0.3, layer: "front" },
      { kind: "star-piece", material: "chrome", anchor: 1, edge: "tl", color: "accent", angle: -8, scale: 0.35, layer: "front" },
      { kind: "squiggle-piece", material: "hand-drawn", anchor: "frame", edge: "bottom", color: "accent2", angle: 0, scale: 0.5, layer: "front" },
    ],
    pieceCount: [4, 7],
    captionTreatment: "pixel",
    captionFontVar: "--font-press-start",
    captionFontSize: 12,
    outerFrame: { style: "solid", width: 4 },
    tiltDeg: -4,
  },
};
