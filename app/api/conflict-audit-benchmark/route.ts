import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conflictAuditBenchmarksTable } from "@/lib/db/schema";
import { normalizeBenchmark, type BenchmarkInput } from "@/lib/conflict-benchmark";

// Force dynamic + node runtime — this hits the DB at request time and must not
// be evaluated during the build's page-data collection.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// In-memory rate limit: 10 POSTs per IP per hour. The IP is used ONLY for
// throttling and is never stored — benchmark rows carry no PII (see schema).
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, hits] of ipHits) {
    const valid = hits.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) ipHits.delete(ip);
    else ipHits.set(ip, valid);
  }
}, 10 * 60 * 1000).unref();

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0];
    return first ? first.trim() : "unknown";
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  if (isRateLimited(getClientIp(req))) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const json = (await req.json().catch(() => null)) as BenchmarkInput | null;
  if (!json) {
    return NextResponse.json({ ok: false, message: "Invalid body" }, { status: 400 });
  }

  const row = normalizeBenchmark(json);
  if ("error" in row) {
    return NextResponse.json({ ok: false, message: row.error }, { status: 400 });
  }

  try {
    await db.insert(conflictAuditBenchmarksTable).values(row);
  } catch (err) {
    // Graceful degradation: if the table hasn't been pushed to the DB yet, or
    // the DB is briefly unavailable, do not break the visitor's experience —
    // the benchmark is optional and the client only needs a 200 to say thanks.
    // Logged so a missing-table state is visible in Vercel logs.
    console.error({ event: "conflict_benchmark_insert_failed", err: String(err) });
    return NextResponse.json({ ok: true, persisted: false });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
