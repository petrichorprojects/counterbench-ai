#!/usr/bin/env node
/**
 * check-pricing-drift.mjs
 *
 * Guards against pricing drift between the live pricing pages and the
 * agent-readable pricing surface (public/pricing.md, per PRD-agent-readable-pricing).
 *
 * What it does:
 *   1. Extracts tier names + prices from:
 *        - app/(marketing)/paralegals/page.tsx  (the `tiers` const, plus `addOns`)
 *        - app/(marketing)/advisory/page.tsx    (the pricing-name / pricing-price JSX)
 *   2. If public/pricing.md exists:
 *        - every dollar figure in pricing.md must appear somewhere in the pages
 *        - every extracted TIER price must appear in pricing.md
 *      On any mismatch: prints a diff-style report and exits 1.
 *   3. If public/pricing.md does not exist: prints "no pricing.md, skipping"
 *      and exits 0.
 *
 * Usage (from repo root):
 *   node scripts/check-pricing-drift.mjs
 *
 * Deliberately NOT wired into the package.json build. Run it manually before
 * committing pricing changes, or wire it into CI once pricing.md ships.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const PARALEGALS = join(root, "app", "(marketing)", "paralegals", "page.tsx");
const ADVISORY = join(root, "app", "(marketing)", "advisory", "page.tsx");
const PRICING_MD = join(root, "public", "pricing.md");

/** Normalize a dollar string for comparison: "$6,500/mo" -> "$6500". */
function normalize(dollar) {
  const m = dollar.match(/\$\s?([\d,]+(?:\.\d+)?)\s*([KkMm])?/);
  if (!m) return null;
  return "$" + m[1].replace(/,/g, "") + (m[2] ? m[2].toUpperCase() : "");
}

/** All dollar figures in a string, normalized. */
function allDollars(text) {
  const out = new Set();
  for (const m of text.matchAll(/\$\s?[\d][\d,]*(?:\.\d+)?[KkMm]?/g)) {
    const n = normalize(m[0]);
    if (n) out.add(n);
  }
  return out;
}

/** Slice out a `const NAME = [ ... ];` block from a source file. */
function constBlock(source, name) {
  const start = source.indexOf(`const ${name} = [`);
  if (start === -1) return "";
  const end = source.indexOf("];", start);
  return end === -1 ? "" : source.slice(start, end);
}

/** Extract { name, price } pairs from an array-of-objects const block. */
function extractPairs(block) {
  const pairs = [];
  // Objects are separated by "},"; each carries name: "..." and price: "..."
  for (const chunk of block.split(/\}\s*,/)) {
    const name = chunk.match(/name:\s*"([^"]+)"/);
    const price = chunk.match(/price:\s*"(\$[^"]+)"/);
    if (name && price) pairs.push({ name: name[1], price: price[1] });
  }
  return pairs;
}

// --- 1. Extract from the pages -------------------------------------------

const paralegalsSrc = readFileSync(PARALEGALS, "utf8");
const advisorySrc = readFileSync(ADVISORY, "utf8");

const tiers = [];

// Paralegals: `tiers` const is the source of truth for the retainer tiers.
for (const p of extractPairs(constBlock(paralegalsSrc, "tiers"))) {
  tiers.push({ page: "paralegals", ...p });
}
if (tiers.length === 0) {
  console.error("ERROR: could not extract any tiers from " + PARALEGALS);
  process.exit(1);
}

// Paralegals add-ons: not tiers, but their figures are legitimate pricing.md content.
const addOns = extractPairs(constBlock(paralegalsSrc, "addOns")).map((p) => ({
  page: "paralegals (add-on)",
  ...p,
}));

// Advisory: JSX pattern <div className="pricing-name">X</div> ... <div className="pricing-price">$N<span>
for (const m of advisorySrc.matchAll(
  /className="pricing-name">([^<]+)<\/div>\s*<div className="pricing-price">\s*(\$[\d,]+)/g
)) {
  tiers.push({ page: "advisory", name: m[1].trim(), price: m[2] });
}

const knownFigures = new Set([...allDollars(paralegalsSrc), ...allDollars(advisorySrc)]);

console.log("Extracted tiers:");
for (const t of [...tiers, ...addOns]) {
  console.log(`  [${t.page}] ${t.name}: ${t.price}`);
}

// --- 2. Compare against pricing.md ---------------------------------------

if (!existsSync(PRICING_MD)) {
  console.log("no pricing.md, skipping");
  process.exit(0);
}

const pricingMd = readFileSync(PRICING_MD, "utf8");
const mdFigures = allDollars(pricingMd);

const errors = [];

// (a) Every dollar figure in pricing.md must exist somewhere on the pages.
for (const fig of mdFigures) {
  if (!knownFigures.has(fig)) {
    errors.push(`pricing.md has ${fig} but no pricing page contains it`);
  }
}

// (b) Every tier price on the pages must appear in pricing.md.
for (const t of tiers) {
  const fig = normalize(t.price);
  if (fig && !mdFigures.has(fig)) {
    errors.push(`[${t.page}] tier "${t.name}" (${t.price}) is missing from pricing.md`);
  }
}

if (errors.length > 0) {
  console.error("\nPRICING DRIFT DETECTED between pages and public/pricing.md:");
  for (const e of errors) console.error("  - " + e);
  console.error("\nFix pricing.md (or the page) so both carry the same numbers.");
  process.exit(1);
}

console.log(`\nOK: pricing.md matches (${mdFigures.size} figures checked, ${tiers.length} tiers).`);
