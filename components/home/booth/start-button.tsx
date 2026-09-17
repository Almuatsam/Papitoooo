"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlashOverlay } from "@/components/camera/flash-overlay";
import { useLanguage } from "@/hooks/use-language";

/** Delay between the click flash and handing off to the capture flow. */
const FLASH_DELAY_MS = 260;

/**
 * The booth's shutter button — a quick white flash before the view swaps
 * into the (unmodified) capture flow, mimicking an actual camera shutter.
 * `FlashOverlay` is rendered `fixed` (not the default `absolute`) since this
 * button now lives nested inside the curtained entrance column, not at the
 * hero's own positioned root — `fixed` covers the whole viewport regardless
 * of where it's nested.
 */
export function StartButton({ onStart }: { onStart: () => void }) {
  const { t } = useLanguage();
  const [flashKey, setFlashKey] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      onStart();
      return;
    }
    setFlashKey((k) => k + 1);
    setFlashing(true);
    timeoutRef.current = setTimeout(onStart, FLASH_DELAY_MS);
  };

  return (
    <>
      <div className="relative mx-auto w-[73%]">
        <span
          aria-hidden
          className="facet absolute inset-0 -z-10 animate-pulse-ring"
          style={{ background: "var(--booth-magenta)" }}
        />
        <Button size="sm" onClick={handleClick} className="booth-start-btn relative w-full">
          <Camera className="h-4 w-4" />
          {t.home.start}
        </Button>
      </div>
      {flashing && <FlashOverlay shotKey={flashKey} className="fixed" />}
    </>
  );
}
