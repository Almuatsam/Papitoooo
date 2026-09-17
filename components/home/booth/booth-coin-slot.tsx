"use client";

/** The coin/token slot on the cabinet face — traced from reference #3, purely decorative (no payment flow). */
export function BoothCoinSlot() {
  return (
    <svg aria-hidden viewBox="0 0 24 34" className="h-8 w-6 opacity-90">
      <rect x="1" y="1" width="22" height="32" fill="var(--booth-chrome-2)" stroke="var(--booth-magenta)" strokeWidth="2" />
      <rect x="9" y="7" width="6" height="13" fill="var(--booth-bg)" />
      <circle cx="12" cy="26" r="3.5" fill="var(--booth-magenta)" />
    </svg>
  );
}
