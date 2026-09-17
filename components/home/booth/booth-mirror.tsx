"use client";

/** The small mirror panel on the cabinet's far outer edge — traced from reference #6's diagonal reflection hash-marks. */
export function BoothMirror() {
  return (
    <svg aria-hidden viewBox="0 0 20 60" className="h-4/5 w-full max-w-[20px]">
      <rect x="1" y="1" width="18" height="58" fill="var(--booth-chrome-3)" stroke="var(--booth-chrome-2)" strokeWidth="1" />
      <line x1="4" y1="47" x2="10" y2="13" stroke="var(--booth-chrome-1)" strokeWidth="1.2" opacity="0.7" />
      <line x1="9" y1="51" x2="15" y2="17" stroke="var(--booth-chrome-1)" strokeWidth="1.2" opacity="0.65" />
      <line x1="14" y1="55" x2="18" y2="29" stroke="var(--booth-chrome-1)" strokeWidth="1.2" opacity="0.55" />
    </svg>
  );
}
