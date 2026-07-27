/**
 * E2E unit test: full call flow
 * Vapi webhook → DB write (receptionistCallsTable) → email alert (Resend)
 *
 * Covers the happy path the existing receptionist-webhook.test.ts misses:
 *   1. db.select returns a matching firm
 *   2. db.insert writes the call record
 *   3. resend.emails.send is called with correct firm/caller data
 *
 * Strategy:
 *   - Mock @/lib/db (both select and insert chains)
 *   - Mock resend module so no real API call is made
 *   - Drive via NextRequest exactly as Vapi would POST
 *
 * Run: npx vitest run __tests__/receptionist-call-flow.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// DB mock — must be hoisted before any import that touches @/lib/db
// ---------------------------------------------------------------------------
const mockSendEmail = vi.hoisted(() => vi.fn().mockResolvedValue({ id: "resend-msg-id" }));

const mockDb = vi.hoisted(() => {
  const values = vi.fn().mockResolvedValue([{ id: "call-row-id" }]);
  const insert = vi.fn().mockReturnValue({ values });

  // select chain: .select().from().where()
  const where = vi.fn().mockResolvedValue([]);
  const from = vi.fn().mockReturnValue({ where });
  const select = vi.fn().mockReturnValue({ from });

  return { insert, values, select, from, where };
});

vi.mock("@/lib/db", () => ({
  db: {
    insert: mockDb.insert,
    select: mockDb.select,
  },
}));

// ---------------------------------------------------------------------------
// Resend mock — intercept before the handler instantiates Resend
// Resend is used as a class (new Resend(key)), so the mock must be a
// function constructor, not an arrow function.
// ---------------------------------------------------------------------------
vi.mock("resend", () => {
  const ResendMock = vi.fn(function (this: unknown) {
    (this as Record<string, unknown>).emails = { send: mockSendEmail };
  });
  return { Resend: ResendMock };
});

// Import handler AFTER mocks are set up
import { POST } from "../app/api/receptionist/call-complete/route";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CALLER_NUMBER = "+16175550100";
const FIRM_PHONE = "+16175550200";

const validPayload = {
  message: {
    type: "end-of-call-report",
    call: {
      id: "vapi-call-e2e-001",
      customer: { number: CALLER_NUMBER },
      phoneNumber: { number: FIRM_PHONE },
    },
    artifact: {
      transcript: "Caller: Hi, I was injured in a car accident.\nAssistant: I can connect you with an attorney.",
    },
    analysis: {
      structuredData: { caseType: "auto", urgency: "high", injuryType: "back" },
    },
    durationSeconds: 112,
  },
};

const fakeFirm = {
  id: "firm-uuid-e2e",
  name: "Smith PI Law",
  phoneNumber: FIRM_PHONE,
  attorneyEmail: "attorney@smithpilaw.com",
  attorneyPhone: "+16175550300",
  caseTypes: "auto,slip-and-fall",
  callbackTime: "30 minutes",
  active: "true",
  createdAt: new Date(),
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/receptionist/call-complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();

  // Default: firm found
  mockDb.where.mockResolvedValue([fakeFirm]);
  mockDb.from.mockReturnValue({ where: mockDb.where });
  mockDb.select.mockReturnValue({ from: mockDb.from });

  // DB insert succeeds
  mockDb.insert.mockReturnValue({ values: mockDb.values });
  mockDb.values.mockResolvedValue([{ id: "call-row-id" }]);

  // Resend succeeds
  mockSendEmail.mockResolvedValue({ id: "resend-msg-id" });

  // Env var required by handler
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.RESEND_FROM = "noreply@counterbench.ai";
});

// ---------------------------------------------------------------------------
// Full call flow — happy path
// ---------------------------------------------------------------------------

describe("Full call flow: Vapi webhook → DB → email", () => {
  it("returns 200 with { received: true } immediately", async () => {
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("received", true);
  });

  it("writes the call record to receptionistCallsTable", async () => {
    await POST(makeRequest(validPayload));

    expect(mockDb.insert).toHaveBeenCalledTimes(1);
    expect(mockDb.values).toHaveBeenCalledTimes(1);

    const insertArgs = mockDb.values.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(insertArgs).toBeDefined();
    expect(insertArgs.callerNumber).toBe(CALLER_NUMBER);
    expect(insertArgs.firmId).toBe(fakeFirm.id);
  });

  it("stores transcript text in the DB record", async () => {
    await POST(makeRequest(validPayload));

    const insertArgs = mockDb.values.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(typeof insertArgs.transcript).toBe("string");
    expect((insertArgs.transcript as string).length).toBeGreaterThan(0);
    expect(insertArgs.transcript).toContain("injured");
  });

  it("serializes structuredData as JSON string in the DB record", async () => {
    await POST(makeRequest(validPayload));

    const insertArgs = mockDb.values.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(typeof insertArgs.structuredData).toBe("string");
    const parsed = JSON.parse(insertArgs.structuredData as string);
    expect(parsed).toMatchObject({ caseType: "auto", urgency: "high" });
  });

  it("stores call duration in the DB record", async () => {
    await POST(makeRequest(validPayload));

    const insertArgs = mockDb.values.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(String(insertArgs.duration)).toBe("112");
  });

  it("sends email alert to the firm's attorney email", async () => {
    await POST(makeRequest(validPayload));

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    const emailArgs = mockSendEmail.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(emailArgs.to).toBe(fakeFirm.attorneyEmail);
  });

  it("includes caller number and firm name in email subject", async () => {
    await POST(makeRequest(validPayload));

    const emailArgs = mockSendEmail.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(emailArgs.subject).toContain(fakeFirm.name);
    expect(emailArgs.subject).toContain(CALLER_NUMBER);
  });

  it("includes transcript in email body", async () => {
    await POST(makeRequest(validPayload));

    const emailArgs = mockSendEmail.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(typeof emailArgs.text).toBe("string");
    expect(emailArgs.text as string).toContain("injured");
  });

  it("includes serialized structuredData section in email body", async () => {
    await POST(makeRequest(validPayload));

    const emailArgs = mockSendEmail.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(emailArgs.text as string).toContain("Structured intake data");
  });
});

// ---------------------------------------------------------------------------
// No-firm path: DB write still happens, email is skipped
// ---------------------------------------------------------------------------

describe("Call flow: no matching firm found", () => {
  beforeEach(() => {
    mockDb.where.mockResolvedValue([]); // firm lookup returns nothing
  });

  it("still returns 200", async () => {
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(200);
  });

  it("still writes the call record with firmId 'unknown'", async () => {
    await POST(makeRequest(validPayload));

    expect(mockDb.insert).toHaveBeenCalledTimes(1);
    const insertArgs = mockDb.values.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(insertArgs.firmId).toBe("unknown");
  });

  it("does NOT send an email when no firm is matched", async () => {
    await POST(makeRequest(validPayload));
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Missing RESEND_API_KEY: DB write happens, email is skipped gracefully
// ---------------------------------------------------------------------------

describe("Call flow: RESEND_API_KEY missing", () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  it("still returns 200", async () => {
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(200);
  });

  it("still writes the call record to DB", async () => {
    await POST(makeRequest(validPayload));
    expect(mockDb.insert).toHaveBeenCalledTimes(1);
  });

  it("does NOT call resend when API key is absent", async () => {
    await POST(makeRequest(validPayload));
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Resend failure: should not crash the webhook or affect the 200 response
// ---------------------------------------------------------------------------

describe("Call flow: Resend email send fails", () => {
  beforeEach(() => {
    mockSendEmail.mockRejectedValueOnce(new Error("Resend 503 upstream"));
  });

  it("returns 200 even when email send throws", async () => {
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("received", true);
  });

  it("DB insert still occurred before email failure", async () => {
    await POST(makeRequest(validPayload));
    // insert was called — failure was downstream in Resend, not in DB
    expect(mockDb.insert).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Payload extraction edge cases
// ---------------------------------------------------------------------------

describe("Payload field extraction", () => {
  it("falls back to msg.transcript when artifact.transcript is absent", async () => {
    const payload = {
      message: {
        type: "end-of-call-report",
        call: {
          id: "vapi-call-fallback",
          customer: { number: CALLER_NUMBER },
          phoneNumber: { number: FIRM_PHONE },
        },
        transcript: "Direct transcript field",
        durationSeconds: 30,
      },
    };

    await POST(makeRequest(payload));

    const insertArgs = mockDb.values.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(insertArgs.transcript).toBe("Direct transcript field");
  });

  it("uses msg.call.to as calledNumber when phoneNumber.number is absent", async () => {
    const payload = {
      message: {
        type: "end-of-call-report",
        call: {
          id: "vapi-call-to-fallback",
          customer: { number: CALLER_NUMBER },
          to: FIRM_PHONE,
        },
        artifact: { transcript: "test" },
        durationSeconds: 10,
      },
    };

    await POST(makeRequest(payload));

    // select.from.where should have been called — firm lookup triggered
    expect(mockDb.select).toHaveBeenCalledTimes(1);
  });

  it("stores empty string structuredData when analysis is absent", async () => {
    const payload = {
      message: {
        type: "end-of-call-report",
        call: {
          id: "vapi-call-no-analysis",
          customer: { number: CALLER_NUMBER },
          phoneNumber: { number: FIRM_PHONE },
        },
        artifact: { transcript: "Short call." },
        durationSeconds: 5,
      },
    };

    await POST(makeRequest(payload));

    const insertArgs = mockDb.values.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(insertArgs.structuredData).toBe("");
  });

  it("handles missing calledNumber gracefully — skips firm lookup", async () => {
    const payload = {
      message: {
        type: "end-of-call-report",
        call: {
          id: "vapi-call-no-to",
          customer: { number: CALLER_NUMBER },
          // no phoneNumber, no to
        },
        artifact: { transcript: "No called number." },
        durationSeconds: 20,
      },
    };

    await POST(makeRequest(payload));

    // select should NOT have been called since calledNumber is empty
    expect(mockDb.select).not.toHaveBeenCalled();
    // insert still called with firmId "unknown"
    const insertArgs = mockDb.values.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(insertArgs.firmId).toBe("unknown");
  });
});
