/**
 * Unit tests: receptionist admin CRUD endpoints
 *
 * Covers:
 *   GET  /api/admin/receptionist/firms         — list firms
 *   POST /api/admin/receptionist/firms         — create firm
 *   PATCH  /api/admin/receptionist/firms/[id]  — update firm
 *   DELETE /api/admin/receptionist/firms/[id]  — delete firm
 *
 * Strategy:
 *   - Mock @/lib/db at the drizzle boundary (same pattern as other __tests__)
 *   - Drive handlers via plain Request objects (admin routes use Request, not NextRequest)
 *   - Auth tested via x-admin-key header and ADMIN_API_KEY env var
 *
 * Run: npx vitest run __tests__/receptionist-admin.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// DB mock — hoisted so it is available before any module that imports @/lib/db
// ---------------------------------------------------------------------------
const mockDb = vi.hoisted(() => {
  // insert chain: .insert().values().returning()
  const returning = vi.fn().mockResolvedValue([]);
  const values = vi.fn().mockReturnValue({ returning });
  const insert = vi.fn().mockReturnValue({ values });

  // select chain: .select().from().orderBy()
  const orderBy = vi.fn().mockResolvedValue([]);
  const from = vi.fn().mockReturnValue({ orderBy });
  const select = vi.fn().mockReturnValue({ from });

  // update chain: .update().set().where().returning()
  const updateReturning = vi.fn().mockResolvedValue([]);
  const updateWhere = vi.fn().mockReturnValue({ returning: updateReturning });
  const set = vi.fn().mockReturnValue({ where: updateWhere });
  const update = vi.fn().mockReturnValue({ set });

  // delete chain: .delete().where().returning()
  const deleteReturning = vi.fn().mockResolvedValue([]);
  const deleteWhere = vi.fn().mockReturnValue({ returning: deleteReturning });
  const del = vi.fn().mockReturnValue({ where: deleteWhere });

  return {
    insert, values, returning,
    select, from, orderBy,
    update, set, updateWhere, updateReturning,
    del, deleteWhere, deleteReturning,
  };
});

vi.mock("@/lib/db", () => ({
  db: {
    insert: mockDb.insert,
    select: mockDb.select,
    update: mockDb.update,
    delete: mockDb.del,
  },
}));

// Import handlers AFTER mocks are in place
import { GET, POST } from "../app/api/admin/receptionist/firms/route";
import { PATCH, DELETE } from "../app/api/admin/receptionist/firms/[id]/route";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ADMIN_KEY = "test-admin-secret";
const FIRM_ID = "firm-uuid-123";

const fakeFirm = {
  id: FIRM_ID,
  name: "Smith & Associates",
  phoneNumber: "+16175550100",
  attorneyEmail: "smith@smithlaw.com",
  attorneyPhone: "+16175550200",
  caseTypes: "auto,slip-and-fall",
  callbackTime: "30 minutes",
  active: "true",
  createdAt: new Date(),
};

const validCreateBody = {
  name: "Smith & Associates",
  phoneNumber: "+16175550100",
  attorneyEmail: "smith@smithlaw.com",
  attorneyPhone: "+16175550200",
  caseTypes: "auto",
  callbackTime: "30 minutes",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGetRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/admin/receptionist/firms", {
    method: "GET",
    headers,
  });
}

function makePostRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/admin/receptionist/firms", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function makePatchRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`http://localhost/api/admin/receptionist/firms/${FIRM_ID}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest(headers: Record<string, string> = {}): Request {
  return new Request(`http://localhost/api/admin/receptionist/firms/${FIRM_ID}`, {
    method: "DELETE",
    headers,
  });
}

const idParams = { params: Promise.resolve({ id: FIRM_ID }) };

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ADMIN_API_KEY = ADMIN_KEY;

  // GET: select chain returns empty array by default
  mockDb.orderBy.mockResolvedValue([]);
  mockDb.from.mockReturnValue({ orderBy: mockDb.orderBy });
  mockDb.select.mockReturnValue({ from: mockDb.from });

  // POST: insert chain returns created firm
  mockDb.returning.mockResolvedValue([fakeFirm]);
  mockDb.values.mockReturnValue({ returning: mockDb.returning });
  mockDb.insert.mockReturnValue({ values: mockDb.values });

  // PATCH: update chain returns updated firm
  mockDb.updateReturning.mockResolvedValue([fakeFirm]);
  mockDb.updateWhere.mockReturnValue({ returning: mockDb.updateReturning });
  mockDb.set.mockReturnValue({ where: mockDb.updateWhere });
  mockDb.update.mockReturnValue({ set: mockDb.set });

  // DELETE: delete chain returns deleted firm
  mockDb.deleteReturning.mockResolvedValue([fakeFirm]);
  mockDb.deleteWhere.mockReturnValue({ returning: mockDb.deleteReturning });
  mockDb.del.mockReturnValue({ where: mockDb.deleteWhere });
});

// ---------------------------------------------------------------------------
// Authentication — GET
// ---------------------------------------------------------------------------

describe("Auth: GET /api/admin/receptionist/firms", () => {
  it("returns 401 when x-admin-key header is missing", async () => {
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toHaveProperty("error");
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
});

// ---------------------------------------------------------------------------
// Authentication — POST
// ---------------------------------------------------------------------------

describe("Auth: POST /api/admin/receptionist/firms", () => {
  it("returns 401 when x-admin-key header is missing", async () => {
    const res = await POST(makePostRequest(validCreateBody));
    expect(res.status).toBe(401);
  });

  it("returns 401 when x-admin-key header has wrong value", async () => {
    const res = await POST(makePostRequest(validCreateBody, { "x-admin-key": "bad-key" }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });
});

// ---------------------------------------------------------------------------
// GET — list firms
// ---------------------------------------------------------------------------

describe("GET /api/admin/receptionist/firms", () => {
  it("returns 200 with an array of firms when DB is empty", async () => {
    mockDb.orderBy.mockResolvedValue([]);

    const res = await GET(makeGetRequest({ "x-admin-key": ADMIN_KEY }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("firms");
    expect(Array.isArray(json.firms)).toBe(true);
    expect(json.firms).toHaveLength(0);
  });

  it("returns 200 with firms when DB has rows", async () => {
    mockDb.orderBy.mockResolvedValue([fakeFirm]);

    const res = await GET(makeGetRequest({ "x-admin-key": ADMIN_KEY }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.firms).toHaveLength(1);
    expect(json.firms[0].id).toBe(FIRM_ID);
    expect(json.firms[0].name).toBe(fakeFirm.name);
  });

  it("calls db.select once", async () => {
    await GET(makeGetRequest({ "x-admin-key": ADMIN_KEY }));
    expect(mockDb.select).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// POST — create firm
// ---------------------------------------------------------------------------

describe("POST /api/admin/receptionist/firms", () => {
  it("returns 201 with created firm on valid body", async () => {
    const res = await POST(makePostRequest(validCreateBody, { "x-admin-key": ADMIN_KEY }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty("firm");
    expect(json.firm.id).toBe(FIRM_ID);
    expect(json.firm.name).toBe(fakeFirm.name);
  });

  it("calls db.insert with correct field values", async () => {
    await POST(makePostRequest(validCreateBody, { "x-admin-key": ADMIN_KEY }));
    expect(mockDb.insert).toHaveBeenCalledTimes(1);
    expect(mockDb.values).toHaveBeenCalledTimes(1);
    const insertedData = mockDb.values.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(insertedData.name).toBe(validCreateBody.name);
    expect(insertedData.phoneNumber).toBe(validCreateBody.phoneNumber);
    expect(insertedData.attorneyEmail).toBe(validCreateBody.attorneyEmail);
    expect(insertedData.attorneyPhone).toBe(validCreateBody.attorneyPhone);
  });

  it("returns 400 when required fields are missing (Zod validation)", async () => {
    const badBody = { name: "No Phone Firm" }; // missing phoneNumber, attorneyEmail, attorneyPhone
    const res = await POST(makePostRequest(badBody, { "x-admin-key": ADMIN_KEY }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
    expect(json).toHaveProperty("issues");
  });

  it("returns 400 when attorneyEmail is not a valid email", async () => {
    const badBody = { ...validCreateBody, attorneyEmail: "not-an-email" };
    const res = await POST(makePostRequest(badBody, { "x-admin-key": ADMIN_KEY }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });

  it("returns 400 when phoneNumber is too short", async () => {
    const badBody = { ...validCreateBody, phoneNumber: "123" };
    const res = await POST(makePostRequest(badBody, { "x-admin-key": ADMIN_KEY }));
    expect(res.status).toBe(400);
  });

  it("uses '30 minutes' as default callbackTime when omitted", async () => {
    const bodyWithoutCallback = { ...validCreateBody };
    delete (bodyWithoutCallback as Partial<typeof validCreateBody>).callbackTime;

    await POST(makePostRequest(bodyWithoutCallback, { "x-admin-key": ADMIN_KEY }));
    const insertedData = mockDb.values.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(insertedData.callbackTime).toBe("30 minutes");
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new Request("http://localhost/api/admin/receptionist/firms", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body: "not json {{{",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// PATCH — update firm
// ---------------------------------------------------------------------------

describe("PATCH /api/admin/receptionist/firms/[id]", () => {
  it("returns 401 when x-admin-key header is missing", async () => {
    const res = await PATCH(makePatchRequest({ name: "New Name" }), idParams);
    expect(res.status).toBe(401);
  });

  it("returns 401 when x-admin-key header has wrong value", async () => {
    const res = await PATCH(
      makePatchRequest({ name: "New Name" }, { "x-admin-key": "bad-key" }),
      idParams
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 with updated firm on valid partial body", async () => {
    const res = await PATCH(
      makePatchRequest({ name: "Updated Name" }, { "x-admin-key": ADMIN_KEY }),
      idParams
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("firm");
    expect(json.firm.id).toBe(FIRM_ID);
  });

  it("calls db.update once with the correct firm id", async () => {
    await PATCH(
      makePatchRequest({ name: "Updated Name" }, { "x-admin-key": ADMIN_KEY }),
      idParams
    );
    expect(mockDb.update).toHaveBeenCalledTimes(1);
    expect(mockDb.set).toHaveBeenCalledTimes(1);
    const setArgs = mockDb.set.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(setArgs.name).toBe("Updated Name");
  });

  it("returns 400 when body is empty object (Zod refine: at least one field required)", async () => {
    const res = await PATCH(
      makePatchRequest({}, { "x-admin-key": ADMIN_KEY }),
      idParams
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });

  it("returns 400 when attorneyEmail is invalid", async () => {
    const res = await PATCH(
      makePatchRequest({ attorneyEmail: "bad-email" }, { "x-admin-key": ADMIN_KEY }),
      idParams
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when firm is not found in DB", async () => {
    mockDb.updateReturning.mockResolvedValue([]); // no rows returned = not found
    const res = await PATCH(
      makePatchRequest({ name: "Ghost Firm" }, { "x-admin-key": ADMIN_KEY }),
      idParams
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Firm not found");
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new Request(`http://localhost/api/admin/receptionist/firms/${FIRM_ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body: "not json {{{",
    });
    const res = await PATCH(req, idParams);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// DELETE — remove firm
// ---------------------------------------------------------------------------

describe("DELETE /api/admin/receptionist/firms/[id]", () => {
  it("returns 401 when x-admin-key header is missing", async () => {
    const res = await DELETE(makeDeleteRequest(), idParams);
    expect(res.status).toBe(401);
  });

  it("returns 401 when x-admin-key header has wrong value", async () => {
    const res = await DELETE(makeDeleteRequest({ "x-admin-key": "wrong" }), idParams);
    expect(res.status).toBe(401);
  });

  it("returns 200 with { deleted: true, id } on success", async () => {
    const res = await DELETE(makeDeleteRequest({ "x-admin-key": ADMIN_KEY }), idParams);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.deleted).toBe(true);
    expect(json.id).toBe(FIRM_ID);
  });

  it("calls db.delete once", async () => {
    await DELETE(makeDeleteRequest({ "x-admin-key": ADMIN_KEY }), idParams);
    expect(mockDb.del).toHaveBeenCalledTimes(1);
    expect(mockDb.deleteWhere).toHaveBeenCalledTimes(1);
  });

  it("returns 404 when firm is not found in DB", async () => {
    mockDb.deleteReturning.mockResolvedValue([]); // no rows = not found
    const res = await DELETE(makeDeleteRequest({ "x-admin-key": ADMIN_KEY }), idParams);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Firm not found");
  });
});
