"use client";

/** The booth's stool, sitting inside the curtained opening — traced from reference #3. */
export function BoothStool() {
  return (
    <svg aria-hidden viewBox="0 0 40 50" className="h-14 w-11 sm:h-16 sm:w-14">
      <defs>
        <linearGradient id="boothStoolGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="var(--booth-chrome-1)" />
          <stop offset="100%" stopColor="var(--booth-chrome-2)" />
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="8" rx="15" ry="6" fill="url(#boothStoolGrad)" stroke="var(--booth-magenta)" strokeWidth="1" />
      <rect x="17.5" y="13" width="5" height="27" fill="var(--booth-chrome-1)" />
      <ellipse cx="20" cy="43" rx="12" ry="4.5" fill="var(--booth-chrome-1)" />
    </svg>
  );
}
