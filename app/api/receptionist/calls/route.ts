import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { receptionistCallsTable } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

// Force dynamic — DB-backed route, must not be evaluated at build time.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Call records contain transcripts and caller numbers (PII) — admin key
// required, same guard as app/api/admin/receptionist/ routes.
function checkAuth(req: Request): NextResponse | null {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return NextResponse.json(
      { error: "Admin API not configured (ADMIN_API_KEY missing)" },
      { status: 503 }
    );
  }
  const provided = req.headers.get("x-admin-key");
  if (provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: Request) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  try {
    const calls = await db
      .select()
      .from(receptionistCallsTable)
      .orderBy(desc(receptionistCallsTable.createdAt))
      .limit(100);
    return NextResponse.json({ calls });
  } catch (err) {
    console.error({ event: "receptionist_calls_fetch_error", err });
    return NextResponse.json({ error: "Failed to fetch calls" }, { status: 500 });
  }
}
