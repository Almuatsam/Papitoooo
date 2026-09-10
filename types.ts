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

export type StripStyleId = "classic" | "minimal" | "vintage" | "polaroid" | "film";

/** A single captured frame, stored unfiltered as a JPEG data URL. */
export type Frame = string;

export interface SessionSettings {
  filterId: FilterId;
  styleId: StripStyleId;
  borderColor: string;
  bgColor: string;
  caption: string;
  showDate: boolean;
}

export type CameraErrorKind =
  | "permission"
  | "no-device"
  | "in-use"
  | "insecure"
  | "unsupported"
  | "unknown";
