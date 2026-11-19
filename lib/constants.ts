/** Seconds counted down before each shot (3 → 2 → 1). */
export const COUNTDOWN_SECONDS = 3;

/** How long the just-captured frame is shown before the next countdown (ms). */
export const REVIEW_MS = 900;

/**
 * Screen-flash timing. The screen stays fully white for FLASH_HOLD_MS so the
 * camera's auto-exposure can adapt to the light on the face; the frame is
 * grabbed at the end of that hold, then the white fades out over FLASH_FADE_MS.
 */
export const FLASH_HOLD_MS = 450;
export const FLASH_FADE_MS = 150;

/** The torch (real camera light) is switched on this long before the grab. */
export const TORCH_LEAD_MS = 400;

/** Give up waiting for a fresh video frame after this long and grab anyway. */
export const FRESH_FRAME_TIMEOUT_MS = 300;

/** Per-photo pixel size used when compositing the strip (before export scaling). */
export const PHOTO_WIDTH = 600;
export const PHOTO_HEIGHT = 450;

/** Multiplier applied on download for a print-resolution PNG. */
export const EXPORT_SCALE = 3;
