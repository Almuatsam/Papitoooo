/**
 * Renders strips in a real browser (the app's /dev-preview page, driven by
 * scripts/render-captions.py) and checks where each caption was drawn.
 * Needs python with playwright, Pillow and numpy. Starts `next dev` itself
 * unless CAPTION_TEST_URL points at a running one.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { spawn, execFileSync } = require("child_process");

const root = path.resolve(__dirname, "../..");
const baseline = require("../layouts/fixtures/caption-baseline.json");

const PORT = 3124;
const SHORT = "First try";
const LONG = "Congratulations Almuatasam 2026";
const COLOUR = "#FFC30B";
const CLEARANCE = 18;
const MAX_WIDTH = 560;
const CENTRE_TOLERANCE = 2;

/** layout -> caption centre x and the free band (top, bottom), in frame pixels. */
const SQU_SLOTS = {
  "strip-4": { cx: 536, band: [230, 364] },
  "double-strip-4": { cx: 536, band: [230, 364] },
  "strip-3": { cx: 536, band: [467, 602] },
  "grid-6": { cx: 536, band: [230, 364] },
  "single-portrait": { cx: 491, band: [230, 364] },
  "single-landscape": { cx: 626, band: [230, 364] },
  "triple-horizontal": { cx: 581, band: [230, 364] },
  "asymmetric-3": { cx: 536, band: [230, 364] },
  "asymmetric-4": { cx: 533, band: [230, 364] },
};

let server = null;
let baseUrl = process.env.CAPTION_TEST_URL;
let rendered = [];

async function waitForServer(url) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).status < 500) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`dev server did not start at ${url}`);
}

function render(jobs) {
  const out = execFileSync("python", [path.join(root, "scripts/render-captions.py"), baseUrl, JSON.stringify(jobs)], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(out);
}

test.before(async () => {
  if (!baseUrl) {
    baseUrl = `http://localhost:${PORT}`;
    server = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "dev", "-p", String(PORT)], { cwd: root, stdio: "ignore" });
  }
  await waitForServer(baseUrl);
  const squJobs = Object.keys(SQU_SLOTS).flatMap((layout) => [SHORT, LONG].map((caption) => ({ theme: "squ", layout, caption })));
  const legacyJobs = baseline.map(({ theme, layout, caption }) => ({ theme, layout, caption }));
  rendered = render([...squJobs, ...legacyJobs]);
});

test.after(() => {
  if (server) {
    try {
      execFileSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    } catch {
      server.kill();
    }
  }
});

const find = (theme, layout, caption) => rendered.find((r) => r.theme === theme && r.layout === layout && r.caption === caption);

test("SQU: the caption sits in the band, centred on the photos, in #FFC30B", async (t) => {
  for (const [layout, slot] of Object.entries(SQU_SLOTS)) {
    for (const caption of [SHORT, LONG]) {
      await t.test(`${layout}: "${caption}"`, () => {
        const r = find("squ", layout, caption);
        assert.ok(r.bbox, "something was drawn");
        const [x0, y0, x1, y1] = r.bbox;
        assert.ok(y0 >= slot.band[0] + CLEARANCE, `top ${y0} is within ${CLEARANCE}px of the band top ${slot.band[0]}`);
        assert.ok(y1 <= slot.band[1] - CLEARANCE, `bottom ${y1} is within ${CLEARANCE}px of the band bottom ${slot.band[1]}`);
        assert.ok(x1 - x0 <= MAX_WIDTH, `${x1 - x0}px wide, max ${MAX_WIDTH}`);
        assert.ok(Math.abs((x0 + x1) / 2 - slot.cx) <= CENTRE_TOLERANCE, `centre ${(x0 + x1) / 2} vs ${slot.cx}`);
        assert.equal(r.topColour, COLOUR);
      });
    }
  }
});

test("themes without the caption box draw their captions where they did before", async (t) => {
  for (const b of baseline) {
    await t.test(`${b.theme} ${b.layout}: "${b.caption}"`, () => {
      const r = find(b.theme, b.layout, b.caption);
      assert.deepEqual(r.size, b.size, "canvas size");
      assert.deepEqual(r.bbox, b.bbox, "caption bounds");
      assert.equal(r.pixels, b.pixels, "caption pixel count");
    });
  }
});
