/**
 * Decides how the live camera preview applies a filter.
 *
 * - "css":    CSS `filter` + `mix-blend-mode` on the <video>. Cheapest.
 * - "canvas": each video frame is drawn into a <canvas> through the same
 *             pipeline the exported strip uses (lib/filter-pipeline.ts).
 *
 * A DOM compositor's output cannot be read back by script, so "does CSS filter
 * on a <video> actually render here?" is not directly testable. What can be
 * tested is (a) whether the browser parses the CSS at all, (b) whether the
 * canvas pipeline renders correctly here (checked on real pixels below), and
 * (c) whether `ctx.filter` works. When ctx.filter does not work (WebKit, hence
 * every iOS browser and iOS in-app web views) the export already goes through
 * the pixel path, and WebKit's video layer is where CSS filters / blends get
 * dropped, so the preview uses the same canvas path to match the export.
 * Never decided by user-agent.
 */
import { canvasFilterSupported } from "@/lib/canvas-filter";
import { coverRect, paintFiltered } from "@/lib/filter-pipeline";

export type PreviewMode = "css" | "canvas";

const STORAGE_KEY = "photobooth.previewMode";

function readOverride(): PreviewMode | null {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get("preview");
    if (fromQuery === "css" || fromQuery === "canvas") return fromQuery;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "css" || stored === "canvas") return stored;
  } catch {
    // Storage or URL access blocked — no override.
  }
  return null;
}

function cssSupportsFilters(): boolean {
  try {
    return CSS.supports("filter", "grayscale(1)") && CSS.supports("mix-blend-mode", "overlay");
  } catch {
    return false;
  }
}

/**
 * Renders a 2x2 grey+red test image through the filter pipeline and checks the
 * pixels moved the way the filter definition says they should. If this fails
 * the canvas preview cannot be trusted either, so the caller keeps CSS.
 */
export function canvasPipelineWorks(): boolean {
  try {
    const source = document.createElement("canvas");
    source.width = 2;
    source.height = 1;
    const sctx = source.getContext("2d");
    const target = document.createElement("canvas");
    target.width = 2;
    target.height = 1;
    const tctx = target.getContext("2d", { willReadFrequently: true });
    if (!sctx || !tctx) return false;
    sctx.fillStyle = "#ff0000";
    sctx.fillRect(0, 0, 1, 1);
    sctx.fillStyle = "#808080";
    sctx.fillRect(1, 0, 1, 1);

    // grayscale: the red pixel must lose its colour.
    paintFiltered(tctx, source, coverRect(2, 1, 2, 1), 2, 1, { css: "grayscale(1)" });
    const gray = tctx.getImageData(0, 0, 1, 1).data;
    if (Math.abs(gray[0] - gray[1]) > 3 || Math.abs(gray[1] - gray[2]) > 3 || gray[0] === 255) return false;

    // multiply wash: white-ish red wash over grey must darken it.
    tctx.clearRect(0, 0, 2, 1);
    paintFiltered(tctx, source, coverRect(2, 1, 2, 1), 2, 1, {
      css: "none",
      overlay: { color: "#0000ff", opacity: 1, blend: "multiply" },
    });
    const multiplied = tctx.getImageData(1, 0, 1, 1).data;
    return multiplied[0] < 10 && multiplied[2] > 100;
  } catch {
    return false;
  }
}

let cached: PreviewMode | undefined;

/** Picks the preview mode for this browser. Cached after the first call. */
export function detectPreviewMode(): PreviewMode {
  if (cached) return cached;
  const override = readOverride();
  if (override) return (cached = override);
  if (!cssSupportsFilters()) return (cached = canvasPipelineWorks() ? "canvas" : "css");
  if (!canvasFilterSupported() && canvasPipelineWorks()) return (cached = "canvas");
  return (cached = "css");
}
