/**
 * Camera utilities. Adapted from the tedy69/photobooth reference implementation:
 * same getUserMedia / canvas-capture / flash approach, with typed error
 * classification and the mirrored capture kept (front camera selfie view).
 */
import type { CameraErrorKind } from "@/types";

export interface CameraConfig {
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
}

export interface CaptureOptions {
  quality?: number;
  format?: "image/jpeg" | "image/png";
  flipHorizontal?: boolean;
}

export class CameraError extends Error {
  kind: CameraErrorKind;
  constructor(kind: CameraErrorKind, message: string) {
    super(message);
    this.name = "CameraError";
    this.kind = kind;
  }
}

/** Maps a DOMException from getUserMedia to our error taxonomy. */
export function classifyCameraError(err: unknown): CameraError {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return new CameraError(
      "insecure",
      "The camera only works over HTTPS (or on localhost).",
    );
  }
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return new CameraError(
      "unsupported",
      "This browser does not support camera access.",
    );
  }
  const name =
    err && typeof err === "object" && "name" in err ? String(err.name) : "";
  const message =
    err && typeof err === "object" && "message" in err
      ? String(err.message)
      : "";

  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return new CameraError(
        "permission",
        "Camera access was blocked. Allow it in your browser settings and try again.",
      );
    case "NotFoundError":
    case "OverconstrainedError":
      return new CameraError("no-device", "No camera was found on this device.");
    case "NotReadableError":
    case "AbortError":
      return new CameraError(
        "in-use",
        "The camera is already in use by another app. Close it and try again.",
      );
    default:
      if (/denied|dismiss|not allowed|permission/i.test(message)) {
        return new CameraError(
          "permission",
          "Camera access was blocked. Allow it in your browser settings and try again.",
        );
      }
      return new CameraError(
        "unknown",
        "Something went wrong starting the camera.",
      );
  }
}

/** Initializes the camera stream, throwing a typed CameraError on failure. */
export async function initializeCamera(
  config: CameraConfig = {},
): Promise<MediaStream> {
  const { facingMode = "user", width, height } = config;

  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    throw classifyCameraError(undefined);
  }

  const constraints: MediaStreamConstraints = {
    video: {
      facingMode,
      ...(width ? { width: { ideal: width } } : {}),
      ...(height ? { height: { ideal: height } } : {}),
    },
    audio: false,
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    throw classifyCameraError(err);
  }
}

/**
 * Captures the current video frame to a data URL.
 * Mirrored by default so the saved photo matches the on-screen selfie preview.
 * No colour filter is applied here — filters are a render-time concern.
 */
export function capturePhotoFromVideo(
  video: HTMLVideoElement,
  options: CaptureOptions = {},
): string | null {
  const { quality = 0.92, format = "image/jpeg", flipHorizontal = true } = options;

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;

    ctx.save();
    if (flipHorizontal) {
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    return canvas.toDataURL(format, quality);
  } catch {
    return null;
  }
}

/** Stops every track on a media stream. */
export function stopMediaStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}
