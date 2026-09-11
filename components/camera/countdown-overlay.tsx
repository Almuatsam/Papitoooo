"use client";

/**
 * Giant popping numeral shown before each shot. Re-keys on `value` so the
 * pop animation restarts for every count.
 */
export function CountdownOverlay({ value }: { value: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-ink/30">
      <div className="absolute h-40 w-40 rounded-full bg-accent/30 animate-pulse-ring" />
      <span
        key={value}
        className="animate-count-pop font-display text-[9rem] leading-none text-white drop-shadow-[0_6px_0_rgb(var(--ink))] sm:text-[12rem]"
      >
        {value}
      </span>
    </div>
  );
}
