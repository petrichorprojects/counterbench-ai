import { expect, test } from "@playwright/test";

async function completeCalculator(page: import("@playwright/test").Page) {
  await page.getByLabel("Monthly software spend").fill("2000");
  await page.getByLabel("Build and migration time").fill("0");
  await page.getByLabel("Ongoing maintenance").fill("6");
  await page.getByLabel("Who owns the stack?").selectOption("managing-attorney");
  await page.getByLabel("Hourly value used for the estimate").fill("350");
  await page.getByLabel("Disruptions").fill("0");
  await page.getByLabel("Team time lost per disruption").fill("0");
  await page.getByRole("button", { name: "Calculate ownership cost" }).click();
}

test.describe("Law firm tech stack cost calculator", () => {
  test("calculates an ungated result and gives a next action", async ({ page }) => {
    await page.goto("/tools/law-firm-stack-cost-calculator");

    await expect(
      page.getByRole("heading", { name: "What is your law firm tech stack actually costing?" }),
    ).toBeVisible();

    await completeCalculator(page);

    const result = page.locator("#stack-cost-result");
    await expect(result).toBeVisible();
    await expect(result.getByText("$49,200", { exact: true })).toBeVisible();
    await expect(result.getByRole("heading", { name: "Hand off the operation" })).toBeVisible();
    await expect(result.getByRole("link", { name: "Review my stack" })).toHaveAttribute(
      "href",
      "/advisory?from=stack-cost-calculator",
    );
    await expect(result.getByRole("button", { name: "Email the breakdown" })).toBeVisible();
  });

  test("fits a mobile viewport without horizontal scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/tools/law-firm-stack-cost-calculator");
    await completeCalculator(page);

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
    await expect(page.locator("#stack-cost-result")).toBeVisible();
  });
});
