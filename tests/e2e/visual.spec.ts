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

  test("Guides + Insights (desktop + mobile)", async ({ page }) => {
    await page.addInitScript(setThemeInit("dark"));
    const outDir = path.join(process.cwd(), "out", "visual");
    ensureDir(outDir);

    // Desktop
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto("/guides");
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(outDir, "guides-index-desktop.png"), fullPage: false });

    await page.goto("/guides/defensible-ai-doc-review-protocol-2026");
    await page.waitForTimeout(650);
    await page.screenshot({ path: path.join(outDir, "guide-detail-desktop-top.png"), fullPage: false });
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(outDir, "guide-detail-desktop-scrolled.png"), fullPage: false });

    await page.goto("/insights");
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(outDir, "insights-index-desktop.png"), fullPage: false });

    await page.goto("/insights/defensible-ai-doc-review-protocol-2026");
    await page.waitForTimeout(650);
    await page.screenshot({ path: path.join(outDir, "insight-detail-desktop-top.png"), fullPage: false });
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(outDir, "insight-detail-desktop-scrolled.png"), fullPage: false });

    // Mobile
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/guides/defensible-ai-doc-review-protocol-2026");
    await page.waitForTimeout(650);
    await page.screenshot({ path: path.join(outDir, "guide-detail-mobile-top.png"), fullPage: false });
    await page.evaluate(() => window.scrollTo(0, 980));
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(outDir, "guide-detail-mobile-sticky-cta.png"), fullPage: false });

    await page.goto("/insights/defensible-ai-doc-review-protocol-2026");
    await page.waitForTimeout(650);
    await page.screenshot({ path: path.join(outDir, "insight-detail-mobile-top.png"), fullPage: false });
    await page.evaluate(() => window.scrollTo(0, 980));
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(outDir, "insight-detail-mobile-sticky-cta.png"), fullPage: false });
  });
});
