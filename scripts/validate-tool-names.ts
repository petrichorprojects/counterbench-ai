import fs from "node:fs";
import path from "node:path";

type ToolRow = { slug: string; name: string; url: string };

type Status =
  | "ok"
  | "mismatch"
  | "fetch_error"
  | "non_html"
  | "skipped_auth"
  | "no_title";

type Result = {
  slug: string;
  name: string;
  url: string;
  final_url?: string;
  host?: string;
  status: Status;
  http_status?: number;
  title?: string;
  h1?: string;
  og_title?: string;
  candidate?: string;
  score?: number;
  method?: string;
  reason?: string;
};

function argValue(key: string): string | null {
  const idx = process.argv.findIndex((a) => a === `--${key}` || a.startsWith(`--${key}=`));
  if (idx === -1) return null;
  const a = process.argv[idx] ?? "";
  if (a.includes("=")) return a.split("=").slice(1).join("=") || "";
  const next = process.argv[idx + 1];
  return typeof next === "string" ? next : "";
}

function argInt(key: string, fallback: number): number {
  const raw = argValue(key);
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function listToolFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b));
}

function readTools(toolsDir: string): ToolRow[] {
  const files = listToolFiles(toolsDir);
  const out: ToolRow[] = [];
  for (const f of files) {
    const full = path.join(toolsDir, f);
    const raw = fs.readFileSync(full, "utf8");
    const j = JSON.parse(raw) as any;
    const slug = String(j.slug ?? "").trim();
    const name = String(j.name ?? "").trim();
    const url = String(j.url ?? "").trim();
    if (!slug || !name || !url) continue;
    out.push({ slug, name, url });
  }
  return out;
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(input: string): string {
  return decodeEntities(input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]{1,300}?)<\/title>/i);
  if (!m) return null;
  const s = stripTags(m[1] ?? "");
  return s || null;
}

function extractFirstH1(html: string): string | null {
  const m = html.match(/<h1[^>]*>([\s\S]{1,800}?)<\/h1>/i);
  if (!m) return null;
  const s = stripTags(m[1] ?? "");
  return s || null;
}

