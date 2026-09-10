"use client";

import { cn } from "@/lib/cn";
import { PHOTO_COUNT } from "@/lib/constants";

interface SessionHudProps {
  filterLabel: string;
  /** Number of photos already captured. */
  captured: number;
  running: boolean;
}

export function SessionHud({ filterLabel, captured, running }: SessionHudProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3">
      <span className="bg-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-paper">
        {filterLabel}
      </span>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: PHOTO_COUNT }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2.5 w-2.5 rounded-full border-2 border-ink",
              i < captured ? "bg-accent" : "bg-paper/70",
            )}
          />
        ))}
        {running && (
          <span className="ml-1 bg-ink px-2 py-1 text-xs font-bold uppercase tracking-widest text-paper">
            {Math.min(captured + 1, PHOTO_COUNT)} / {PHOTO_COUNT}
          </span>
        )}
      </div>
    </div>
  );
}
