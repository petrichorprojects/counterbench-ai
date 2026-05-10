import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { receptionistCallsTable } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

// Force dynamic — DB-backed route, must not be evaluated at build time.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
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
