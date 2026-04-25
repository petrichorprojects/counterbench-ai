import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  // Acknowledge immediately
  const response = NextResponse.json({ received: true });

  try {
    const body = await req.json().catch(() => ({}));

    // ScreenApp payload shape varies — try common field paths
    const recording =
      body?.recording || body?.data?.recording || body?.data || body;

    const title: string =
      recording?.title ||
      recording?.name ||
      body?.title ||
      "Untitled Recording";

    const transcript: string =
      recording?.transcript ||
      recording?.transcription ||
      recording?.transcript_text ||
      body?.transcript ||
      "";

    const recordingUrl: string =
      recording?.url ||
      recording?.recording_url ||
      recording?.share_url ||
      body?.url ||
      "";

    const recordingId: string =
      recording?.id || recording?.recording_id || body?.id || "unknown";

    const eventType: string = body?.event || body?.type || "recording.processed";

    const createdAt = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });

    // Log full payload for schema discovery
    console.log({
      event: "screenapp_webhook_received",
      eventType,
      recordingId,
      title,
      hasTranscript: !!transcript,
      rawPayloadKeys: Object.keys(body),
    });

    // Only email if there's actual content worth synthesizing
    if (!transcript && !recordingUrl) {
      console.log({
        event: "screenapp_webhook_skipped",
        reason: "no transcript or URL",
        recordingId,
      });
      return response;
    }

    const transcriptSection = transcript
      ? `Transcript:\n${transcript}`
      : `No transcript in payload. View recording: ${recordingUrl}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM || "noreply@verdictops.com",
      to: "rimmler44@gmail.com",
      subject: `ScreenApp Transcript: ${title}`,
      text: [
        `New ScreenApp recording ready for synthesis.`,
        ``,
        `Title: ${title}`,
        `Recording ID: ${recordingId}`,
        `Event: ${eventType}`,
        `Received: ${createdAt} ET`,
        recordingUrl ? `URL: ${recordingUrl}` : "",
        ``,
        transcriptSection,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    console.log({ event: "screenapp_transcript_emailed", recordingId, title });
  } catch (err) {
    console.error({ event: "screenapp_webhook_error", err });
  }

  return response;
}
