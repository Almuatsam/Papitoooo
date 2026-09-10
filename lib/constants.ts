/** Number of photos in a strip. The whole experience is built around four. */
export const PHOTO_COUNT = 4;

/** Seconds counted down before each shot (3 → 2 → 1). */
export const COUNTDOWN_SECONDS = 3;

/** How long the just-captured frame is shown before the next countdown (ms). */
export const REVIEW_MS = 900;

/** How long the white capture flash stays on screen (ms). */
export const FLASH_MS = 500;

/** Per-photo pixel size used when compositing the strip (before export scaling). */
export const PHOTO_WIDTH = 600;
export const PHOTO_HEIGHT = 450;

/** Multiplier applied on download for a print-resolution PNG. */
export const EXPORT_SCALE = 3;

/** Capture aspect ratio (width / height) — matches PHOTO_WIDTH / PHOTO_HEIGHT. */
export const CAPTURE_ASPECT = PHOTO_WIDTH / PHOTO_HEIGHT;
