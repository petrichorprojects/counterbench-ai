# Remote Receptionist — Launch Checklist (CounterbenchAI)

Last updated: 2026-05-21
Branch: `feat/sales-motion-lock`
Domain: counterbench.ai

## Status snapshot

| Component | State |
|-----------|-------|
| `/api/receptionist/call-complete` (Vapi end-of-call webhook) | Built |
| `/api/receptionist/calls` (call log read) | Built |
| `/api/admin/receptionist/firms[/:id]` (CRUD) | **Built this branch** |
| Drizzle schema (`receptionist_firms` + `receptionist_calls`) | Defined in `lib/db/schema.ts` |
| Resend email + SMS-gateway alerting | Wired |
| Service page + paralegal landing | Live at counterbench.ai/paralegals |
| `docs/vapi-setup.md` | Live |
| **DB migration pushed (prod Neon)** | **PENDING** (Phil action) |
| **Vercel env vars set** | **PENDING** (Phil action) |
| **Vapi assistant configured** | **PENDING** (Phil action) |
| **First firm seeded via admin endpoint** | **PENDING** (Phil action) |
| **End-to-end test call** | **PENDING** (Phil action) |

## What was built this branch

`app/api/admin/receptionist/firms/route.ts` — `GET` (list), `POST` (create)
`app/api/admin/receptionist/firms/[id]/route.ts` — `PATCH` (update), `DELETE` (remove)

Both routes require `x-admin-key` header matching `ADMIN_API_KEY`. Use Zod for body validation. Both export `dynamic = "force-dynamic"` + `runtime = "nodejs"`.

`.env.example` — documented `ADMIN_API_KEY`, `ATTORNEY_SMS_EMAIL`.

## Phil action items (90-min sitting)

### 1. Generate admin key
```fish
openssl rand -hex 32
```
Copy output.

### 2. Set Vercel env vars (Production scope on counterbench.ai project)
Required:
- `DATABASE_URL` — Neon prod connection string (sslmode=require)
- `RESEND_API_KEY` — from resend.com/api-keys
- `RESEND_FROM` — `noreply@counterbench.ai`
- `ADMIN_API_KEY` — value from step 1

Optional:
- `ATTORNEY_SMS_EMAIL` — carrier email-to-SMS gateway (e.g. `5551234567@vtext.verizon.net`)

### 3. Push schema
```fish
cd ~/Downloads/Projects/CounterbenchAI
set -x DATABASE_URL "<paste-prod-neon-url>"
npx drizzle-kit push
```
Creates `receptionist_firms` + `receptionist_calls` tables.

### 4. Configure Vapi assistant
Follow `docs/vapi-setup.md`. Key items:
- Webhook URL: `https://counterbench.ai/api/receptionist/call-complete`
- Webhook events: `end-of-call-report`
- Assign Vapi-provisioned phone number to firm in next step

### 5. Seed first firm via admin endpoint
Replace SQL step in `docs/vapi-setup.md` with this curl:
```fish
curl -X POST https://counterbench.ai/api/admin/receptionist/firms \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "name": "Smith & Associates PI",
    "phoneNumber": "+16175550100",
    "attorneyEmail": "phil@counterbench.ai",
    "attorneyPhone": "+15614064984",
    "caseTypes": "auto accident, slip and fall",
    "callbackTime": "30 minutes"
  }'
```
`phoneNumber` MUST match the Vapi assistant's E.164 number exactly.

### 6. End-to-end test
- Call the Vapi number
- Confirm intake flow
- Verify:
  - Email arrives at `attorneyEmail`
  - SMS arrives at `ATTORNEY_SMS_EMAIL` (if set)
  - Call appears at `GET https://counterbench.ai/api/receptionist/calls`

### 7. First paying firm
- Once test passes, pitch to 3 PI firms from `tasks/PI_FIRMS.xlsx` + `Counterbench Targets/`
- Offer: $349/month, 14-day pilot, no setup fee
- On signup: re-run step 5 with their data

## Legacy note (VerdictOps)

VerdictOps brand sunset (commit `97709d0` in legacy repo, verdictops.com 301s to counterbench.ai/paralegals). All receptionist code lives in CounterbenchAI repo. The legacy Express/EJS receptionist endpoint in `~/Downloads/Projects/VerdictOps/server/index.ts` (commit `c7ba3b8`) is dead code; it is **not** receiving traffic since the domain redirects. Safe to ignore.

## Out of scope (V1)

- Web admin UI (curl/HTTPie for now)
- Per-firm dashboard
- Call recording playback
- CRM push (Lawmatics/Litify integration)
- Multi-language support
- Stripe billing integration for self-serve signup
