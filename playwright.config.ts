import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const isRemote = Boolean(process.env.E2E_SKIP_WEBSERVER) || Boolean(process.env.E2E_BASE_URL);

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
        command: "npm run build && npx next start -p 3000",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 180_000
      }
});
