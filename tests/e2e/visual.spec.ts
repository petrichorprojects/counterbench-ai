import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

const VISUAL = process.env.VISUAL === "1";

function setThemeInit(theme: "dark" | "light") {
  return {
    content: `
(() => {
  try { localStorage.setItem('cb_theme', '${theme}'); } catch (e) {}
})();`
  };
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

test.describe("Visual capture (opt-in)", () => {
  test.skip(!VISUAL, "Set VISUAL=1 to generate screenshots locally.");

  for (const theme of ["dark", "light"] as const) {
    test(`Homepage hero (${theme})`, async ({ page }) => {
      await page.addInitScript(setThemeInit(theme));
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto("/");

      const root = page.locator("[data-home-suggest-root]");
      await expect(root).toBeVisible();

      // Wait for the search index warm-up to settle so screenshots are stable.
      await page.waitForTimeout(750);

      const outDir = path.join(process.cwd(), "out", "visual");
      ensureDir(outDir);

      const hero = page.locator("#hero");
      await hero.screenshot({ path: path.join(outDir, `home-hero-${theme}.png`) });
    });
  }
});
