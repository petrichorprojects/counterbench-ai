import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

function toDataUrlPng(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function htmlTemplate(args: { title: string; body: string }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(args.title)}</title>
    <style>
      :root {
        --bg0: #070B14;
        --bg1: #0B1220;
        --bg2: #0A1326;
        --muted: rgba(226,232,240,0.88);
        --border: rgba(148,163,184,0.25);
      }
      html, body { margin: 0; padding: 0; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
      .bg {
        width: 100vw;
        height: 100vh;
        background:
          radial-gradient(1200px 600px at 15% 15%, rgba(99,102,241,0.32), rgba(0,0,0,0) 60%),
          radial-gradient(900px 500px at 90% 30%, rgba(34,211,238,0.16), rgba(0,0,0,0) 55%),
          linear-gradient(135deg, var(--bg0) 0%, var(--bg1) 45%, var(--bg2) 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .card {
        border: 1px solid var(--border);
        background: rgba(2,6,23,0.35);
        border-radius: 18px;
      }
      .pill {
        display: inline-flex;
        gap: 10px;
        align-items: center;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(2,6,23,0.35);
        color: rgba(226,232,240,0.92);
        font-size: 13px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-weight: 700;
      }
      .mark {
        width: 12px;
        height: 12px;
        border-radius: 4px;
        background: linear-gradient(180deg, #A78BFA 0%, #6366F1 60%, #22D3EE 100%);
      }
    </style>
  </head>
  <body>
    ${args.body}
  </body>
</html>`;
}

function avatarBody(args: { markDataUrl: string }) {
  return `<div class="bg">
    <div class="card" style="width: 78vmin; height: 78vmin; display: flex; align-items: center; justify-content: center;">
      <img src="${args.markDataUrl}" alt="Counterbench mark" style="width: 62%; height: auto; filter: drop-shadow(0 12px 30px rgba(0,0,0,0.5));" />
    </div>
  </div>`;
}

function coverBody(args: { markDataUrl: string }) {
  return `<div class="bg" style="justify-content: flex-start;">
    <div style="width: 100%; height: 100%; padding: 44px 56px; display: flex; flex-direction: column; justify-content: space-between;">
      <div style="display:flex; align-items:center; gap:14px;">
        <div class="mark" aria-hidden="true"></div>
        <div style="display:flex; gap:10px; align-items:baseline;">
          <div style="font-size: 18px; letter-spacing: 3px; font-weight: 900;">COUNTERBENCH</div>
          <div style="font-size: 18px; letter-spacing: 3px; font-weight: 900; opacity: 0.85;">AI</div>
        </div>
        <div class="pill" style="margin-left: 10px;">The Bench Test</div>
      </div>

      <div style="max-width: 980px;">
        <div style="font-size: 56px; line-height: 1.04; font-weight: 950; letter-spacing: -1.5px;">Bench-tested legal AI workflows.</div>
        <div style="margin-top: 12px; font-size: 22px; line-height: 1.3; color: var(--muted);">Templates included. One issue per week: what to adopt, what to ignore, and implementation risks.</div>
      </div>

      <div style="display:flex; align-items:flex-end; justify-content: space-between; gap: 16px;">
        <div style="display:flex; gap: 10px; flex-wrap: wrap;">
          <div class="pill" style="text-transform:none; letter-spacing: 0; font-weight: 700;">Workflows</div>
          <div class="pill" style="text-transform:none; letter-spacing: 0; font-weight: 700;">Tool shortlists</div>
          <div class="pill" style="text-transform:none; letter-spacing: 0; font-weight: 700;">Checklists</div>
          <div class="pill" style="text-transform:none; letter-spacing: 0; font-weight: 700;">Kits</div>
        </div>
        <img src="${args.markDataUrl}" alt="" style="width: 80px; height: auto; opacity: 0.9;" />
      </div>
    </div>
  </div>`;
}

async function main() {
  const root = process.cwd();
  const outDir = path.join(root, "out", "beehiiv");
  fs.mkdirSync(outDir, { recursive: true });

  const markPath = path.join(root, "public", "logos", "counterbench-mark-mono.png");
  const markDataUrl = toDataUrlPng(fs.readFileSync(markPath));

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Avatar (square)
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(htmlTemplate({ title: "Counterbench Avatar", body: avatarBody({ markDataUrl }) }), { waitUntil: "load" });
  await page.screenshot({ path: path.join(outDir, "counterbench-beehiiv-avatar-512.png") });

  // Cover (wide)
  await page.setViewportSize({ width: 1600, height: 400 });
  await page.setContent(htmlTemplate({ title: "Counterbench Cover", body: coverBody({ markDataUrl }) }), { waitUntil: "load" });
  await page.screenshot({ path: path.join(outDir, "counterbench-beehiiv-cover-1600x400.png") });

  await page.close();
  await browser.close();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

