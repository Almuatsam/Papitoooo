import { expect, test } from "@playwright/test";
import { FILTERS } from "../../lib/filters";
import { loadHarness } from "./harness";

const MAX_DIFF = 6;
const MEAN_DIFF = 2;

/* eslint-disable @typescript-eslint/no-explicit-any */
test.describe("filter parity: native ctx.filter vs pixel fallback", () => {
  test("every css function used by a filter has a pixel implementation", async ({ page }) => {
    await loadHarness(page);
    const unsupported = await page.evaluate(() => (window as any).harness.unsupported);
    for (const entry of unsupported) expect(entry.bad, entry.id).toEqual([]);
  });

  for (const id of FILTERS.map((f) => f.id)) {
    test(`native and pixel paths match: ${id}`, async ({ page, browserName }) => {
      await loadHarness(page);
      const native = await page.evaluate(() => (window as any).harness.nativeSupported());
      test.skip(!native, `${browserName} has no native ctx.filter; parity is checked where it exists`);
      const { max, mean } = await page.evaluate((filterId) => {
        const h = (window as any).harness;
        const a: number[] = h.render(filterId, false);
        const b: number[] = h.render(filterId, true);
        let maxDiff = 0;
        let sum = 0;
        let n = 0;
        for (let i = 0; i < a.length; i += 4) {
          for (let c = 0; c < 3; c++) {
            const d = Math.abs(a[i + c] - b[i + c]);
            if (d > maxDiff) maxDiff = d;
            sum += d;
            n++;
          }
        }
        return { max: maxDiff, mean: sum / n };
      }, id);
      console.log(`[parity] ${id}: max=${max} mean=${mean.toFixed(3)}`);
      expect(max, "max channel diff").toBeLessThanOrEqual(MAX_DIFF);
      expect(mean, "mean channel diff").toBeLessThanOrEqual(MEAN_DIFF);
    });
  }

  test("pixel path changes the image for every non-natural filter", async ({ page }) => {
    await loadHarness(page);
    const ids: string[] = await page.evaluate(() => (window as any).harness.filterIds);
    for (const id of ids.filter((i) => i !== "natural")) {
      const changed = await page.evaluate((filterId) => {
        const h = (window as any).harness;
        const a: number[] = h.render("natural", true);
        const b: number[] = h.render(filterId, true);
        let sum = 0;
        for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
        return sum / a.length;
      }, id);
      expect(changed, `${id} differs from natural`).toBeGreaterThan(0.5);
    }
  });

  test("heaviest filter, 4 photos at export size, stays fast on the pixel path", async ({ page, browserName }) => {
    await loadHarness(page);
    const ms: number = await page.evaluate(() => (window as any).harness.timeFilter("cybercore", true, 4, 1800, 1350));
    console.log(`[perf] cybercore x4 @1800x1350 pixel path: ${Math.round(ms)} ms`);
    // The product budget is 2 s on an iPhone 11 (check it by hand, see docs/manual-device-checklist.md).
    // Chromium here is the closest stand-in and holds the real budget. The Firefox and WebKit builds
    // Playwright ships run slower and these tests share the CPU, so they get a regression guard.
    expect(ms).toBeLessThan(browserName === "chromium" ? 2000 : 3500);
  });
});
