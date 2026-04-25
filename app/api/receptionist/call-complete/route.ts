import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { receptionistFirmsTable, receptionistCallsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  // Acknowledge immediately — Vapi expects fast response
  const response = NextResponse.json({ received: true });

  try {
    const body = await req.json().catch(() => ({}));
    const msg = body?.message || body;

    const callId: string = msg?.call?.id || "unknown";
    const callerNumber: string =
      msg?.call?.customer?.number || msg?.call?.customerPhoneNumber || "";
    const calledNumber: string =
      msg?.call?.phoneNumber?.number || msg?.call?.to || "";
    const transcript: string = msg?.artifact?.transcript || msg?.transcript || "";
    const structuredData: string = msg?.analysis?.structuredData
      ? JSON.stringify(msg.analysis.structuredData)
      : "";
    const duration: number = msg?.durationSeconds || 0;

    // Firm lookup by Vapi phone number
    const firms = calledNumber
      ? await db
          .select()
          .from(receptionistFirmsTable)
          .where(eq(receptionistFirmsTable.phoneNumber, calledNumber))
      : [];
    const firm = firms[0];

    // Log the call regardless of firm match
    await db.insert(receptionistCallsTable).values({
      firmId: firm?.id || "unknown",
      callerNumber,
      transcript,
      structuredData,
      duration: String(duration),
    });

    if (!firm) {
      console.warn({ event: "receptionist_firm_not_found", calledNumber, callId });
      return response;
    }

    const submittedAt = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    const structuredSection = structuredData
      ? `\n\nStructured intake data:\n${structuredData}`
      : "";

    await resend.emails.send({
      from: process.env.RESEND_FROM || "noreply@counterbench.ai",
      to: firm.attorneyEmail,
      subject: `New intake call — ${firm.name} | ${callerNumber || "unknown caller"}`,
      text: [
        `A new intake call just completed for ${firm.name}.`,
        ``,
        `Caller: ${callerNumber || "unknown"}`,
        `Called: ${calledNumber}`,
        `Duration: ${duration}s`,
        `Received: ${submittedAt} ET`,
        ``,
        `Transcript:`,
        transcript || "(not available)",
        structuredSection,
      ].join("\n"),
    });

    console.log({ event: "receptionist_call_logged", firmId: firm.id, callId });
  } catch (err) {
    console.error({ event: "receptionist_webhook_error", err });
  }

  return response;
}
