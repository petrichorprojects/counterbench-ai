import { defineConfig, devices } from "@playwright/test";

// Default port is 3100, not 3000: reuseExistingServer=true means anything already
// listening on the port (Grafana runs on 3000 on this machine) silently becomes the
// system under test and the whole suite fails against the wrong app.
const port = process.env.E2E_PORT || "3100";
const baseURL = process.env.E2E_BASE_URL || `http://127.0.0.1:${port}`;
const isRemote = Boolean(process.env.E2E_SKIP_WEBSERVER) || Boolean(process.env.E2E_BASE_URL);
// Default to prod build + next start so behavior matches Vercel and avoids dev overlays.
const webServerMode = (process.env.E2E_WEBSERVER_MODE || "prod").toLowerCase();
const webServerCommand =
  webServerMode === "prod"
    // Build is handled by the npm script (or a previous run); keep the webServer command as start-only.
    ? `npx next start -H 127.0.0.1 -p ${port}`
    : `npm run dev -- -H 127.0.0.1 -p ${port}`;
const webServerTimeout = webServerMode === "prod" ? 600_000 : 120_000;

export default defineConfig({
  testDir: "tests/e2e",
  // Asserts the server at baseURL is actually this app before any test runs.
  globalSetup: "./tests/e2e/global-setup.ts",
  // In constrained environments (like sandboxes), writing into the repo can be blocked.
  // Use a temp output directory by default.
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || "/tmp/counterbench-playwright",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  retries: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: process.env.PLAYWRIGHT_REPORT_DIR || "/tmp/counterbench-playwright-report", open: "never" }]
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ],
  webServer: isRemote
    ? undefined
    : {
        command: webServerCommand,
        url: baseURL,
        // Reuse locally for fast iteration, but never in CI: a squatted port there
        // must fail loud instead of silently testing whatever process holds it.
        reuseExistingServer: !process.env.CI,
        timeout: webServerTimeout
      }
});
