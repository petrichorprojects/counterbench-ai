import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "out", "qa-guides-visual-2026-03-08");
const FIXTURES_DIR = path.join(OUT_DIR, "fixtures");

type GuideCase = {
  slug: string;
  expectedDownloads: Array<{ labelContains: string; hrefEndsWith: string }>;
};

const guides: GuideCase[] = [
  {
    slug: "defensible-ai-doc-review-protocol-2026",
    expectedDownloads: [
      { labelContains: "Protocol", hrefEndsWith: ".docx" },
      { labelContains: "QA", hrefEndsWith: ".xlsx" },
      { labelContains: "Sampling", hrefEndsWith: ".xlsx" },
      { labelContains: "One-page", hrefEndsWith: ".pdf" }
    ]
  },
  {
    slug: "ai-privilege-log-triage-2026",
    expectedDownloads: [
      { labelContains: "Privilege", hrefEndsWith: ".xlsx" },
      { labelContains: "QA", hrefEndsWith: ".xlsx" },
      { labelContains: "One-page", hrefEndsWith: ".pdf" }
    ]
  },
  {
    slug: "redaction-checklist-before-production-2026",
    expectedDownloads: [
      { labelContains: "Redaction", hrefEndsWith: ".xlsx" },
      { labelContains: "One-page", hrefEndsWith: ".pdf" }
    ]
  },
  {
    slug: "deposition-prep-workflow-2026",
    expectedDownloads: [
      { labelContains: "Exhibit", hrefEndsWith: ".xlsx" },
      { labelContains: "One-page", hrefEndsWith: ".pdf" }
    ]
  },
  {
    slug: "qa-sampling-ai-assisted-review-2026",
    expectedDownloads: [
      { labelContains: "Sampling", hrefEndsWith: ".xlsx" },
      { labelContains: "QA", hrefEndsWith: ".xlsx" },
      { labelContains: "One-page", hrefEndsWith: ".pdf" }
    ]
  }
];

const viewports = [
  { name: "desktop", size: { width: 1280, height: 720 } },
  { name: "tablet", size: { width: 834, height: 1112 } },
  { name: "mobile", size: { width: 390, height: 844 } }
] as const;

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function copyDirRecursive(src: string, dst: string) {
  ensureDir(dst);
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dst, ent.name);
    if (ent.isDirectory()) copyDirRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

function rewriteHtmlForFileFixture(html: string): string {
  return (
    html
      // Next static assets
      .replaceAll('href="/_next/', 'href="./_next/')
      .replaceAll('src="/_next/', 'src="./_next/')
      // Site CSS
      .replaceAll('href="/css/', 'href="./css/')
      // Favicons
      .replaceAll('href="/favicon', 'href="./favicon')
      .replaceAll('href="/apple-touch-icon', 'href="./apple-touch-icon')
  );
}

function assertDownloadFileLooksValid(args: { href: string; contentTypeHint: "pdf" | "xlsx" | "docx" }) {
  expect(args.href.startsWith("/downloads/")).toBeTruthy();
  const diskPath = path.join(process.cwd(), "public", args.href.slice(1));
  expect(fs.existsSync(diskPath), `missing download asset on disk: ${diskPath}`).toBeTruthy();

  const buf = fs.readFileSync(diskPath);
  if (args.contentTypeHint === "pdf") expect(buf.slice(0, 4).toString("utf8")).toBe("%PDF");
  if (args.contentTypeHint === "xlsx") expect(buf.slice(0, 2).toString("binary")).toBe("PK");
  if (args.contentTypeHint === "docx") expect(buf.slice(0, 2).toString("binary")).toBe("PK");
}

