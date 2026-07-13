# Signal Sourcing SOP — Weekly 15-Minute Monday Routine

Goal: 20 fresh signals → 10 into `pipeline.csv` → drive Tuesday outbound batch.

Anchor doc: `tasks/sales-motion-lock-next-5.md` (KPI: 20 signals/week).

## What counts as a signal

Any public evidence a PI firm is understaffed on paralegal work:

**Tier 1 (strongest):**
- Paralegal job posted in last 30 days
- Multiple paralegal openings at same firm
- "Immediately hiring" / "urgent" language
- Solo attorney posting for first paralegal

**Tier 2 (medium):**
- Case management / intake specialist role at PI firm
- Firm expanded to new office without staff plan
- Attorney posts on r/LawFirm asking for paralegal advice
- Firm reposts same paralegal ad 60+ days later (still unfilled)

**Tier 3 (weakest — use if Tier 1/2 dry):**
- Firm hired new attorney recently (implies paralegal ratio strain)
- Firm celebrating case win / big verdict (revenue justifies retainer)

## ICP hard filters (skip if any fail)

- Personal injury practice (dedicated or 50%+ caseload)
- Solo to 10-attorney (skip 11+, different sales cycle)
- US-based, English-first
- Not currently on LegalEase / Abogados / offshore (skip 90d post-cancellation)
- Not > 5 in-house paralegals already

## Monday 15-minute routine

Run `./scripts/open-signal-sources.fish` — opens 6 pre-scoped search tabs.
Work each tab 2 min. Copy hits into `pipeline.csv` w/ these columns:

```
Date Found,Signal Source,Firm Name,Firm Size,Practice Area,Decision Maker,Contact Email,Stage,Day-0 Sent,Day-5 Sent,Day-10 Sent,Reply,Notes
```

### Tab 1 (2 min) — Indeed: paralegal personal injury
`https://www.indeed.com/jobs?q=personal+injury+paralegal&sort=date&fromage=14`

Filter mentally: solo/small firm, not big-law. Grab firm name → check Firm size on their site → note attorney count.

### Tab 2 (2 min) — LinkedIn: recent paralegal jobs
`https://www.linkedin.com/jobs/search/?keywords=paralegal%20personal%20injury&f_TPR=r604800&sortBy=DD`

Same filter. Use "About the company" for firm size signal.

### Tab 3 (2 min) — LinkedIn: intake specialist / case manager
`https://www.linkedin.com/jobs/search/?keywords=intake%20specialist%20personal%20injury&f_TPR=r604800&sortBy=DD`

Case managers = adjacent pain, same buyer.

### Tab 4 (2 min) — Google: reposted job ads
`https://www.google.com/search?q=%22personal+injury+paralegal%22+site%3Aindeed.com&tbs=qdr:m`

Reposted 60+ day ads = unfilled → strongest signal.

### Tab 5 (2 min) — Reddit r/LawFirm asks
`https://www.reddit.com/r/LawFirm/search/?q=paralegal&t=week&sort=new`

Attorney threads about paralegal problems → warm inbound-adjacent leads.

### Tab 6 (2 min) — Reddit r/Lawyertalk PI threads
`https://www.reddit.com/r/Lawyertalk/search/?q=personal+injury+paralegal&t=week`

Same buyer pool.

### Wrap-up (3 min)

- Dedupe against existing rows in `pipeline.csv`
- Score each: Tier 1 = 3pts, Tier 2 = 2pts, Tier 3 = 1pt
- Keep top 10 by score for Tuesday day-0 batch
- Set `Stage = Signal` and `Date Found = YYYY-MM-DD`

## Contact enrichment (batch Monday afternoon, 30 min)

For each of the 10 signals:
1. Find managing partner name on firm site
2. Email format via https://hunter.io (10 free/mo) or guess (`firstname@firm.com`, `flast@firm.com`)
3. Verify with https://www.mailtester.com (free)
4. Set `Stage = Researched`

## Weekly targets (from sales motion lock)

| Metric | Target |
|--------|--------|
| Signals identified | 20 |
| Researched → contactable | 10 |
| Day-0 emails sent Tuesday | 20 (10 fresh + 10 repeats from prior week) |
| Reply rate | > 8% |
| Calls booked | 2 |
| Pilots proposed | 1 |
| Pilots signed | 0.5 (1 every 2 weeks) |

## When signals go dry

If < 10 Tier 1/2 signals for 2 weeks:
- Add Tier 4: state bar association member directories (public)
- Add Tier 5: PI firm ranking lists (Super Lawyers, Best Lawyers)
- Do NOT relax ICP filters — you'll waste day-0 emails on wrong buyer

## Red flag routine (from sales motion lock)

Any KPI < 50% of target for 2 consecutive weeks → emergency motion review.
