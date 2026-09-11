"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { renderStrip } from "@/lib/strip-renderer";
import { EXPORT_SCALE } from "@/lib/constants";
import type { Frame, Lang, SessionSettings } from "@/types";

interface UseStripRenderResult {
  /** Preview-resolution PNG data URL (photos + theme decoration + caption —
   *  stickers are NOT baked in here; they're the live interactive layer on
   *  top), or "" until the first render lands. */
  previewUrl: string;
  rendering: boolean;
  error: boolean;
  /** Renders a fresh print-resolution PNG, stickers baked in, for download. */
  renderFullRes: () => Promise<string>;
}

/**
 * Keeps a debounced preview render of the strip (background only, no
 * stickers) in sync with the current frames + settings. The renderer is the
 * single source of truth, so the preview background and the downloaded file
 * always agree on everything except the interactive sticker layer, which the
 * caller composites live via Fabric and bakes in at download time.
 */
export function useStripRender(
  frames: Frame[],
  settings: SessionSettings,
  lang: Lang,
  debounceMs = 180,
): UseStripRenderResult {
  const [previewUrl, setPreviewUrl] = useState("");
  const [rendering, setRendering] = useState(true);
  const [error, setError] = useState(false);
  const runId = useRef(0);

  const { stickers: _stickers, ...previewSettings } = settings;

  useEffect(() => {
    if (frames.length === 0) return;
    const id = ++runId.current;
    setRendering(true);
    setError(false);

    const timer = setTimeout(() => {
      renderStrip({ frames, scale: 1, lang, stickers: [], ...previewSettings })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames, lang, JSON.stringify(previewSettings), debounceMs]);

  const renderFullRes = useCallback(
    () => renderStrip({ frames, scale: EXPORT_SCALE, lang, ...settings }),
    [frames, lang, settings],
  );

  return { previewUrl, rendering, error, renderFullRes };
}
