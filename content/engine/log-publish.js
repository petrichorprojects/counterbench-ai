#!/usr/bin/env node
/**
 * log-publish.js — append a published draft to published-log.json.
 *
 * Run on Mon AM after posting an approved draft to LinkedIn.
 *
 * Usage:
 *   node log-publish.js \
 *     --source-id "<notion-page-id>" \
 *     --title "AI briefs sanctions" \
 *     --format text-post \
 *     --asset "drafts/2026-W23/post-ai-briefs-sanctions.md" \
 *     --permalink "https://linkedin.com/posts/..."
 *
 * Or minimal (status=approved, no permalink yet):
 *   node log-publish.js --source-id "<id>" --title "..." --format text-post --asset "..." --status approved
 *
 * Verify:
 *   node log-publish.js --list
 */

const fs = require("fs");
const path = require("path");

const LOG_PATH = path.join(__dirname, "published-log.json");

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (!k.startsWith("--")) continue;
    const key = k.slice(2);
    if (key === "list") { out.list = true; continue; }
    out[key] = argv[++i];
  }
  return out;
}

function loadLog() {
  const raw = JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
  raw.published = raw.published || [];
  return raw;
}

function saveLog(log) {
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + "\n");
}

const args = parseArgs(process.argv);

if (args.list) {
  const log = loadLog();
  console.log(`Published log (${log.published.length} entries):`);
  log.published.slice(-10).forEach((e, i) => {
    console.log(`  ${i + 1}. [${e.status}] ${e.format} · ${e.source_title} · ${e.published_date || "unpublished"}`);
  });
  process.exit(0);
}

// Required fields
const required = ["source-id", "title", "format", "asset"];
const missing = required.filter((k) => !args[k]);
if (missing.length) {
  console.error(`ERR: missing --${missing.join(" --")}`);
  console.error("Run with --list to inspect existing entries.");
  process.exit(1);
}

const validFormats = ["text-post", "carousel", "infographic"];
if (!validFormats.includes(args.format)) {
  console.error(`ERR: --format must be one of: ${validFormats.join(", ")}`);
  process.exit(1);
}

const validStatuses = ["drafted", "approved", "published", "killed"];
const status = args.status || (args.permalink ? "published" : "approved");
if (!validStatuses.includes(status)) {
  console.error(`ERR: --status must be one of: ${validStatuses.join(", ")}`);
  process.exit(1);
}

const log = loadLog();

// Dedup: refuse to add same source_id twice unless explicitly forced
if (log.published.find((e) => e.source_id === args["source-id"]) && !args.force) {
  console.error(`ERR: source_id ${args["source-id"]} already in log. Use --force to override.`);
  process.exit(1);
}

const entry = {
  source_id: args["source-id"],
  source_title: args.title,
  format: args.format,
  asset_path: args.asset,
  status,
  published_date: status === "published" ? new Date().toISOString().slice(0, 10) : null,
  permalink: args.permalink || null,
};

log.published.push(entry);
saveLog(log);

console.log(`OK: logged ${entry.source_id} [${entry.status}] (${log.published.length} total)`);