function ensureGuideFixtures() {
  ensureDir(FIXTURES_DIR);

  const nextStaticSrc = path.join(process.cwd(), ".next", "static");
  const nextStaticDst = path.join(FIXTURES_DIR, "_next", "static");
  if (!fs.existsSync(nextStaticSrc)) {
    throw new Error(`Missing ${nextStaticSrc}. Run \`npm run build\` first.`);
  }
  copyDirRecursive(nextStaticSrc, nextStaticDst);

  const publicCssSrc = path.join(process.cwd(), "public", "css", "style.css");
  const publicCssDst = path.join(FIXTURES_DIR, "css", "style.css");
  ensureDir(path.dirname(publicCssDst));
  fs.copyFileSync(publicCssSrc, publicCssDst);

  for (const icon of ["favicon-32.png", "favicon-16.png", "apple-touch-icon.png", "favicon.ico"]) {
    const src = path.join(process.cwd(), "public", icon);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(FIXTURES_DIR, icon));
  }

  for (const g of guides) {
    const htmlSrc = path.join(process.cwd(), ".next", "server", "app", "guides", `${g.slug}.html`);
    if (!fs.existsSync(htmlSrc)) {
      throw new Error(`Missing ${htmlSrc}. Ensure guides are statically generated during \`npm run build\`.`);
    }
    const html = fs.readFileSync(htmlSrc, "utf8");
    fs.writeFileSync(path.join(FIXTURES_DIR, `${g.slug}.html`), rewriteHtmlForFileFixture(html), "utf8");
  }
}

test.describe("Guides — content + visual QA (world-class set)", () => {
  test.use({ javaScriptEnabled: false });
  test.beforeAll(() => {
    ensureOutDir();
    ensureGuideFixtures();
  });

  for (const g of guides) {
    test(`guide renders + assets valid (static fixture): ${g.slug}`, async ({ page }) => {
      const filePath = path.join(FIXTURES_DIR, `${g.slug}.html`);
      await page.goto(`file://${filePath}`);

      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("#tldr .label").getByText("TL;DR", { exact: true })).toBeVisible();
      await expect(page.locator("#download-kit .label").getByText("Download the kit", { exact: true })).toBeVisible();
      await expect(page.locator("#worked-example .label").getByText("Worked example", { exact: true })).toBeVisible();
      await expect(page.locator("#workflow-fit .label").getByText("Workflow fit (comparison)", { exact: true })).toBeVisible();
      await expect(page.locator("#changelog .label").getByText("Changelog", { exact: true })).toBeVisible();

      // Expand one Worked example to ensure content is visible.
      const workedExample = page.locator("details").filter({ hasText: "Example:" }).first();
      await workedExample.scrollIntoViewIfNeeded();
      await workedExample.click();
      await expect(workedExample.getByText("Scenario", { exact: true })).toBeVisible();

      // Downloads: presence and reachability.
      const downloadButtons = page.locator('a.btn.btn--secondary.btn--sm[href^="/downloads/"]');
      expect(await downloadButtons.count()).toBeGreaterThan(0);

      for (const exp of g.expectedDownloads) {
        const btn = downloadButtons.filter({ hasText: exp.labelContains }).first();
        await expect(btn, `Missing download button containing '${exp.labelContains}'`).toBeVisible();
        const href = await btn.getAttribute("href");
        expect(href).toBeTruthy();
        expect(href!).toContain("/downloads/");
        expect(href!.endsWith(exp.hrefEndsWith), `Expected ${href} to end with ${exp.hrefEndsWith}`).toBeTruthy();

        const hint = exp.hrefEndsWith === ".pdf" ? "pdf" : exp.hrefEndsWith === ".xlsx" ? "xlsx" : "docx";
        assertDownloadFileLooksValid({ href: href!, contentTypeHint: hint });
      }

      for (const vp of viewports) {
        await page.setViewportSize(vp.size);
        await page.goto(`file://${filePath}`, { waitUntil: "load" });
        await page.waitForTimeout(250); // allow layout settle

        await page.screenshot({ path: path.join(OUT_DIR, `${g.slug}.${vp.name}.png`), fullPage: true });
      }
    });
  }
});
