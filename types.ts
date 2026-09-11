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
  | "classic"
  | "y2k-camera"
  | "glitter-scrapbook"
  | "pop-magazine"
  | "retro-internet"
  | "cute-booth";

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
  borderColor: string;
  bgColor: string;
  caption: string;
  showDate: boolean;
  stickers: StickerInstance[];
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
