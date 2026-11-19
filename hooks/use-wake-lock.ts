"use client";

import { useEffect } from "react";
import { createScreenWakeLock } from "@/lib/wake-lock";

/**
 * Keeps the screen awake while `active`. Released when the session ends, the
 * component unmounts or the page is hidden; re-acquired when the page is shown
 * again mid-session. Unsupported browsers are silently ignored.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const lock = createScreenWakeLock();
    void lock.acquire();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") void lock.release();
      else void lock.acquire();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      void lock.release();
    };
  }, [active]);
}
