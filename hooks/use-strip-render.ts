"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { renderStrip } from "@/lib/strip-renderer";
import { EXPORT_SCALE } from "@/lib/constants";
import type { Frame, SessionSettings } from "@/types";

interface UseStripRenderResult {
  /** Preview-resolution PNG data URL, or "" until the first render lands. */
  previewUrl: string;
  rendering: boolean;
  error: boolean;
  /** Renders a fresh print-resolution PNG on demand (for download). */
  renderFullRes: () => Promise<string>;
}

/**
 * Keeps a debounced preview render of the strip in sync with the current
 * frames + settings. The renderer is the single source of truth, so the
 * preview and the downloaded file always match.
 */
export function useStripRender(
  frames: Frame[],
  settings: SessionSettings,
  debounceMs = 180,
): UseStripRenderResult {
  const [previewUrl, setPreviewUrl] = useState("");
  const [rendering, setRendering] = useState(true);
  const [error, setError] = useState(false);
  const runId = useRef(0);

  useEffect(() => {
    if (frames.length === 0) return;
    const id = ++runId.current;
    setRendering(true);
    setError(false);

    const timer = setTimeout(() => {
      renderStrip({ frames, scale: 1, ...settings })
        .then((url) => {
          if (id === runId.current) {
            setPreviewUrl(url);
            setRendering(false);
          }
        })
        .catch(() => {
          if (id === runId.current) {
            setError(true);
            setRendering(false);
          }
        });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [frames, settings, debounceMs]);

  const renderFullRes = useCallback(
    () => renderStrip({ frames, scale: EXPORT_SCALE, ...settings }),
    [frames, settings],
  );

  return { previewUrl, rendering, error, renderFullRes };
}
