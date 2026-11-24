import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests run against the static export (built with fixture headlines: `npm run fixtures && npm run build`),
 * served the way GitHub Pages serves it. Locally they use your installed Chrome; CI installs Chromium.
 */
const PORT = 4173;
const local = !process.env.CI;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !local,
  retries: local ? 0 : 1,
  reporter: local ? "list" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    ...(local ? { channel: "chrome" } : {}),
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], ...(local ? { channel: "chrome" } : {}) } },
    { name: "phone", use: { ...devices["Pixel 7"], ...(local ? { channel: "chrome" } : {}) } },
  ],
  webServer: {
    command: `node scripts/serve-static.mjs out ${PORT}`,
    port: PORT,
    reuseExistingServer: local,
  },
});
