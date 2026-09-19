const SHARE_TITLE = "Photo Booth Strip";

/** Long enough for Safari to finish reading a large blob before it's released. */
const REVOKE_DELAY_MS = 10_000;

/** Touch-first devices only: on desktop, a share sheet is worse than a plain download. */
const COARSE_POINTER_QUERY = "(pointer: coarse)";

/** Decodes a base64 data URL to a Blob synchronously (no fetch hop, so a user gesture is less likely to expire). */
export function dataUrlToBlob(dataUrl: string): Blob {
  const commaIndex = dataUrl.indexOf(",");
  const mime = /^data:([^;,]+)/.exec(dataUrl)?.[1] ?? "image/png";
  const binary = atob(dataUrl.slice(commaIndex + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** iOS Safari drops downloads from raw `data:` URLs, so always go through an object URL. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

/** Opens the native share sheet (the reliable way to reach Photos on iOS). Returns false if unavailable, blocked, or dismissed. */
async function shareFile(file: File): Promise<boolean> {
  if (!window.matchMedia(COARSE_POINTER_QUERY).matches) return false;
  if (!navigator.canShare?.({ files: [file] })) return false;
  try {
    await navigator.share({ files: [file], title: SHARE_TITLE });
    return true;
  } catch {
    return false;
  }
}

/** Saves an image data URL: share sheet on touch devices, blob download everywhere else or as a fallback. */
export async function saveImage(dataUrl: string, filename: string = stripFilename()): Promise<void> {
  const blob = dataUrlToBlob(dataUrl);
  const file = new File([blob], filename, { type: blob.type });
  if (await shareFile(file)) return;
  downloadBlob(blob, filename);
}

/** e.g. "photobooth-2026-09-10.png" */
export function stripFilename(date = new Date()): string {
  const iso = date.toISOString().slice(0, 10);
  return `photobooth-${iso}.png`;
}
