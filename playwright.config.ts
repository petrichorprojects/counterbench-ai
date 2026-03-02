import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const isRemote = Boolean(process.env.E2E_SKIP_WEBSERVER) || Boolean(process.env.E2E_BASE_URL);
// Default to prod build + next start so behavior matches Vercel and avoids dev overlays.
const webServerMode = (process.env.E2E_WEBSERVER_MODE || "prod").toLowerCase();
const webServerCommand =
  webServerMode === "prod"
    // Avoid racing builds when e2e is run alongside other commands.
    ? "bash -lc 'test -f .next/BUILD_ID || npm run build; npx next start -p 3000'"
    : "npm run dev -- -p 3000";
const webServerTimeout = webServerMode === "prod" ? 600_000 : 120_000;

export default defineConfig({
  testDir: "tests/e2e",
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
        reuseExistingServer: true,
        timeout: webServerTimeout
      }
});
