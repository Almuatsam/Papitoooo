import path from "node:path";
import { build } from "esbuild";
import type { Page } from "@playwright/test";

const root = path.resolve(__dirname, "../..");
let bundle: Promise<string> | undefined;

/** Bundles the filter code into one IIFE so a blank page can run it in any browser engine. */
function getBundle(): Promise<string> {
  bundle ??= build({
    entryPoints: [path.join(__dirname, "harness-entry.ts")],
    bundle: true,
    write: false,
    format: "iife",
    target: "es2019",
    alias: { "@": root },
  }).then((r) => r.outputFiles[0].text);
  return bundle;
}

export async function loadHarness(page: Page): Promise<void> {
  await page.goto("about:blank");
  await page.addScriptTag({ content: await getBundle() });
}
