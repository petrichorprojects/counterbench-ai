import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { receptionistFirmsTable } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

// Force dynamic — DB-backed admin route; must not pre-render at build.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

const createFirmSchema = z.object({
  name: z.string().min(1),
  phoneNumber: z.string().min(8), // E.164 expected: "+16175550100"
  attorneyEmail: z.string().email(),
  attorneyPhone: z.string().min(8),
  caseTypes: z.string().optional(),
  callbackTime: z.string().optional(),
});

export async function GET(req: Request) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  try {
    const firms = await db
      .select()
      .from(receptionistFirmsTable)
      .orderBy(desc(receptionistFirmsTable.createdAt));
    return NextResponse.json({ firms });
  } catch (err) {
    console.error({ event: "admin_firms_list_failed", err });
    return NextResponse.json({ error: "Failed to list firms" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createFirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const [created] = await db
      .insert(receptionistFirmsTable)
      .values({
        name: parsed.data.name,
        phoneNumber: parsed.data.phoneNumber,
        attorneyEmail: parsed.data.attorneyEmail,
        attorneyPhone: parsed.data.attorneyPhone,
        caseTypes: parsed.data.caseTypes ?? null,
        callbackTime: parsed.data.callbackTime ?? "30 minutes",
      })
      .returning();
    if (!created) {
      console.error({ event: "admin_firm_create_no_row" });
      return NextResponse.json({ error: "Insert returned no row" }, { status: 500 });
    }
    console.info({
      event: "admin_firm_created",
      firmId: created.id,
      name: created.name,
    });
    return NextResponse.json({ firm: created }, { status: 201 });
  } catch (err) {
    console.error({ event: "admin_firm_create_failed", err });
    return NextResponse.json({ error: "Failed to create firm" }, { status: 500 });
  }
}
