import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { receptionistFirmsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

const updateFirmSchema = z
  .object({
    name: z.string().min(1).optional(),
    phoneNumber: z.string().min(8).optional(),
    attorneyEmail: z.string().email().optional(),
    attorneyPhone: z.string().min(8).optional(),
    caseTypes: z.string().nullable().optional(),
    callbackTime: z.string().optional(),
    active: z.enum(["true", "false"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field required",
  });

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateFirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const [updated] = await db
      .update(receptionistFirmsTable)
      .set(parsed.data)
      .where(eq(receptionistFirmsTable.id, params.id))
      .returning();
    if (!updated) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }
    console.info({ event: "admin_firm_updated", firmId: params.id });
    return NextResponse.json({ firm: updated });
  } catch (err) {
    console.error({ event: "admin_firm_update_failed", err, firmId: params.id });
    return NextResponse.json({ error: "Failed to update firm" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  try {
    const [deleted] = await db
      .delete(receptionistFirmsTable)
      .where(eq(receptionistFirmsTable.id, params.id))
      .returning();
    if (!deleted) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }
    console.info({ event: "admin_firm_deleted", firmId: params.id });
    return NextResponse.json({ deleted: true, id: params.id });
  } catch (err) {
    console.error({ event: "admin_firm_delete_failed", err, firmId: params.id });
    return NextResponse.json({ error: "Failed to delete firm" }, { status: 500 });
  }
}
