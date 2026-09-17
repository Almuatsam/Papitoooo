export type View = "home" | "camera" | "result";

export type FilterId =
  | "natural"
  | "vintage"
  | "bw"
  | "warm"
  | "cool"
  | "film"
  | "retro"
  | "soft"
  | "contrast";

export type StripThemeId =
  | "festival-poster"
  | "streaming-card"
  | "arcade-corkboard"
  | "doodle-diary"
  | "boarding-pass"
  | "receipt"
  | "par-avion";

/** How many photos a strip has and how they're arranged — independent of theme. */
export type LayoutId =
  | "strip-3"
  | "strip-4"
  | "grid-6"
  | "single-portrait"
  | "single-landscape"
  | "triple-horizontal"
  | "asymmetric-3"
  | "asymmetric-4"
  | "double-strip-4";

/** A single captured frame, stored unfiltered as a JPEG data URL. */
export type Frame = string;

export type StickerKind = "svg" | "emoji";

export interface StickerInstance {
  id: string;
  kind: StickerKind;
  /** SVG markup (kind "svg") or the literal emoji character (kind "emoji"). */
  content: string;
  /** Position + transform, in strip-composite px (unscaled, matches PHOTO_WIDTH space). */
  x: number;
  y: number;
  scale: number;
  angle: number;
  /** Paint order; higher draws on top. */
  z: number;
}

export interface SessionSettings {
  filterId: FilterId;
  themeId: StripThemeId;
  /** Chosen before capture starts — determines shot count, so it can't change mid/post-session. */
  layoutId: LayoutId;
  borderColor: string;
  bgColor: string;
  /** "" = theme default. Overrides a theme's `strip.headerBand` color (e.g. Boarding Pass's top band); ignored by themes without a header band. */
  accentColor: string;
  caption: string;
  /** Second text line under the caption — surfaced in the UI as "Artist" (now-playing) or "To" (boarding-pass) and rendered accordingly; ignored by every other theme. */
  subtitle: string;
  showDate: boolean;
  stickers: StickerInstance[];
  /** Random per-session seed for the procedural strip decoration — generated
   * once per capture session so a strip looks different session to session
   * but stays pixel-identical between its own preview and its own download. */
  decorSeed: number;
}

export type CameraErrorKind =
  | "permission"
  | "no-device"
  | "in-use"
  | "insecure"
  | "unsupported"
  | "unknown";

export type Lang = "en" | "ar";
export type Direction = "ltr" | "rtl";
