# Vapi Setup Guide — CounterbenchAI Receptionist

**Webhook endpoint:** `https://counterbench.ai/api/receptionist/call-complete`

---

## 1. Create a Vapi Account and Get Your API Key

1. Go to [vapi.ai](https://vapi.ai) and sign up.
2. In the dashboard, navigate to **Settings > API Keys**.
3. Create a new key and copy it. Store it in Notion under "API and Token Keys."
4. You will use this key in the Vapi dashboard when configuring the assistant and for any direct API calls.

---

## 2. Buy or Import a Phone Number

Each firm needs its own dedicated Vapi number so the webhook can map inbound calls to the right attorney.

**Option A - Buy a number in Vapi:**
1. Dashboard > **Phone Numbers > Buy Number**.
2. Search by area code matching the firm's market (e.g., 617 for Boston).
3. Purchase and note the full E.164 number (e.g., `+16175550100`).

**Option B - Import a Twilio number:**
1. Dashboard > **Phone Numbers > Import**.
2. Provide your Twilio Account SID, Auth Token, and the number. Vapi takes control of it.

---

## 3. Create the Assistant

### 3a. System Prompt

Use this prompt verbatim or adapt per firm. Replace bracketed values.

```
You are the virtual receptionist for [Firm Name], a personal injury law firm in [City, State]. Your job is to answer calls professionally, make callers feel heard, and collect the information the attorneys need to follow up.

Guidelines:
- Greet warmly and introduce yourself as the firm's virtual receptionist.
- Speak clearly and at a measured pace. Do not rush callers.
- If a caller is distressed, acknowledge their situation briefly before asking questions.
- Collect the following before ending the call:
  1. Caller's full name
  2. Best callback number (confirm if it differs from the number they called from)
  3. Type of case (car accident, slip and fall, workplace injury, medical malpractice, other)
  4. Brief description of what happened (2-3 sentences is enough — do not probe for legal details)
  5. Urgency level: Does the caller need a same-day callback, or is tomorrow acceptable?
  6. Preferred callback time window if they have one
- Never give legal advice. If asked, say: "One of our attorneys will be able to speak with you about that directly."
- End the call by confirming: "I've passed your information to the team. Someone will be in touch [timeframe]. Thank you for calling [Firm Name]."
```

### 3b. Structured Data Schema

In the assistant config, enable **Analysis > Structured Data** and set this schema. This populates `message.analysis.structuredData` in the webhook payload.

```json
{
  "type": "object",
  "properties": {
    "callerName": {
      "type": "string",
      "description": "Full name of the caller"
    },
    "callbackNumber": {
      "type": "string",
      "description": "Best phone number to reach the caller"
    },
    "caseType": {
      "type": "string",
      "enum": ["car_accident", "slip_and_fall", "workplace_injury", "medical_malpractice", "other"],
      "description": "Type of personal injury case"
    },
    "caseDescription": {
      "type": "string",
      "description": "Brief description of the incident in the caller's own words"
    },
    "urgency": {
      "type": "string",
      "enum": ["same_day", "next_day", "flexible"],
      "description": "How urgently the caller needs a callback"
    },
    "preferredCallbackTime": {
      "type": "string",
      "description": "Caller's preferred callback time window, if stated"
    }
  },
  "required": ["callerName", "caseType", "urgency"]
}
```

### 3c. End-of-Call Webhook

In the assistant config under **Server > Messages**, add:

- **Server URL:** `https://counterbench.ai/api/receptionist/call-complete`
- **Server Messages:** `["end-of-call-report"]`

This triggers the webhook exactly once at the end of each call with the full payload including transcript and structured data.

### 3d. Voice and Model Settings (Recommended)

- **Voice:** ElevenLabs "Rachel" or Vapi's built-in "Paige" - warm, professional female voice.
- **Model:** GPT-4o (best accuracy for intake; latency is acceptable for receptionist use cases).
- **Max duration:** 600 seconds (10 minutes). Adjust if needed.
- **Background sound:** Off. Legal callers expect clean audio.

---

## 4. Link the Phone Number to the Assistant

1. Dashboard > **Phone Numbers > [Your Number]**.
2. Under **Inbound**, set **Assistant** to the assistant you just created.
3. Save. All inbound calls to that number now route to the assistant.

---

## 5. Add the Firm to the Database

The webhook looks up the firm by matching `message.call.phoneNumber.number` against the `phone_number` column in `receptionist_firms`. Use the admin endpoint to add the firm — preferred over raw SQL.

**Prereq:** Set `ADMIN_API_KEY` in Vercel env (generate with `openssl rand -hex 32`).

```fish
set -x ADMIN_API_KEY <your-admin-key>
curl -X POST https://counterbench.ai/api/admin/receptionist/firms \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "name": "Smith & Associates Personal Injury",
    "phoneNumber": "+16175550100",
    "attorneyEmail": "attorney@smithpifirm.com",
    "attorneyPhone": "+15614064984",
    "caseTypes": "auto accident, slip and fall",
    "callbackTime": "30 minutes"
  }'
```

**Critical:** The `phoneNumber` value must be the exact E.164 string Vapi sends in `message.call.phoneNumber.number`. Verify in the Vapi dashboard — it will include the country code and no spaces or dashes.

If the number does not match, the call is still logged to `receptionist_calls` with `firmId = 'unknown'` but no intake email is sent.

### Other admin operations

```fish
# List all firms
curl -H "x-admin-key: $ADMIN_API_KEY" https://counterbench.ai/api/admin/receptionist/firms

# Update a firm
curl -X PATCH https://counterbench.ai/api/admin/receptionist/firms/<id> \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -H "content-type: application/json" \
  -d '{"caseTypes": "auto accident, slip and fall, premises liability"}'

# Deactivate (soft) — set active="false"
curl -X PATCH https://counterbench.ai/api/admin/receptionist/firms/<id> \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -H "content-type: application/json" \
  -d '{"active": "false"}'

# Delete (hard)
curl -X DELETE https://counterbench.ai/api/admin/receptionist/firms/<id> \
  -H "x-admin-key: $ADMIN_API_KEY"
```

---

## 6. Test Call Checklist

Run through this after setup before going live with a firm.

- [ ] Call the Vapi number from a real mobile phone.
- [ ] Confirm the assistant answers and the greeting matches the system prompt.
- [ ] Provide test intake data: name, case type, callback preference.
- [ ] End the call naturally ("That's all, thank you").
- [ ] Within 30 seconds, check the attorney email inbox for the intake summary.
- [ ] Confirm the email contains: caller number, called number, duration, transcript, and structured data block.
- [ ] Check the `receptionist_calls` table to confirm the row was inserted with the correct `firmId`.
- [ ] If no email arrives: check that `phone_number` in `receptionist_firms` matches exactly. Check Vercel function logs for `receptionist_firm_not_found` or `receptionist_webhook_error` events.

---

## Payload Reference

The handler extracts these fields from the Vapi `end-of-call-report` payload:

| Field | Vapi Path | Fallback |
|---|---|---|
| Call ID | `message.call.id` | `"unknown"` |
| Caller number | `message.call.customer.number` | `message.call.customerPhoneNumber` |
| Called number (firm lookup) | `message.call.phoneNumber.number` | `message.call.to` |
| Transcript | `message.artifact.transcript` | `message.transcript` |
| Structured data | `message.analysis.structuredData` | none |
| Duration (seconds) | `message.durationSeconds` | `0` |
