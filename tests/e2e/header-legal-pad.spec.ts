import { test, expect } from "@playwright/test";

test.describe("Header: Legal Pad placement", () => {
  test("Legal Pad is a top-level button (not inside AI Law Library dropdown)", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("nav[aria-label='Main navigation']");
    await expect(header).toBeVisible();

    // Top-level button/link should exist in the header.
    const legalPadTop = header.getByRole("link", { name: "Legal Pad" });
    await expect(legalPadTop).toBeVisible();

    // Open dropdown and confirm Legal Pad isn't one of the menu items.
    const libraryBtn = header.getByRole("button", { name: "AI Law Library" });
    await libraryBtn.click();

    const dropdown = header.getByRole("menu", { name: "AI Law Library" });
    await expect(dropdown).toBeVisible();
    await expect(dropdown.getByRole("menuitem", { name: "Legal Pad" })).toHaveCount(0);

    // Navigate via the top-level Legal Pad button.
    await page.keyboard.press("Escape");
    await legalPadTop.click();
    await expect(page).toHaveURL(/\/legal-pad$/);

    // Basic sanity check the page rendered.
    await expect(page.locator("main .label", { hasText: "Legal Pad" }).first()).toBeVisible();
  });
});
