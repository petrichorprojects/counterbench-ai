// Generate all Counterbench "Counterframe" logo assets from a single geometry.
// Run: node scripts/generate-logo-assets.mjs
// Produces: mark SVGs (light/dark/mono), wordmark SVGs + PNGs, and favicons (16/32/180/ico/svg).
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGOS = join(ROOT, "public", "logos");
const PUBLIC = join(ROOT, "public");

// --- Brand ---------------------------------------------------------------
const NAVY = "#33415b";       // primary.700 (Bench Navy)
const CRIMSON = "#a12e46";    // accent (Counter Crimson) — light backgrounds
const STEEL = "#aab9d1";      // primary.300 — mark ink on dark backgrounds
const CRIMSON_LT = "#e06a80"; // accent tint — dark backgrounds
const INK_ON_NAVY = "#eef2f8";// bracket ink inside the navy favicon tile

// Counterframe geometry (96x96 box). Crimson bracket = navy bracket rotated 180deg about center.
const NAVY_D = "M30 69V30H60";
const CRIMSON_D = "M66 27V66H36";
const bracket = (d, stroke, w) =>
  `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

const markSvg = (navyCol, crimsonCol, w = 13) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="Counterbench">` +
  bracket(NAVY_D, navyCol, w) + bracket(CRIMSON_D, crimsonCol, w) + `</svg>\n`;

// Favicon: self-contained navy rounded tile so it reads on any browser chrome.
const faviconSvg = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="Counterbench">` +
  `<rect width="96" height="96" rx="21" fill="${NAVY}"/>` +
  bracket(NAVY_D, INK_ON_NAVY, 14) + bracket(CRIMSON_D, CRIMSON_LT, 14) + `</svg>\n`;

// Wordmark lockup. Text uses a system grotesque stack (matches the live header).
const FONT = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const wordmarkSvg = (wordCol, crimsonCol) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 452 96" role="img" aria-label="counterbench.ai">` +
  `<g transform="translate(0 8)">` + bracket(NAVY_D, wordCol, 13).replace("<path", "<path transform='scale(0.83)'") +
  bracket(CRIMSON_D, crimsonCol, 13).replace("<path", "<path transform='scale(0.83)'") + `</g>` +
  `<text x="96" y="64" font-family="${FONT}" font-size="54" font-weight="800" letter-spacing="-2.2">` +
  `<tspan fill="${wordCol}">counterbench</tspan><tspan fill="${crimsonCol}">.ai</tspan></text></svg>\n`;

// --- Write SVGs ----------------------------------------------------------
const files = {
  [join(LOGOS, "counterbench-mark.svg")]: markSvg(NAVY, CRIMSON),
  [join(LOGOS, "counterbench-mark-dark.svg")]: markSvg(STEEL, CRIMSON_LT),
  [join(LOGOS, "counterbench-mark-accent.svg")]: markSvg(NAVY, CRIMSON), // legacy filename kept in sync
  [join(LOGOS, "counterbench-mark-onemono.svg")]: markSvg("currentColor", "currentColor"),
  [join(LOGOS, "counterbench-wordmark.svg")]: wordmarkSvg(NAVY, CRIMSON),
  [join(LOGOS, "counterbench-wordmark-dark.svg")]: wordmarkSvg("#f2f5fa", CRIMSON_LT),
  [join(PUBLIC, "favicon.svg")]: faviconSvg()
};
for (const [p, c] of Object.entries(files)) writeFileSync(p, c);

// --- Rasterize -----------------------------------------------------------
const buf = (svg) => Buffer.from(svg);
const png = (svg, size) => sharp(buf(svg)).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png();

const fav = faviconSvg();
await png(fav, 16).toFile(join(PUBLIC, "favicon-16.png"));
await png(fav, 32).toFile(join(PUBLIC, "favicon-32.png"));
await png(fav, 180).toFile(join(PUBLIC, "apple-touch-icon.png"));

// Mono mark PNG (navy on transparent) — used by scripts/generate-beehiiv-brand-assets.ts
await sharp(buf(markSvg(NAVY, NAVY, 13))).resize(240, 240, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(join(LOGOS, "counterbench-mark-mono.png"));

// Wordmark PNGs (fix the old white-on-transparent assets: primary = navy for light bg, mono = single-tone)
const wmPng = (svg, h) => sharp(buf(svg), { density: 300 }).resize({ height: h }).png();
await wmPng(wordmarkSvg(NAVY, CRIMSON), 120).toFile(join(LOGOS, "counterbench-wordmark-primary.png"));
await wmPng(wordmarkSvg(NAVY, NAVY), 120).toFile(join(LOGOS, "counterbench-wordmark-mono.png"));

// --- favicon.ico (embed 16 + 32 PNG payloads) ----------------------------
const ico16 = await png(fav, 16).toBuffer();
const ico32 = await png(fav, 32).toBuffer();
const entries = [{ size: 16, data: ico16 }, { size: 32, data: ico32 }];
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(entries.length, 4);
let offset = 6 + entries.length * 16;
const dir = Buffer.concat(entries.map((e) => {
  const b = Buffer.alloc(16);
  b.writeUInt8(e.size % 256, 0); b.writeUInt8(e.size % 256, 1);
  b.writeUInt16LE(1, 4); b.writeUInt16LE(32, 6);
  b.writeUInt32LE(e.data.length, 8); b.writeUInt32LE(offset, 12);
  offset += e.data.length; return b;
}));
writeFileSync(join(PUBLIC, "favicon.ico"), Buffer.concat([header, dir, ...entries.map((e) => e.data)]));

process.stdout.write("Counterframe assets generated.\n");
