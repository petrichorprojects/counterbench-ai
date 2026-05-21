# CounterbenchAI — Sales Motion Lock: Next 5 Paralegal Team Clients

Created: 2026-05-21
Owner: Phil Rimmler
Goal: Close 5 net-new paralegal team retainer clients by **2026-08-01**
Tripwire (kill criteria): < 8 paying retainer clients by 2026-09-01

## Why this doc

Strategic Self-Audit (May 2026) named CounterbenchAI the highest-probability winner in the portfolio (active clients, recurring revenue, hard-to-copy position) and identified the bottleneck as "no repeatable sales motion." This locks the motion.

Everything in this doc is the system. No edits to the motion mid-quarter — only data updates.

## ICP (locked)

**Firm shape**
- PI law firms, solo to 10-attorney
- Paralegal-understaffed (1 paralegal per 3+ attorneys, OR no dedicated paralegal)
- Volume: 30+ open cases at any time
- Geography: US, English-speaking, no jurisdiction restrictions
- Pain present: discovery deadlines slipping, medical chronology backlog, intake overflow

**Decision-maker**
- Managing partner or firm owner (NOT operations manager — too low in chain)
- 5+ years in practice (younger firms haven't felt the pain yet)

**Disqualifiers (skip immediately)**
- > 10 attorneys (different sales cycle, need enterprise motion)
- Insurance defense (different economics, lower fees, weak fit)
- Already using LegalEase/Abogados/offshore — wait 90 days post-cancellation
- Firms with full-time in-house paralegal pool > 5 people

## Offer (locked)

**Core retainer:** Paralegal Teams
- Starter — $3,750/mo — 1 dedicated paralegal, ~80 hours/mo
- Standard — $4,950/mo — 1 paralegal + AI tool access (EBT pipeline, intake)
- Pro — $6,500/mo — 2 paralegals + AI tools + dedicated case manager

**Pilot offer (for first 5 clients in this sprint)**
- 30-day pilot at $2,500 fixed
- No setup fee
- Money back if not satisfied at day 14
- Auto-converts to chosen tier at day 31 unless cancelled

**Why pilot:** Reduces close friction. Self-Audit flagged "first-customer avoidance" — the pilot is structurally easier to say yes to.

## Channel mix (locked — 70/20/10)

### 70% — Direct outbound (highest signal, slowest cycle)

**Source list:** `~/Downloads/Projects/CounterbenchAI/tasks/PI_FIRMS.xlsx` + `Counterbench Targets/`

**Signal trigger:** Paralegal job posting on Indeed/LinkedIn in last 30 days
- Means: actively understaffed, budget approved, problem named
- Volume target: 20 signals/week, 100/month

**Cadence per target (12 days, 6 touches):**
- Day 0: Email — case-study-led, no ask, 3 sentences
- Day 2: LinkedIn connection request (no message)
- Day 5: Email — specific cost comparison ($65k+ FTE vs $3,750/mo retainer)
- Day 7: LinkedIn DM if connected
- Day 10: Email — pilot offer, money-back, calendar link
- Day 12: Phone call (warm or cold) OR drop

**Email templates:** `~/Downloads/Projects/CounterbenchAI/tasks/cold-email-batch-1/`

### 20% — Reddit / community pull

**Subs:** r/legaltech, r/paralegal, r/LawFirm, r/Lawyertalk
**Cadence:** 3 substantive comments/week + 1 long-form post/month
**Goal:** Inbound leads to https://counterbench.ai/paralegals
**Playbook:** `~/Downloads/Projects/CounterbenchAI/tasks/reddit-outbound-playbook.md`

### 10% — Referrals

**Source:** existing CB clients + Petrichor portfolio
**Offer:** 1 month of buyer's retainer free for referrer if referral signs annual
**Action:** Email all current clients once on day 7 of this sprint

## Weekly cadence (locked)

### Monday — Pipeline review (90 min)
- Pull this week's signals (paralegal job postings)
- Score 20 firms, drop 0–10 into outreach queue
- Review Reddit weekly KPIs: comments, replies, profile views
- Update `tasks/pipeline.csv` (create if missing)

### Tuesday — Outbound batch (2 hrs)
- Send 20 personalized day-0 emails
- Send 20 day-5 follow-ups
- Make 5 phone calls from day-12 list

### Wednesday — Inbound + meetings
- Take discovery calls (Calendly default)
- Process inbound from blog/Reddit/LinkedIn

### Thursday — Content + Reddit
- Write 1 blog post for counterbench.ai (rotate: case study, ICP pain, comparison)
- 5 Reddit comments
- 5 LinkedIn comments on prospect posts

### Friday — Close + retro
- Pilot proposals out
- Update pipeline.csv with stage changes
- Weekly retro: what worked, what to drop
- One sentence to memory: this week's biggest lesson

## Pipeline stages (locked)

1. **Signal** — paralegal job post detected
2. **Researched** — firm sized, partner identified, case types confirmed
3. **Contacted** — day-0 email sent
4. **Engaged** — replied / opened multiple times / connected on LinkedIn
5. **Call booked** — discovery call on calendar
6. **Call held** — discovery complete, qualified
7. **Pilot proposed** — written proposal sent
8. **Pilot signed** — first invoice paid
9. **Converted** — month 2 invoice paid (counts toward "5 clients")
10. **Lost** — explicit no OR 30 days no response post-day-12

Target conversion: 100 signals → 30 contacted → 10 engaged → 5 calls → 3 pilots → 2 conversions per month. Hit 2 conversions × 2.5 months = 5 clients by 2026-08-01.

## KPIs (locked — review every Monday)

| Metric | Weekly target | Track in |
|--------|--------------|----------|
| Signals identified | 20 | pipeline.csv |
| Day-0 emails sent | 20 | pipeline.csv |
| Reply rate | > 8% | pipeline.csv |
| Calls booked | 2 | Calendly + pipeline.csv |
| Pilots proposed | 1 | pipeline.csv |
| Pilots signed | 0.5 (1 every 2 weeks) | pipeline.csv |
| MRR added | $2,500 | invoicing |

**Red flag:** any KPI < 50% of target for 2 consecutive weeks → emergency motion review.

## What this motion explicitly does NOT do

(Anti-scope creep — Self-Audit flagged "pre-revenue infrastructure bias")

- No new landing pages until 3 pilots signed
- No new content categories until existing posts have 90 days of data
- No paid ads until cold outbound proves 8% reply rate
- No SEO investment beyond existing posts
- No new tool building (EBT pipeline pitches use existing build)
- No new ICP segments (insurance defense, mid-market, etc.) until 5 PI clients converted
- No new pricing tiers
- No partnership outreach (legal staffing agencies, etc.) until 5 clients

## Stop conditions (when to revisit this doc)

1. **5 clients closed before 2026-08-01** → revisit to scale motion (hire 2nd closer, add 2nd ICP)
2. **0 pilots closed by 2026-07-01** → emergency review: ICP wrong, offer wrong, or channel wrong?
3. **Reply rate < 4% for 4 weeks** → email copy is the bottleneck, rebuild from templates
4. **Pilot → conversion rate < 50%** → product/service quality issue, NOT sales issue, fix delivery

## First actions (this week)

- [ ] Create `tasks/pipeline.csv` with 10 firms from PI_FIRMS.xlsx + their paralegal job postings
- [ ] Confirm Calendly link working (use VerdictOps fix from commit 2827e99)
- [ ] Email all current clients re: referral offer (1 month free for annual referral)
- [ ] Send first batch of 20 day-0 emails Tuesday 2026-05-26
- [ ] Schedule Monday pipeline review block 9-10:30am
- [ ] Add to `tasks/decisions.md`: "Sales motion locked 2026-05-21, no edits to motion until 2026-08-01 review"

## Reference

- Strategic Self-Audit: `~/Downloads/Strategic-Self-Audit-Phil-Rimmler-May2026.docx`
- Kill criteria: `~/Downloads/Projects/_ops/03-kill-criteria.md`
- EBT pipeline (pitchable asset): VerdictOps `tasks/remote-receptionist-v1-scope.md` + EBT outline generator
- Existing cold email batch: `tasks/cold-email-batch-1/`
- Reddit playbook: `tasks/reddit-outbound-playbook.md`
- ICP brand model: `tasks/brand-narrative-enemy-model.md`
