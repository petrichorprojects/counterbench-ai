import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const isRemote = Boolean(process.env.E2E_SKIP_WEBSERVER) || Boolean(process.env.E2E_BASE_URL);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  retries: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "out/playwright-report", open: "never" }]
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

