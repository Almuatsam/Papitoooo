"use client";

import { cn } from "@/lib/cn";

/**
 * Full-bleed white flash, keyed to remount so the animation re-fires each
 * shot. Defaults to `absolute` (sized to the nearest positioned ancestor, as
 * camera-screen.tsx relies on); pass `className="fixed"` when there's no
 * single ancestor that already spans the area that should flash.
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
