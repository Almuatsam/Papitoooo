"use client";

import { useEffect, useRef, type RefObject } from "react";
import { coverRect, paintFiltered } from "@/lib/filter-pipeline";
import type { FilterDef } from "@/lib/filters";
import { loadHtmlImage } from "@/lib/decor/load-image";
import { cn } from "@/lib/cn";

/** Preview canvas width (px). Small on purpose: older phones must hold ~30 fps. */
const PREVIEW_WIDTH = 480;
/** Used when frames take too long to render at PREVIEW_WIDTH. */
const PREVIEW_WIDTH_LOW = 320;
const ASPECT = 3 / 4;
/** Target ~30 fps. */
const MIN_FRAME_INTERVAL_MS = 1000 / 30;
/** Average render time above which the preview drops to the low resolution. */
const SLOW_FRAME_MS = 40;
const SAMPLE_FRAMES = 12;

interface FilteredVideoCanvasProps {
  videoRef: RefObject<HTMLVideoElement>;
  filter: FilterDef;
  /** Front camera only. */
  mirrored: boolean;
  className?: string;
}

/**
 * Live preview drawn through the same pipeline as the exported strip (see
 * lib/filter-pipeline.ts), for browsers where CSS filters / blend modes on a
 * <video> cannot be trusted (lib/preview-mode.ts).
 */
export function FilteredVideoCanvas({ videoRef, filter, mirrored, className }: FilteredVideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let width = PREVIEW_WIDTH;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const videoEl = videoRef.current;
    let stopped = false;
    let lastDraw = 0;
    const samples: number[] = [];

    const resize = (nextWidth: number) => {
      width = nextWidth;
      canvas.width = width;
      canvas.height = Math.round(width * ASPECT);
    };
    resize(width);

    const draw = (now: number) => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0 || now - lastDraw < MIN_FRAME_INTERVAL_MS) return;
      lastDraw = now;
      const started = performance.now();
      try {
        paintFiltered(
          ctx,
          video,
          coverRect(video.videoWidth, video.videoHeight, canvas.width, canvas.height),
          canvas.width,
          canvas.height,
          filterRef.current,
        );
      } catch {
        return;
      }
      samples.push(performance.now() - started);
      if (samples.length >= SAMPLE_FRAMES) {
        const average = samples.reduce((sum, ms) => sum + ms, 0) / samples.length;
        samples.length = 0;
        if (average > SLOW_FRAME_MS && width !== PREVIEW_WIDTH_LOW) resize(PREVIEW_WIDTH_LOW);
      }
    };

    let handle = 0;
    const schedule = () => {
      if (stopped) return;
      const video = videoRef.current;
      if (video && typeof video.requestVideoFrameCallback === "function") {
        handle = video.requestVideoFrameCallback((now) => {
          draw(now);
          schedule();
        });
      } else {
        handle = requestAnimationFrame((now) => {
          draw(now);
          schedule();
        });
      }
    };
    schedule();

    return () => {
      stopped = true;
      if (videoEl && typeof videoEl.cancelVideoFrameCallback === "function") videoEl.cancelVideoFrameCallback(handle);
      cancelAnimationFrame(handle);
    };
  }, [videoRef]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="filtered-preview"
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", mirrored && "-scale-x-100", className)}
    />
  );
}

const REVIEW_WIDTH = 720;

/** A captured frame, drawn once through the export pipeline. */
export function FilteredImageCanvas({ src, filter, className }: { src: string; filter: FilterDef; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    void loadHtmlImage(src).then((img) => {
      const canvas = canvasRef.current;
      if (cancelled || !canvas) return;
      canvas.width = REVIEW_WIDTH;
      canvas.height = Math.round(REVIEW_WIDTH * ASPECT);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      try {
        paintFiltered(ctx, img, coverRect(img.naturalWidth, img.naturalHeight, canvas.width, canvas.height), canvas.width, canvas.height, filter);
      } catch {
        // Leave the canvas blank; the strip itself is rendered separately.
      }
    });
    return () => {
      cancelled = true;
    };
  }, [src, filter]);

  return <canvas ref={canvasRef} aria-hidden className={cn("h-full w-full", className)} />;
}
