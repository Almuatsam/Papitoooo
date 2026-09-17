"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { capturePhotoFromVideo } from "@/lib/camera-utils";
import {
  COUNTDOWN_SECONDS,
  FLASH_MS,
  REVIEW_MS,
} from "@/lib/constants";
import type { Frame } from "@/types";

export type SessionPhase = "idle" | "countdown" | "flash" | "review" | "done";

/** Delay between the flash starting and the frame being grabbed. */
const FLASH_CAPTURE_DELAY = 110;

interface UsePhotoSessionInput {
  videoRef: React.RefObject<HTMLVideoElement>;
  /** How many shots this session takes — derived from the chosen layout's photoCount. */
  shotCount: number;
  onComplete: (frames: Frame[]) => void;
}

interface UsePhotoSessionResult {
  phase: SessionPhase;
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

export function usePhotoSession({
  videoRef,
  shotCount,
  onComplete,
}: UsePhotoSessionInput): UsePhotoSessionResult {
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [shotIndex, setShotIndex] = useState(0);
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [lastFrame, setLastFrame] = useState<Frame | null>(null);

  const framesRef = useRef<Frame[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const after = useCallback((ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  const cancel = useCallback(() => {
    clearTimers();
    framesRef.current = [];
    setFrames([]);
    setLastFrame(null);
    setShotIndex(0);
    setCount(COUNTDOWN_SECONDS);
    setPhase("idle");
  }, [clearTimers]);

  const runShot = useCallback(
    (index: number) => {
      setShotIndex(index);
      setPhase("countdown");
      setCount(COUNTDOWN_SECONDS);

      const tick = (remaining: number) => {
        if (remaining > 0) {
          setCount(remaining);
          after(1000, () => tick(remaining - 1));
          return;
        }

        // Fire the flash, then grab the frame a beat later so the capture
        // lands while the screen is lit.
        setPhase("flash");
        after(FLASH_CAPTURE_DELAY, () => {
          const video = videoRef.current;
          const frame = video ? capturePhotoFromVideo(video) : null;
          if (frame) {
            framesRef.current = [...framesRef.current, frame];
            setFrames(framesRef.current);
            setLastFrame(frame);
          }

          after(FLASH_MS - FLASH_CAPTURE_DELAY, () => {
            setPhase("review");
            after(REVIEW_MS, () => {
              if (index + 1 < shotCount && framesRef.current.length >= index + 1) {
                runShot(index + 1);
              } else {
                setPhase("done");
                onCompleteRef.current(framesRef.current);
              }
            });
          });
        });
      };

      after(1000, () => tick(COUNTDOWN_SECONDS - 1));
    },
    [after, videoRef, shotCount],
  );

  const start = useCallback(() => {
    clearTimers();
    framesRef.current = [];
    setFrames([]);
    setLastFrame(null);
    runShot(0);
  }, [clearTimers, runShot]);

  useEffect(() => clearTimers, [clearTimers]);

  return {
    phase,
    shotIndex,
    count,
    frames,
    lastFrame,
    isRunning: phase !== "idle" && phase !== "done",
    start,
    cancel,
  };
}
