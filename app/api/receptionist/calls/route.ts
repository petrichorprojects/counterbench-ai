import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { receptionistCallsTable } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

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
