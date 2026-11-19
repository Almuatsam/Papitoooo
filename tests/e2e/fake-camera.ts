import type { Page } from "@playwright/test";

/**
 * Replaces getUserMedia with a canvas-driven stream so every engine (including
 * ones with no fake-device flag) gets the same deterministic picture, and
 * reports several video inputs so the front/back switch shows up.
 */
export async function installFakeCamera(page: Page, options: { devices?: number } = {}): Promise<void> {
  await page.addInitScript((deviceCount) => {
    const w = 640;
    const h = 480;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const paint = () => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#1b3a8a");
      grad.addColorStop(0.5, "#d98c5f");
      grad.addColorStop(1, "#7fd6a2");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(w * 0.1, h * 0.15, w * 0.18, h * 0.22);
      ctx.fillStyle = "#fff3a0";
      ctx.beginPath();
      ctx.arc(w * 0.7, h * 0.35, h * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#101010";
      ctx.fillRect(w * 0.4, h * 0.6, w * 0.3, h * 0.25);
      ctx.fillStyle = "#c0392b";
      ctx.fillRect(w * 0.05, h * 0.65, w * 0.25, h * 0.2);
    };
    paint();
    setInterval(paint, 66);

    const media = {
      // A fresh capture stream per call, so stopping one never ends another.
      getUserMedia: async () => canvas.captureStream(15),
      enumerateDevices: async () =>
        Array.from({ length: deviceCount }, (_, i) => ({ kind: "videoinput", deviceId: `cam${i}`, label: `cam${i}`, groupId: "" })),
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    };
    Object.defineProperty(navigator, "mediaDevices", { value: media, configurable: true });
  }, options.devices ?? 2);
}

/** No camera API at all, like some in-app browsers. */
export async function removeCamera(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", { value: undefined, configurable: true });
  });
}
