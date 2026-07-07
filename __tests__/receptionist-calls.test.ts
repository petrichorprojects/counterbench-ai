/**
 * Unit tests: receptionist call log endpoint
 *
 * Covers:
 *   GET /api/receptionist/calls — list the 100 most recent calls
 *
 * Strategy:
 *   - Mock @/lib/db at the drizzle boundary (same pattern as receptionist-admin.test.ts)
 *   - Drive the handler via plain Request objects
 *   - Auth tested via x-admin-key header and ADMIN_API_KEY env var
 *     (same guard as admin routes — call records contain PII)
 *
 * Run: npx vitest run __tests__/receptionist-calls.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// DB mock — hoisted so it is available before any module that imports @/lib/db
// ---------------------------------------------------------------------------
const mockDb = vi.hoisted(() => {
  // select chain used by the route: .select().from().orderBy().limit()
  const limit = vi.fn().mockResolvedValue([]);
  const orderBy = vi.fn().mockReturnValue({ limit });
  const from = vi.fn().mockReturnValue({ orderBy });
  const select = vi.fn().mockReturnValue({ from });

  return { select, from, orderBy, limit };
});

vi.mock("@/lib/db", () => ({
  db: {
    select: mockDb.select,
  },
}));

// Import handler AFTER mocks are in place
import { GET } from "../app/api/receptionist/calls/route";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ADMIN_KEY = "test-admin-secret";

function makeGetRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/receptionist/calls", {
    method: "GET",
    headers,
  });
}

const fakeCall = {
  id: "call-uuid-001",
  firmId: "firm-uuid-123",
  callerNumber: "+16175550100",
  transcript: "Caller: Hi, I was in an accident.",
  structuredData: '{"caseType":"auto","urgency":"high"}',
  duration: "74",
  createdAt: new Date("2026-07-06T12:00:00Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ADMIN_API_KEY = ADMIN_KEY;
  mockDb.limit.mockResolvedValue([]);
});

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

describe("Auth: GET /api/receptionist/calls", () => {
  it("returns 401 when x-admin-key header is missing", async () => {
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
    expect(json.calls).toBeUndefined();
  });

  it("returns 401 when x-admin-key header has wrong value", async () => {
    const res = await GET(makeGetRequest({ "x-admin-key": "wrong-key" }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 503 when ADMIN_API_KEY env var is not configured", async () => {
    delete process.env.ADMIN_API_KEY;
    const res = await GET(makeGetRequest({ "x-admin-key": ADMIN_KEY }));
    expect(res.status).toBe(503);
  });

  it("does not touch the DB when auth fails", async () => {
    await GET(makeGetRequest());
    expect(mockDb.select).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// GET /api/receptionist/calls
// ---------------------------------------------------------------------------

describe("GET /api/receptionist/calls", () => {
  it("returns 200 with a calls array when records exist", async () => {
    mockDb.limit.mockResolvedValue([fakeCall]);

    const res = await GET(makeGetRequest({ "x-admin-key": ADMIN_KEY }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(Array.isArray(json.calls)).toBe(true);
    expect(json.calls).toHaveLength(1);
    expect(json.calls[0]).toMatchObject({
      id: fakeCall.id,
      callerNumber: fakeCall.callerNumber,
      duration: fakeCall.duration,
    });
  });

  it("returns 200 with an empty array when no calls exist", async () => {
    const res = await GET(makeGetRequest({ "x-admin-key": ADMIN_KEY }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(Array.isArray(json.calls)).toBe(true);
    expect(json.calls).toHaveLength(0);
  });

  it("caps the query at the 100 most recent calls", async () => {
    await GET(makeGetRequest({ "x-admin-key": ADMIN_KEY }));
    expect(mockDb.limit).toHaveBeenCalledWith(100);
  });

  it("returns 500 with an error body when the DB query fails", async () => {
    mockDb.limit.mockRejectedValue(new Error("connection refused"));

    const res = await GET(makeGetRequest({ "x-admin-key": ADMIN_KEY }));
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBe("Failed to fetch calls");
    expect(json.calls).toBeUndefined();
  });
});
