import { expect, test } from "@playwright/test";

test.describe("Intake Leak Calculator", () => {
  test("recalculates the intake leak and routes to Paralegal Teams", async ({ page }) => {
    await page.goto("/tools/intake-leak-calculator");

    await expect(page.getByRole("heading", { name: /your phones are busy/i })).toBeVisible();
    await expect(page.getByTestId("monthly-leak")).toHaveText("3,675");
    await expect(page.getByText("15.8 hrs")).toBeVisible();

    await page.getByLabel("Serious-inquiry rate", { exact: true }).fill("20");
    await expect(page.getByTestId("monthly-leak")).toHaveText("3,341");
    await expect(page.getByText("14.4 hrs")).toBeVisible();

    const cta = page.getByRole("link", { name: /see counterbench paralegal teams/i });
    await expect(cta).toHaveAttribute("href", "/paralegals");
  });
});
