import { test, expect } from "@playwright/test";

test.describe("Search workspace", () => {
  test("tabs filter by type and platform filter appears for tools/agents", async ({ page }) => {
    await page.goto("/search?q=contract");

    const root = page.locator("[data-search-root]");
    await expect(root).toBeVisible();

    // Wait for initial results to render.
    await expect(page.locator("[data-search-result-item]").first()).toBeVisible();

    const tablist = page.getByRole("tablist", { name: "Result type" });
    await expect(tablist).toBeVisible();

    await page.getByRole("tab", { name: /Prompts/i }).click();
    await expect(page.getByRole("tab", { name: /Prompts/i })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByLabel("Platform")).toBeVisible();
    await expect(page.locator("#platform")).toBeDisabled();

    await page.getByRole("tab", { name: /Tools/i }).click();
    await expect(page.getByRole("tab", { name: /Tools/i })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#platform")).toBeEnabled();

    const first = page.locator("[data-search-result-item]").first();
    await expect(first).toBeVisible();
    await expect(first).toHaveAttribute("href", /\/tools\//);
  });
});
