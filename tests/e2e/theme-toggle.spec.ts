import { test, expect } from "@playwright/test";

test.describe("Theme toggle", () => {
  test("toggles theme, persists, and uses a crescent moon icon", async ({ page }) => {
    // Force a deterministic start state.
    await page.addInitScript(() => {
      try {
        // addInitScript runs on every navigation; use sessionStorage to only clear once for this tab.
        if (!sessionStorage.getItem("__cb_theme_test_cleared")) {
          localStorage.removeItem("cb_theme");
          sessionStorage.setItem("__cb_theme_test_cleared", "1");
        }
      } catch {
        // ignore
      }
    });

    await page.goto("/");

    const toggle = page.locator(".cb-theme-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("role", "switch");
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect(toggle).toHaveAttribute("data-state", "dark");

    // Ensure the dark icon is a proper crescent/halfmoon.
    const moonPath = page.locator(".cb-theme-toggle__icon--dark svg path");
    await expect(moonPath).toHaveAttribute("d", "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await expect(toggle).toHaveAttribute("data-state", "light");

    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe("light");
    const stored = await page.evaluate(() => localStorage.getItem("cb_theme"));
    expect(stored).toBe("light");

    await page.reload();
    const toggleAfterReload = page.locator(".cb-theme-toggle");
    await expect(toggleAfterReload).toHaveAttribute("aria-checked", "true");
    await expect(toggleAfterReload).toHaveAttribute("data-state", "light");

    // Keyboard accessibility: Space toggles.
    await toggleAfterReload.focus();
    await page.keyboard.press("Space");
    await expect(toggleAfterReload).toHaveAttribute("aria-checked", "false");
    await expect(toggleAfterReload).toHaveAttribute("data-state", "dark");
  });
});
