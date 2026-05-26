#!/usr/bin/env fish
# Remote Receptionist V1 — Phil's 90-min sitting
# Run interactively. Each step pauses for confirmation.
#
# Usage:
#   chmod +x scripts/receptionist-launch.fish
#   ./scripts/receptionist-launch.fish
#
# Prereqs:
#   - On feat/sales-motion-lock branch (merged or current)
#   - Logged into Vercel CLI (`vercel login`)
#   - Neon prod DATABASE_URL ready to paste
#   - Resend API key ready to paste

set -l PROJECT_DIR (dirname (status -f))/..
cd $PROJECT_DIR

function pause_for
    echo
    echo "--- $argv[1] ---"
    read -P "Press Enter when done, or Ctrl-C to abort: "
end

function confirm_continue
    read -P "Continue? [y/N]: " ans
    if test "$ans" != "y" -a "$ans" != "Y"
        echo "Aborted."
        exit 1
    end
end

# ---------------------------------------------------------------
# STEP 1 — Load ADMIN_API_KEY
# ---------------------------------------------------------------
echo "STEP 1: Load ADMIN_API_KEY from .env.local.scratch"
if test -f .env.local.scratch
    set -x ADMIN_API_KEY (grep ADMIN_API_KEY .env.local.scratch | cut -d= -f2)
    echo "Loaded: ADMIN_API_KEY=$ADMIN_API_KEY"
else
    echo "No .env.local.scratch found. Generating new key:"
    set -x ADMIN_API_KEY (openssl rand -hex 32)
    echo "ADMIN_API_KEY=$ADMIN_API_KEY"
end
confirm_continue

# ---------------------------------------------------------------
# STEP 2 — Set Vercel env vars
# ---------------------------------------------------------------
echo
echo "STEP 2: Vercel env vars (Production scope)"
echo
echo "Paste these into Vercel → Project Settings → Environment Variables:"
echo
echo "  DATABASE_URL        <Neon prod connection string with sslmode=require>"
echo "  RESEND_API_KEY      <from resend.com/api-keys>"
echo "  RESEND_FROM         noreply@counterbench.ai"
echo "  ADMIN_API_KEY       $ADMIN_API_KEY"
echo "  ATTORNEY_SMS_EMAIL  <optional: 5551234567@vtext.verizon.net>"
echo
echo "Or use CLI (one at a time):"
echo "  vercel env add DATABASE_URL production"
echo "  vercel env add RESEND_API_KEY production"
echo "  vercel env add RESEND_FROM production"
echo "  vercel env add ADMIN_API_KEY production"
echo
pause_for "Done setting Vercel env vars"

# ---------------------------------------------------------------
# STEP 3 — Push Drizzle schema to Neon
# ---------------------------------------------------------------
echo
echo "STEP 3: Push schema to Neon"
echo "Paste the DATABASE_URL below (will export to this shell only)"
read -P "DATABASE_URL: " -s neon_url
echo
set -x DATABASE_URL $neon_url
echo "Running: npx drizzle-kit push"
npx drizzle-kit push
or begin
    echo "drizzle-kit push failed. Fix and rerun."
    exit 1
end
confirm_continue

# ---------------------------------------------------------------
# STEP 4 — Vapi assistant setup (manual)
# ---------------------------------------------------------------
echo
echo "STEP 4: Vapi assistant"
echo
echo "Open: https://dashboard.vapi.ai"
echo "Follow: docs/vapi-setup.md (sections 1-4)"
echo
echo "Key settings:"
echo "  - Webhook URL: https://counterbench.ai/api/receptionist/call-complete"
echo "  - Webhook events: end-of-call-report"
echo "  - Buy or import phone number, link to assistant"
echo
echo "Capture the assistant phone number (E.164 format, e.g. +16175550100)"
read -P "Vapi assistant phone number: " VAPI_PHONE

# ---------------------------------------------------------------
# STEP 5 — Trigger a Vercel deploy so env vars + new routes go live
# ---------------------------------------------------------------
echo
echo "STEP 5: Deploy to Vercel"
echo "Push branch if not already:"
echo "  git push origin feat/sales-motion-lock"
echo "Then open the PR + merge to main, OR run:"
echo "  vercel --prod"
pause_for "Production deploy complete (counterbench.ai live with new routes)"

# ---------------------------------------------------------------
# STEP 6 — Seed first firm
# ---------------------------------------------------------------
echo
echo "STEP 6: Seed first firm via admin endpoint"
read -P "Firm name: " FIRM_NAME
read -P "Attorney email (for intake alerts): " ATTORNEY_EMAIL
read -P "Attorney phone E.164 (e.g. +15614064984): " ATTORNEY_PHONE
read -P "Case types (comma-separated): " CASE_TYPES

curl -sS -X POST https://counterbench.ai/api/admin/receptionist/firms \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -H "content-type: application/json" \
  -d "{
    \"name\": \"$FIRM_NAME\",
    \"phoneNumber\": \"$VAPI_PHONE\",
    \"attorneyEmail\": \"$ATTORNEY_EMAIL\",
    \"attorneyPhone\": \"$ATTORNEY_PHONE\",
    \"caseTypes\": \"$CASE_TYPES\",
    \"callbackTime\": \"30 minutes\"
  }" | jq .

confirm_continue

# ---------------------------------------------------------------
# STEP 7 — E2E test call
# ---------------------------------------------------------------
echo
echo "STEP 7: End-to-end test"
echo
echo "Place a call to: $VAPI_PHONE"
echo "Expected:"
echo "  - Vapi assistant answers + screens"
echo "  - Email arrives at $ATTORNEY_EMAIL with transcript"
echo "  - If ATTORNEY_SMS_EMAIL set, SMS-via-email arrives"
echo
pause_for "Made test call"

echo
echo "Verify call logged:"
curl -sS https://counterbench.ai/api/receptionist/calls | jq '.calls[0]'
echo

echo "================================================="
echo "  Remote Receptionist V1 LIVE"
echo "================================================="
echo
echo "Cleanup:"
echo "  rm .env.local.scratch    # delete temporary key file"
echo
echo "Next: pitch to 3 PI firms (\$349/mo, 14-day pilot)"
echo "  Use tasks/sales-motion-lock-next-5.md outreach list"
