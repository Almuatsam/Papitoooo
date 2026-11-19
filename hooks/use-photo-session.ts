"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { capturePhotoFromVideo, waitForFreshFrame, type CameraFacing } from "@/lib/camera-utils";
import { COUNTDOWN_SECONDS, FRESH_FRAME_TIMEOUT_MS, REVIEW_MS } from "@/lib/constants";
import { runFlashSequence } from "@/lib/flash-sequence";
import type { TorchControl } from "@/lib/torch";
import type { Frame } from "@/types";

export type SessionPhase = "idle" | "countdown" | "flash" | "review" | "done";
export type FlashMode = "auto" | "off";
/** "hold" = screen fully white; "fade" = fading out; null = no screen flash. */
export type FlashStage = "hold" | "fade" | null;

interface UsePhotoSessionInput {
  videoRef: React.RefObject<HTMLVideoElement>;
  /** How many shots this session takes — derived from the chosen layout's photoCount. */
  shotCount: number;
  onComplete: (frames: Frame[]) => void;
  flashMode: FlashMode;
  /** Active camera. Only the front camera is mirrored in the captured frame. */
  facing: CameraFacing;
  /** Torch for the active track, if it has one. */
  torch: TorchControl | null;
}

interface UsePhotoSessionResult {
  phase: SessionPhase;
  flashStage: FlashStage;
  /** 0-based index of the shot currently being taken. */
  shotIndex: number;
  /** Current countdown number (COUNTDOWN_SECONDS .. 1), only meaningful in "countdown". */
  count: number;
  /** Frames captured so far. */
  frames: Frame[];
  /** The most recent capture, shown during the "review" beat. */
  lastFrame: Frame | null;
  isRunning: boolean;
  start: () => void;
  cancel: () => void;
}

function abortableSleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export function usePhotoSession({
  videoRef,
  shotCount,
  onComplete,
  flashMode,
  facing,
  torch,
}: UsePhotoSessionInput): UsePhotoSessionResult {
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [flashStage, setFlashStage] = useState<FlashStage>(null);
  const [shotIndex, setShotIndex] = useState(0);
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [lastFrame, setLastFrame] = useState<Frame | null>(null);

  const framesRef = useRef<Frame[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  // Read at shot time, so a flash setting changed mid-session still applies.
  const optionsRef = useRef({ flashMode, facing, torch });
  optionsRef.current = { flashMode, facing, torch };

  const reset = useCallback(() => {
    framesRef.current = [];
    setFrames([]);
    setLastFrame(null);
    setShotIndex(0);
    setCount(COUNTDOWN_SECONDS);
    setFlashStage(null);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    reset();
    setPhase("idle");
  }, [reset]);

  const takeShot = useCallback(
    async (signal: AbortSignal): Promise<Frame | null> => {
      const { flashMode: mode, facing: side, torch: light } = optionsRef.current;
      const flashOn = mode === "auto";
      const sleep = (ms: number) => abortableSleep(ms, signal);
      return runFlashSequence({
        // The front camera has nothing else to light the face, so the screen
        // always flashes; a back camera relies on the torch.
        screenFlash: flashOn && side === "user",
        torch: flashOn ? light : null,
        showScreen: () => setFlashStage("hold"),
        fadeScreen: () => setFlashStage("fade"),
        hideScreen: () => setFlashStage(null),
        waitForFreshFrame: async () => {
          const video = videoRef.current;
          if (video) await waitForFreshFrame(video, FRESH_FRAME_TIMEOUT_MS);
        },
        capture: () => {
          const video = videoRef.current;
          return video ? capturePhotoFromVideo(video, { flipHorizontal: side === "user" }) : null;
        },
        sleep,
      });
    },
    [videoRef],
  );

  const run = useCallback(
    async (signal: AbortSignal) => {
      for (let index = 0; index < shotCount; index++) {
        setShotIndex(index);
        setPhase("countdown");
        for (let remaining = COUNTDOWN_SECONDS; remaining > 0; remaining--) {
          setCount(remaining);
          await abortableSleep(1000, signal);
        }

        setPhase("flash");
        const frame = await takeShot(signal);
        if (!frame) break;
        framesRef.current = [...framesRef.current, frame];
        setFrames(framesRef.current);
        setLastFrame(frame);

        setPhase("review");
        await abortableSleep(REVIEW_MS, signal);
      }
      setPhase("done");
      onCompleteRef.current(framesRef.current);
    },
    [shotCount, takeShot],
  );

  const start = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    reset();
    run(controller.signal).catch((err: unknown) => {
      // Cancel is expected; anything else is a real failure worth surfacing.
      if (err instanceof DOMException && err.name === "AbortError") return;
      // eslint-disable-next-line no-console
      console.error("[photo-session] session failed", err);
      setFlashStage(null);
      setPhase("idle");
    });
  }, [reset, run]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return {
    phase,
    flashStage,
    shotIndex,
    count,
    frames,
    lastFrame,
    isRunning: phase !== "idle" && phase !== "done",
    start,
    cancel,
  };
}
