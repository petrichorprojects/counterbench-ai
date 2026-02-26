import { test, expect } from "@playwright/test";

test.describe("Homepage suggestions", () => {
  test("describe task -> suggests tools/prompts/skills", async ({ page }) => {
    await page.goto("/");

    const root = page.locator("[data-home-suggest-root]");
    await expect(root).toBeVisible();

    const box = root.getByRole("textbox", { name: "Describe your next deliverable" });
    await box.fill("contract review");

    await root.getByRole("button", { name: "Suggest" }).click();

    // At least one suggested item should appear.
    const first = root.locator("[data-home-suggest-item]").first();
    await expect(first).toBeVisible();

    // The suggestion should link into the library.
    const href = await first.getAttribute("href");
    expect(href).toMatch(/^\/(tools|prompts|skills)\//);

    // Should show a type pill.
    await expect(first.locator(".label--pill")).toBeVisible();
  });

  test("motion to compel -> prefers Motion Outline Starter over viability analysis", async ({ page }) => {
    await page.goto("/");

    const root = page.locator("[data-home-suggest-root]");
    const box = root.getByRole("textbox", { name: "Describe your next deliverable" });
    await box.fill("motion to compel");
    await root.getByRole("button", { name: "Suggest" }).click();

    const first = root.locator("[data-home-suggest-item]").first();
    await expect(first).toBeVisible();
    await expect(first).toContainText("Motion Outline Starter");
  });
});
