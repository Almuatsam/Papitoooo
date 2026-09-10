"use client";

/** Full-bleed white flash, keyed to remount so the animation re-fires each shot. */
export function FlashOverlay({ shotKey }: { shotKey: number }) {
  return (
    <div
      key={shotKey}
      className="pointer-events-none absolute inset-0 z-40 bg-white animate-flash"
      aria-hidden
    />
  );
}
