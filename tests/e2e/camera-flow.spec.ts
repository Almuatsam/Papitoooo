import fs from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { FILTERS } from "../../lib/filters";
import { installFakeCamera, removeCamera } from "./fake-camera";

/** One-photo layout keeps each session to a single 3-2-1 countdown. */
async function openCamera(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("photobooth.layoutId", "single-portrait");
    } catch {
      // storage blocked; the default layout still works, just slower
    }
  });
  await page.goto("/");
  await page.getByRole("button", { name: /^start$/i }).first().click();
  await expect(page.getByTestId("start-session")).toBeEnabled({ timeout: 30_000 });
}

async function downloadStrip(page: Page): Promise<Buffer> {
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 60_000 }),
    page.getByRole("button", { name: /download strip/i }).click(),
  ]);
  const path = await download.path();
  return fs.readFileSync(path);
}

/** Mean absolute channel difference (0-255) between two PNG buffers, decoded in the page. */
async function meanDiff(page: Page, a: Buffer, b: Buffer): Promise<number> {
  return page.evaluate(
    async ([x, y]) => {
      const load = (b64: string) =>
        new Promise<ImageData>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement("canvas");
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const ctx = c.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            resolve(ctx.getImageData(0, 0, c.width, c.height));
          };
          img.onerror = reject;
          img.src = `data:image/png;base64,${b64}`;
        });
      const [ia, ib] = await Promise.all([load(x), load(y)]);
      if (ia.width !== ib.width || ia.height !== ib.height) return 255;
      let sum = 0;
      for (let i = 0; i < ia.data.length; i += 4) {
        sum += Math.abs(ia.data[i] - ib.data[i]) + Math.abs(ia.data[i + 1] - ib.data[i + 1]) + Math.abs(ia.data[i + 2] - ib.data[i + 2]);
      }
      return sum / ((ia.data.length / 4) * 3);
    },
    [a.toString("base64"), b.toString("base64")],
  );
}

/** Some engines (Playwright WebKit) cannot fake a camera stream: canvas.captureStream is missing. */
async function canFakeCamera(page: Page): Promise<boolean> {
  await page.goto("about:blank");
  return page.evaluate(() => typeof document.createElement("canvas").captureStream === "function");
}