function escapeRe(s: string): string {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function extractMeta(html: string, attr: "property" | "name", value: string): string | null {
  const re = new RegExp(`<meta[^>]+${attr}=["']${escapeRe(value)}["'][^>]*>`, "i");
  const m = html.match(re);
  if (!m) return null;
  const tag = m[0] ?? "";
  const c = tag.match(/content=["']([^"']{1,600})["']/i);
  if (!c) return null;
  const s = decodeEntities(c[1] ?? "");
  return s || null;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenScore(a: string, b: string): number {
  const ta = new Set(normalize(a).split(" ").filter(Boolean));
  const tb = new Set(normalize(b).split(" ").filter(Boolean));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  const denom = Math.max(ta.size, tb.size);
  return inter / denom;
}

function matchName(name: string, candidate: string): { ok: boolean; score: number; method: string } {
  const n = normalize(name);
  const c = normalize(candidate);
  if (!n || !c) return { ok: false, score: 0, method: "empty" };

  if (n === c) return { ok: true, score: 1, method: "exact" };

  // Common patterns like: "Name - Site".
  if (c.startsWith(n) && n.split(" ").length >= 2) return { ok: true, score: 0.97, method: "prefix" };

  // Substring match only if both are multi-token.
  const nTokens = n.split(" ").filter(Boolean).length;
  const cTokens = c.split(" ").filter(Boolean).length;
  if ((c.includes(n) || n.includes(c)) && Math.min(nTokens, cTokens) >= 2) {
    return { ok: true, score: 0.95, method: "substring" };
  }

  const score = tokenScore(name, candidate);
  if (score >= 0.8) return { ok: true, score, method: "token" };
  return { ok: false, score, method: "token" };
}

const SKIP_HOSTS = new Set(["chat.openai.com", "platform.openai.com", "claude.ai"]);

async function readHtml(url: string, opts: { timeoutMs: number; maxBytes: number; ua: string }) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "user-agent": opts.ua,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });

    const finalUrl = res.url;
    const status = res.status;
    const contentType = res.headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("text/html")) {
      return { status, finalUrl, contentType, body: null as string | null };
    }

    const reader = res.body?.getReader();
    if (!reader) {
      const body = await res.text();
      return { status, finalUrl, contentType, body };
    }

    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > opts.maxBytes) {
        ctrl.abort();
        break;
      }
      chunks.push(value);
    }
    const buf = Buffer.concat(chunks);
    const body = buf.toString("utf8");
    return { status, finalUrl, contentType, body };
  } finally {
    clearTimeout(t);
  }
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const contentRoot = argValue("contentRoot") || "content";
  const concurrency = argInt("concurrency", 6);
  const timeoutMs = argInt("timeoutMs", 20000);
  const perHostDelayMs = argInt("perHostDelayMs", 250);
  const maxBytes = argInt("maxBytes", 1_500_000);

  const root = process.cwd();
  const toolsDir = path.join(root, contentRoot, "tools");
  const outJson = argValue("outJson") || path.join(root, "out", "name-validation.json");
  const outCsv = argValue("outCsv") || path.join(root, "out", "name-validation.csv");

  const tools = readTools(toolsDir);
  if (tools.length === 0) {
    console.error(`No tools found in ${toolsDir}`);
    process.exit(1);
  }

  const ua = "CounterbenchNameValidator/1.0";
  const lastByHost = new Map<string, number>();

  let nextIdx = 0;
  const results: Result[] = [];

  async function worker() {
    while (true) {
      const i = nextIdx;
      nextIdx += 1;
      const tool = tools[i];
      if (!tool) return;

      let host = "";
      try {
        host = new URL(tool.url).hostname.replace(/^www\./, "").toLowerCase();
      } catch {
        results.push({ slug: tool.slug, name: tool.name, url: tool.url, status: "fetch_error", reason: "invalid_url" });
        continue;
      }

      if (SKIP_HOSTS.has(host)) {
        results.push({ slug: tool.slug, name: tool.name, url: tool.url, host, status: "skipped_auth", reason: "auth_required" });
        continue;
      }

      const last = lastByHost.get(host) ?? 0;
      const now = Date.now();
      const wait = Math.max(0, perHostDelayMs - (now - last));
      if (wait > 0) await sleep(wait);
      lastByHost.set(host, Date.now());

      try {
        const res = await readHtml(tool.url, { timeoutMs, maxBytes, ua });

        if (res.status < 200 || res.status >= 400) {
          results.push({
            slug: tool.slug,
            name: tool.name,
            url: tool.url,
            host,
            http_status: res.status,
            final_url: res.finalUrl,
            status: "fetch_error",
            reason: `http_${res.status}`
          });
          continue;
        }

        if (res.body === null) {
          results.push({
            slug: tool.slug,
            name: tool.name,
            url: tool.url,
            host,
            http_status: res.status,
            final_url: res.finalUrl,
            status: "non_html",
            reason: `content_type:${res.contentType || "unknown"}`
          });
          continue;
        }

        const html = res.body;
        const og = extractMeta(html, "property", "og:title");
        const tw = extractMeta(html, "name", "twitter:title");
        const title = extractTitle(html);
        const h1 = extractFirstH1(html);

        // Prefer H1 on TAAFT, otherwise OG/title.
        const preferH1 = host === "theresanaiforthat.com";
        const candidates = [
          preferH1 ? h1 : og,
          preferH1 ? og : h1,
          tw,
          title
        ].filter((x): x is string => Boolean(x && x.trim()));

        if (candidates.length === 0) {
          results.push({
            slug: tool.slug,
            name: tool.name,
            url: tool.url,
            host,
            http_status: res.status,
            final_url: res.finalUrl,
            status: "no_title",
            reason: "no_title_or_h1",
            og_title: og ?? undefined,
            title: title ?? undefined,
            h1: h1 ?? undefined
          });
          continue;
        }

        let best = { ok: false, score: 0, method: "none", candidate: candidates[0] as string };
        for (const c of candidates) {
          const m = matchName(tool.name, c);
          if (m.score > best.score) best = { ...m, candidate: c };
          if (m.ok && m.score >= 0.97) break;
        }

        results.push({
          slug: tool.slug,
          name: tool.name,
          url: tool.url,
          host,
          http_status: res.status,
          final_url: res.finalUrl,
          og_title: og ?? undefined,
          title: title ?? undefined,
          h1: h1 ?? undefined,
          status: best.ok ? "ok" : "mismatch",
          candidate: best.candidate,
          score: Number(best.score.toFixed(3)),
          method: best.method,
          reason: best.ok ? undefined : "name_does_not_match"
        });
      } catch (e) {
        results.push({
          slug: tool.slug,
          name: tool.name,
          url: tool.url,
          host,
          status: "fetch_error",
          reason: (e as Error).message
        });
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, () => worker()));

  const summary = results.reduce(
    (acc, r) => {
      acc.total += 1;
      acc.byStatus[r.status] = (acc.byStatus[r.status] ?? 0) + 1;
      return acc;
    },
    { total: 0, byStatus: {} as Record<string, number> }
  );

  ensureDir(path.dirname(outJson));
  fs.writeFileSync(
    outJson,
    JSON.stringify(
      {
        generated_at_iso: new Date().toISOString(),
        content_root: contentRoot,
        tools_dir: toolsDir,
        summary,
        results
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  const esc = (v: string) => {
    const s = String(v ?? "");
    if (/[\n\r,\"]/g.test(s)) return `"${s.replace(/\"/g, '""').replace(/\n/g, " ").replace(/\r/g, " ")}"`;
    return s;
  };

  const header = [
    "slug",
    "status",
    "http_status",
    "host",
    "name",
    "candidate",
    "score",
    "method",
    "url",
    "final_url",
    "reason"
  ];

  const lines = [header.join(",")];
  for (const r of results) {
    lines.push(
      [
        r.slug,
        r.status,
        String(r.http_status ?? ""),
        r.host ?? "",
        r.name,
        r.candidate ?? "",
        String(r.score ?? ""),
        r.method ?? "",
        r.url,
        r.final_url ?? "",
        r.reason ?? ""
      ]
        .map(esc)
        .join(",")
    );
  }
  ensureDir(path.dirname(outCsv));
  fs.writeFileSync(outCsv, lines.join("\n") + "\n", "utf8");

  console.log(JSON.stringify(summary, null, 2));
  console.log(`Wrote: ${outJson}`);
  console.log(`Wrote: ${outCsv}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
