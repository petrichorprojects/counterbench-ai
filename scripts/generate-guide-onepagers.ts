import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { getGuideBySlug } from "../lib/guides";
import { absoluteUrl } from "../lib/seo";

const SLUGS = [
  "defensible-ai-doc-review-protocol-2026",
  "ai-privilege-log-triage-2026",
  "redaction-checklist-before-production-2026",
  "deposition-prep-workflow-2026",
  "qa-sampling-ai-assisted-review-2026"
] as const;

function takeFirstNChecklistBullets(args: { sections: Array<{ title: string; bullets: string[] }>; limit: number }) {
  const out: string[] = [];
  for (const s of args.sections) {
    for (const b of s.bullets) {
      out.push(b);
      if (out.length >= args.limit) return out;
    }
  }
  return out;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function onePagerHtml(args: {
  title: string;
  url: string;
  lastUpdated: string;
  quickAnswer: string;
  checklist: string[];
}) {
  const checklistLis = args.checklist.map((b) => `<li>${escapeHtml(b)}</li>`).join("");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(args.title)} — One-page kit</title>
    <style>
      @page { size: Letter; margin: 0.55in; }
      :root { --fg: #111827; --muted: #6b7280; --border: #e5e7eb; --bg: #ffffff; --soft: #f9fafb; --brand: #111827; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: var(--fg); background: var(--bg); }
      h1 { font-size: 22px; line-height: 1.15; margin: 12px 0 6px; letter-spacing: -0.02em; }
      a { color: var(--fg); }
      .pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 999px; border: 1px solid var(--border); font-size: 11px; color: var(--muted); }
      .pill__mark { width: 10px; height: 10px; border-radius: 3px; background: var(--brand); display: inline-block; }
      .meta { font-size: 12px; color: var(--muted); margin: 0 0 14px; }
      .grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
      .card { border: 1px solid var(--border); border-radius: 14px; padding: 12px 14px; background: var(--soft); }
      .label { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); font-weight: 700; margin-bottom: 8px; }
      .answer { font-size: 13px; line-height: 1.55; }
      ul { margin: 8px 0 0 18px; padding: 0; }
      li { margin: 0 0 6px; font-size: 13px; line-height: 1.45; }
      .cta { margin-top: 12px; font-size: 12px; color: var(--muted); }
      .footer { position: fixed; left: 0.55in; right: 0.55in; bottom: 0.35in; display: flex; justify-content: space-between; gap: 12px; font-size: 10px; color: var(--muted); }
    </style>
  </head>
  <body>
    <div class="pill"><span class="pill__mark" aria-hidden="true"></span><span>Counterbench.AI — One-page kit</span></div>
    <h1>${escapeHtml(args.title)}</h1>
    <div class="meta"><a href="${escapeHtml(args.url)}">${escapeHtml(args.url)}</a> · Last updated: ${escapeHtml(args.lastUpdated)}</div>

    <div class="grid">
      <div class="card">
        <div class="label">Quick answer</div>
        <div class="answer">${escapeHtml(args.quickAnswer)}</div>
      </div>
      <div class="card">
        <div class="label">Bench-tested checklist</div>
        <ul>${checklistLis}</ul>
        <div class="cta">Get templates + the full workflow: <a href="${escapeHtml(args.url)}">${escapeHtml(args.url)}</a></div>
      </div>
    </div>

    <div class="footer">
      <div>Not legal advice. Verify with primary sources and your team’s policies.</div>
      <div>counterbench.ai</div>
    </div>
  </body>
</html>`;
}

async function main() {
  const outDir = path.join(process.cwd(), "public", "downloads", "guides", "one-pagers");
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  for (const slug of SLUGS) {
    const guide = getGuideBySlug(slug);
    if (!guide) throw new Error(`Missing guide: ${slug}`);

    const url = absoluteUrl(`/guides/${guide.slug}`);
    const checklist = takeFirstNChecklistBullets({ sections: guide.operator_playbook, limit: 8 });
    const quickAnswer = guide.direct_answer?.trim() ? guide.direct_answer.trim() : guide.tldr.trim();

    const html = onePagerHtml({
      title: guide.title,
      url,
      lastUpdated: guide.last_updated,
      quickAnswer,
      checklist
    });

    await page.setContent(html, { waitUntil: "load" });
    const pdfPath = path.join(outDir, `${slug}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: "Letter",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0.55in", bottom: "0.55in", left: "0.55in", right: "0.55in" }
    });
  }

  await page.close();
  await context.close();
  await browser.close();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
