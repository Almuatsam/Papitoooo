"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CameraError,
  classifyCameraError,
  hasMultipleCameras,
  initializeCamera,
  resolveFacing,
  stopMediaStream,
  type CameraFacing,
} from "@/lib/camera-utils";
import { createTorchControl, type TorchControl } from "@/lib/torch";

export type CameraStatus = "idle" | "starting" | "ready" | "error";

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  status: CameraStatus;
  error: CameraError | null;
  /** Which way the running camera faces. Only "user" is mirrored. */
  facing: CameraFacing;
  /** More than one video input exists, so a front/back switch is offered. */
  canSwitch: boolean;
  /** Torch control for the running track, or null when it has none. */
  torch: TorchControl | null;
  start: () => Promise<void>;
  stop: () => void;
  switchCamera: () => void;
}

/**
 * Owns the camera MediaStream lifecycle for a single <video> element.
 * Adapted from tedy69/photobooth's use-camera; the fake-image fallback is gone
 * and failures surface as typed CameraError values for the error UI.
 */
export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const torchRef = useRef<TorchControl | null>(null);
  const genRef = useRef(0);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<CameraError | null>(null);
  const [requested, setRequested] = useState<CameraFacing>("user");
  const [facing, setFacing] = useState<CameraFacing>("user");
  const [canSwitch, setCanSwitch] = useState(false);
  const [torch, setTorch] = useState<TorchControl | null>(null);

  const releaseStream = useCallback(() => {
    // Torch first: it must be off before the track goes away.
    void torchRef.current?.off();
    torchRef.current = null;
    stopMediaStream(streamRef.current);
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => {
    genRef.current += 1;
    releaseStream();
    setTorch(null);
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
  }, [releaseStream]);

  const start = useCallback(async () => {
    const gen = ++genRef.current;
    setError(null);
    setStatus("starting");
    try {
      releaseStream();
      const stream = await initializeCamera({ facingMode: requested });

      const video = videoRef.current;
      if (gen !== genRef.current || !video) {
        // A newer start()/stop() superseded this one, or we unmounted.
        stopMediaStream(stream);
        return;
      }
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      const control = createTorchControl(track);
      torchRef.current = control;
      setTorch(control);
      setFacing(resolveFacing(track, requested));
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      setStatus("ready");
      // Device labels and the full list are only available after permission.
      void hasMultipleCameras().then((multiple) => {
        if (gen === genRef.current) setCanSwitch(multiple);
      });
    } catch (err) {
      streamRef.current = null;
      setError(err instanceof CameraError ? err : classifyCameraError(err));
      setStatus("error");
    }
  }, [releaseStream, requested]);

  const switchCamera = useCallback(() => {
    setRequested((current) => (current === "user" ? "environment" : "user"));
  }, []);

  // Keep the torch dark whenever the page is hidden.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") void torchRef.current?.off();
    };
    const onPageHide = () => void torchRef.current?.off();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  // Always release the camera when the hook unmounts.
  useEffect(() => stop, [stop]);

  return { videoRef, status, error, facing, canSwitch, torch, start, stop, switchCamera };
}
