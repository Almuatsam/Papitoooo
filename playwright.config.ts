import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Browser tests. Every engine runs the same specs; phone profiles use the
 * device descriptors Playwright ships for an iPhone (WebKit) and a Pixel
 * (Chromium). Firefox has no mobile emulation, so it gets a phone-sized
 * viewport instead.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  webServer: process.env.PW_NO_SERVER
    ? undefined
    : {
    command: process.env.PW_DEV ? `npx next dev -p ${PORT}` : `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox-desktop", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"] } },
    { name: "chromium-pixel", use: { ...devices["Pixel 7"] } },
    { name: "webkit-iphone", use: { ...devices["iPhone 14"] } },
    { name: "firefox-phone", use: { browserName: "firefox", viewport: { width: 390, height: 844 } } },
  ],
});
