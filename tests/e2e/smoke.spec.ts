import { test, expect } from "@playwright/test";

test.describe("Counterbench smoke", () => {
  test("Header: AI Law Library dropdown has distinct items and navigates", async ({ page }) => {
    await page.goto("/");

    const libraryBtn = page.getByRole("button", { name: "AI Law Library" });
    await expect(libraryBtn).toBeVisible();

    await libraryBtn.click();
    const menu = page.getByRole("menu", { name: "AI Law Library" });
    await expect(menu).toBeVisible();

    const items = [
      "Tools",
      "Collections",
      "Compare",
      "Playbooks",
      "Prompts",
      "Prompt packs",
      "Skills",
      "Insights",
      "Resources"
    ];

    for (const label of items) {
      await expect(page.getByRole("menuitem", { name: label })).toBeVisible();
    }

    await page.getByRole("menuitem", { name: "Tools" }).click();
    await expect(page).toHaveURL(/\/tools$/);
  });

  test("Global search: returns results and navigates on Enter", async ({ page }) => {
    await page.goto("/");
    const input = page.getByRole("textbox", { name: "Global search" });
    await expect(input).toBeVisible();

    await input.fill("contract");
    await expect(page.getByRole("listbox", { name: "Search results" })).toBeVisible();

    // Ensure at least one result renders.
    const firstResult = page.getByRole("option").first();
    await expect(firstResult).toBeVisible();

    // Enter navigates to the active result.
    await input.press("Enter");
    await expect(page).toHaveURL(/\/(tools|playbooks|prompts|skills)\//);
  });

  test("Tools directory: loads, has descriptions, no placeholder text, compare flow works", async ({ page }) => {
    await page.goto("/tools");
    await expect(page.getByRole("heading", { name: "Legal AI tools" })).toBeVisible();

    // Total count present.
    await expect(page.getByText(/^\d+\s+tools$/)).toBeVisible();

    // First tool card should show a non-empty description and not show placeholder.
    const firstCard = page.locator(".card").filter({ has: page.locator('a[href^="/tools/"]') }).first();
    await expect(firstCard).toBeVisible();

    const desc = firstCard.locator(".text-muted").first();
    await expect(desc).toBeVisible();
    await expect(desc).not.toContainText(/pending verification/i);
    await expect(desc).toHaveText(/.{12,}/);

    // Add to compare from directory.
    const addBtn = firstCard.getByRole("button", { name: "Add to compare" });
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await expect(firstCard.getByRole("button", { name: "In compare" })).toBeVisible();

    // Compare page should hydrate from localStorage and show a compare table.
    await page.goto("/tools/compare");
    await expect(page.getByRole("heading", { name: "Compare tools" })).toBeVisible();
    await expect(page.getByText(/Selected\s+\(\d+\)/)).toBeVisible();

    // Client-side hydration should add tools param and render table headers.
    await expect(page.getByText(/Current query param:\s+.+/)).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Tool" })).toBeVisible();
  });

  test("Playbooks: list loads, triage wizard generates a playbook, copy buttons enable", async ({ page, context }) => {
    // Ensure clipboard API is available.
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/playbooks");
    await expect(page.getByRole("heading", { name: "Workflows you can actually use." })).toBeVisible();

    await page.goto("/playbooks/triage");
    await expect(page.getByRole("heading", { name: "Generate a workflow playbook." })).toBeVisible();
    await expect(page.getByText(/Step\s+1\s+of\s+3/)).toBeVisible();

    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText(/Step\s+2\s+of\s+3/)).toBeVisible();
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText(/Step\s+3\s+of\s+3/)).toBeVisible();

    await page.getByRole("link", { name: "Generate playbook" }).click();
    await expect(page).toHaveURL(/\/playbooks\/.+\?/);
    await expect(page.getByRole("heading")).toBeVisible();

    const actions = page.getByLabel("Playbook actions");
    await expect(actions).toBeVisible();

    // Copy buttons should be enabled after hydration on localhost.
    await expect(actions.getByRole("button", { name: "Copy link" })).toBeEnabled();
    await expect(actions.getByRole("button", { name: "Copy markdown" })).toBeEnabled();
  });

  test("Legal pages and SEO endpoints: privacy/terms/eula + sitemap/robots + search index", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /privacy/i })).toBeVisible();

    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: /terms/i })).toBeVisible();

    await page.goto("/eula");
    await expect(page.getByRole("heading", { name: /end user license/i })).toBeVisible();

    const robots = await page.request.get(new URL("/robots.txt", page.url()).toString());
    expect(robots.ok()).toBeTruthy();

    const sitemap = await page.request.get(new URL("/sitemap.xml", page.url()).toString());
    expect(sitemap.ok()).toBeTruthy();
    const sitemapText = await sitemap.text();
    expect(sitemapText).toContain("<urlset");
    expect(sitemapText).toContain("/tools/");
    expect(sitemapText).toContain("/playbooks/");

    const idx = await page.request.get(new URL("/search-index.json", page.url()).toString());
    expect(idx.ok()).toBeTruthy();
    const idxJson = (await idx.json()) as { docs?: unknown[] };
    expect(Array.isArray(idxJson.docs)).toBeTruthy();
    expect((idxJson.docs as unknown[]).length).toBeGreaterThan(50);
  });
});
