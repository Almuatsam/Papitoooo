"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CameraError,
  classifyCameraError,
  initializeCamera,
  stopMediaStream,
} from "@/lib/camera-utils";

export type CameraStatus = "idle" | "starting" | "ready" | "error";

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  status: CameraStatus;
  error: CameraError | null;
  start: () => Promise<void>;
  stop: () => void;
}

/**
 * Owns the camera MediaStream lifecycle for a single <video> element.
 * Adapted from tedy69/photobooth's use-camera; the fake-image fallback is gone
 * and failures surface as typed CameraError values for the error UI.
 */
export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const genRef = useRef(0);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<CameraError | null>(null);

  const stop = useCallback(() => {
    genRef.current += 1;
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    const gen = ++genRef.current;
    setError(null);
    setStatus("starting");
    try {
      stopMediaStream(streamRef.current);
      const stream = await initializeCamera({ facingMode: "user" });

      const video = videoRef.current;
      if (gen !== genRef.current || !video) {
        // A newer start()/stop() superseded this one, or we unmounted.
        stopMediaStream(stream);
        return;
      }
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      setStatus("ready");
    } catch (err) {
      streamRef.current = null;
      setError(err instanceof CameraError ? err : classifyCameraError(err));
      setStatus("error");
    }
  }, []);

  // Always release the camera when the hook unmounts.
  useEffect(() => stop, [stop]);

  return { videoRef, status, error, start, stop };
}
