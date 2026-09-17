"use client";

/**
 * The booth's roof/awning — traced from reference #3's angled canopy sitting
 * atop the cabinet, re-rendered in chrome instead of wood-tone.
 */
export function BoothCanopy() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 32"
      preserveAspectRatio="none"
      className="block h-6 w-full sm:h-8"
    >
      <defs>
        <linearGradient id="boothCanopyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--booth-chrome-1)" />
          <stop offset="45%" stopColor="var(--booth-chrome-2)" />
          <stop offset="100%" stopColor="var(--booth-chrome-3)" />
        </linearGradient>
      </defs>
      <polygon points="0,32 10,3 190,3 200,32" fill="url(#boothCanopyGrad)" />
      <line x1="10" y1="3" x2="190" y2="3" stroke="var(--booth-magenta)" strokeWidth="1.5" opacity="0.85" />
    </svg>
  );
}
