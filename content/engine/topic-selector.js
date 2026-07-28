#!/usr/bin/env node
/**
 * Topic Selector — CounterbenchAI Content Engine, Phase 1
 *
 * Queries Intel Radar Notion ledger for top-scored, unused items from the
 * last 7 days. Dedupes against published-log.json. Maps each item -> format
 * (text-post | carousel | infographic). Prints JSON for downstream generators.
 *
 * Usage (local test):
 *   NOTION_TOKEN=secret_xxx node topic-selector.js
 *
 * Usage (n8n): paste into a Code node, swap `process.env.NOTION_TOKEN`
 *   for `$credentials.notionApi.access_token`, and the file-read for an
 *   HTTP node fetching published-log.json from GitHub (or n8n Data Table).
 *
 * Output shape (stdout JSON):
 *   { week: "2026-W23", picks: [ {source_id,title,url,score,why,format}, ... ] }
 */

const fs = require("fs");
const path = require("path");

const NOTION_DB_ID = "f0f71f5c-342d-40df-ae57-4bc666b023cf";
const NOTION_VERSION = "2022-06-28";
const NOTION_TOKEN = process.env.NOTION_TOKEN;

const SCORE_MIN = 3.0;              // floor — Haiku 3.x scale 1-5
const LOOKBACK_DAYS = 7;            // weekly cadence
const N_PICKS = 2;                  // pilot default (per PRD §10)
const LOG_PATH = path.join(__dirname, "published-log.json");

if (!NOTION_TOKEN) {
  console.error("ERR: set NOTION_TOKEN env var");
  process.exit(1);
}

function isoDaysAgo(n) {
  const d = new Date(Date.now() - n * 86400 * 1000);
  return d.toISOString();
}

function isoWeek(d = new Date()) {
  // ISO week (1-53). Used to label drafts/YYYY-WW/.
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const wk = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(wk).padStart(2, "0")}`;
}

function pickFormat(item) {
  // Heuristic: choose format by signal shape.
  // - carousel: items with explicit framework/list/steps cues
  // - infographic: items with quantitative comparison cues
  // - text-post: default (opinion, news, single insight)
  const blob = `${item.title} ${item.why}`.toLowerCase();
  if (/\b(framework|steps|checklist|playbook|process|how to)\b/.test(blob)) return "carousel";
  if (/\b(\d+%|percent|vs\.?|comparison|benchmark|study|survey)\b/.test(blob)) return "infographic";
  return "text-post";
}

async function queryNotion() {
  // Single-page query — Intel Radar produces <30 items/week, no pagination needed.
  const body = {
    filter: {
      and: [
        { property: "haiku_score", number: { greater_than_or_equal_to: SCORE_MIN } },
        { property: "Posted At", date: { on_or_after: isoDaysAgo(LOOKBACK_DAYS) } },
        { property: "Triage", select: { does_not_equal: "Trash" } },
      ],
    },
    sorts: [{ property: "haiku_score", direction: "descending" }],
    page_size: 50,
  };
  const res = await fetch(
    `https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    throw new Error(`Notion ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.results.map((p) => ({
    source_id: p.id,
    title:
      p.properties.Title?.title?.[0]?.plain_text?.trim() ||
      "(untitled)",
    url: p.properties.URL?.url || "",
    score: p.properties.haiku_score?.number ?? 0,
    why: p.properties.why?.rich_text?.[0]?.plain_text?.trim() || "",
    permalink: p.properties["Slack Permalink"]?.url || "",
    domain: p.properties.domain?.select?.name || "",
  }));
}

function loadPublishedIds() {
  if (!fs.existsSync(LOG_PATH)) return new Set();
  const log = JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
  return new Set((log.published || []).map((e) => e.source_id));
}

(async () => {
  const items = await queryNotion();
  const used = loadPublishedIds();
  const fresh = items.filter((i) => !used.has(i.source_id));

  if (fresh.length === 0) {
    console.error(
      `WARN: 0 fresh items (queried ${items.length}, ${used.size} already used)`
    );
    console.log(JSON.stringify({ week: isoWeek(), picks: [] }, null, 2));
    return;
  }

  const picks = fresh.slice(0, N_PICKS).map((i) => ({
    ...i,
    format: pickFormat(i),
  }));

  console.log(
    JSON.stringify(
      {
        week: isoWeek(),
        queried: items.length,
        already_used: used.size,
        fresh_available: fresh.length,
        picks,
      },
      null,
      2
    )
  );
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