/** A deterministic test photo, as a PNG file the fallback input can take. */
async function makePhoto(page: Page): Promise<Buffer> {
  const dataUrl = await page.evaluate(() => {
    const w = 640;
    const h = 480;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#1b3a8a");
    grad.addColorStop(0.5, "#d98c5f");
    grad.addColorStop(1, "#7fd6a2");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(w * 0.1, h * 0.15, w * 0.18, h * 0.22);
    ctx.fillStyle = "#101010";
    ctx.fillRect(w * 0.4, h * 0.6, w * 0.3, h * 0.25);
    return c.toDataURL("image/png");
  });
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

test.describe("camera flow", () => {
  test("the screen flash covers the whole viewport and the photo is taken while it is on", async ({ page }) => {
    await installFakeCamera(page);
    test.skip(!(await canFakeCamera(page)), "this engine cannot fake a camera stream");
    await openCamera(page);
    await page.evaluate(() => {
      const seen: Array<{ stage: string | null; w: number; h: number; z: string }> = [];
      (window as unknown as { __flashSeen: typeof seen }).__flashSeen = seen;
      new MutationObserver(() => {
        const el = document.querySelector("[data-testid=flash-overlay]");
        if (!el) return;
        const r = el.getBoundingClientRect();
        const stage = el.getAttribute("data-stage");
        if (!seen.some((x) => x.stage === stage)) seen.push({ stage, w: r.width, h: r.height, z: getComputedStyle(el).zIndex });
      }).observe(document.body, { subtree: true, childList: true, attributes: true });
    });
    await page.getByTestId("start-session").click();

    const overlay = page.getByTestId("flash-overlay");
    await expect(overlay).toBeVisible({ timeout: 15_000 });
    const viewport = page.viewportSize()!;
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __flashSeen: Array<{ stage: string }> }).__flashSeen.map((x) => x.stage)))
      .toContain("hold");
    const seen = await page.evaluate(() => (window as unknown as { __flashSeen: Array<{ stage: string; w: number; h: number; z: string }> }).__flashSeen);
    const hold = seen.find((x) => x.stage === "hold")!;
    expect(Math.round(hold.w)).toBe(viewport.width);
    expect(Math.round(hold.h)).toBe(viewport.height);
    expect(Number(hold.z)).toBeGreaterThanOrEqual(9999);

    // The strip is built only after the grab, so reaching the result proves the grab happened.
    await expect(page.getByRole("button", { name: /download strip/i })).toBeVisible({ timeout: 30_000 });
    await expect(overlay).toHaveCount(0);
  });

  test("front camera is mirrored, back camera is not", async ({ page }) => {
    await installFakeCamera(page);
    test.skip(!(await canFakeCamera(page)), "this engine cannot fake a camera stream");
    await openCamera(page);
    const video = page.getByTestId("camera-video");
    await expect(video).toHaveClass(/-scale-x-100/);
    await page.getByTestId("switch-camera").click();
    await expect(video).not.toHaveClass(/-scale-x-100/);
    await expect(page.getByTestId("start-session")).toBeEnabled({ timeout: 15_000 });
  });

  test("no camera API: shows the open-in-browser hint and a working file fallback", async ({ page }) => {
    await removeCamera(page);
    await page.addInitScript(() => window.localStorage.setItem("photobooth.layoutId", "single-portrait"));
    await page.goto("/");
    await page.getByRole("button", { name: /^start$/i }).first().click();
    await expect(page.getByTestId("open-in-browser")).toBeVisible({ timeout: 30_000 });
    const input = page.getByTestId("fallback-input");
    await expect(input).toHaveAttribute("capture", "user");
    await expect(input).toHaveAttribute("accept", "image/*");

    const dataUrl = await page.evaluate(() => {
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 48;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#3366cc";
      ctx.fillRect(0, 0, 64, 48);
      return c.toDataURL("image/png");
    });
    const png = Buffer.from(dataUrl.split(",")[1], "base64");
    await input.setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: png });
    await expect(page.getByRole("button", { name: /download strip/i })).toBeVisible({ timeout: 30_000 });
  });

  test("every filter changes the preview and the exported strip", async ({ page }, testInfo) => {
    test.setTimeout(900_000);
    await installFakeCamera(page);
    const live = await canFakeCamera(page);
    if (live) await openCamera(page);
    else {
      // No fakeable camera in this engine: photos come in through the file fallback, which feeds the same filters.
      await page.addInitScript(() => window.localStorage.setItem("photobooth.layoutId", "single-portrait"));
      await page.goto("/");
      await page.getByRole("button", { name: /^start$/i }).first().click();
      await expect(page.getByTestId("fallback-input")).toBeAttached({ timeout: 30_000 });
    }
    const photo = live ? null : await makePhoto(page);
    const stage = page.getByTestId("camera-stage");

    const results: string[] = [];
    let naturalPreview: Buffer | undefined;
    let naturalStrip: Buffer | undefined;

    for (const filter of FILTERS) {
      await page.getByRole("radio", { name: filter.label, exact: true }).click();
      let preview: Buffer | undefined;
      let mode = "none (file fallback)";
      if (live) {
        // Let the preview settle on the new filter.
        await page.waitForTimeout(600);
        preview = await stage.screenshot();
        mode = (await stage.getAttribute("data-preview-mode")) ?? "";
        await page.getByTestId("start-session").click();
      } else {
        await page.getByTestId("fallback-input").setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: photo! });
      }
      await expect(page.getByRole("button", { name: /download strip/i })).toBeVisible({ timeout: 60_000 });
      const strip = await downloadStrip(page);

      if (filter.id === "natural") {
        naturalPreview = preview;
        naturalStrip = strip;
      } else {
        const stripDiff = await meanDiff(page, strip, naturalStrip!);
        let previewNote = "";
        if (preview && naturalPreview) {
          const previewDiff = await meanDiff(page, preview, naturalPreview);
          previewNote = ` preview diff=${previewDiff.toFixed(1)}`;
          expect(previewDiff, `${filter.id} preview differs from natural`).toBeGreaterThan(1);
        }
        results.push(`${filter.id}: preview(${mode})${previewNote} strip diff=${stripDiff.toFixed(1)}`);
        expect(stripDiff, `${filter.id} strip differs from natural`).toBeGreaterThan(1);
      }

      await page.getByRole("button", { name: /^retake$/i }).click();
      if (live) await expect(page.getByTestId("start-session")).toBeEnabled({ timeout: 30_000 });
      else await expect(page.getByTestId("fallback-input")).toBeAttached({ timeout: 30_000 });
    }
    console.log([`[${testInfo.project.name}]`, ...results].join(String.fromCharCode(10)));
  });
});
