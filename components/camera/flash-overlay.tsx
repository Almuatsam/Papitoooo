"use client";

import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import type { FlashStage } from "@/hooks/use-photo-session";

/**
 * Full-viewport white flash, portalled to <body> so no transformed or clipped
 * ancestor can shrink it to the camera box. It sits above everything,
 * including the HUD. `stage` "hold" is fully white (the camera's exposure
 * adapts to it); "fade" fades out. With prefers-reduced-motion the fade
 * animation is skipped but the flash itself still happens (see globals.css).
 */
export function ScreenFlash({ stage }: { stage: Exclude<FlashStage, null> }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      data-testid="flash-overlay"
      data-stage={stage}
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[9999] bg-white",
        stage === "fade" && "animate-flash-fade",
      )}
    />,
    document.body,
  );
}

/**
 * Short self-fading white blink, keyed to remount so the animation re-fires.
 * Used by the home screen's start button as click feedback; the capture
 * flash itself is `ScreenFlash`. Defaults to `absolute`; pass
 * `className="fixed"` when no single ancestor spans the area to flash.
 */
export function FlashOverlay({ shotKey, className }: { shotKey: number; className?: string }) {
  return (
    <div
      key={shotKey}
      className={cn("pointer-events-none absolute inset-0 z-40 bg-white animate-flash", className)}
      aria-hidden
    />
  );
}
