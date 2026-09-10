/** Triggers a browser download for a data URL. Ported from the reference project. */
export function downloadImage(dataUrl: string, filename?: string): void {
  const link = document.createElement("a");
  link.download = filename ?? `photobooth-${Date.now()}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** e.g. "photobooth-2026-09-10.png" */
export function stripFilename(date = new Date()): string {
  const iso = date.toISOString().slice(0, 10);
  return `photobooth-${iso}.png`;
}
