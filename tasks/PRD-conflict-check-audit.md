# PRD — Conflict Check Blind Spot Audit

**Status:** v1 BUILT — in review, not yet live. PR [#27](https://github.com/petrichorprojects/counterbench-ai/pull/27) (branch `feat/conflict-check-audit-clean` → `main`). Verify gate green off `origin/main`; awaiting merge + Vercel deploy to counterbench.ai. See Build log below.
**Date:** 2026-07-24 · **Built:** 2026-07-26
**Owner:** Phil Rimmler
**Supersedes:** `PRD-new-tools-aeo-seo.md` item #4
**Companion:** `SPEC-conflict-check-audit.md` (build detail)
**Governed by:** `_ops/EXECUTION.md` (betting table — every active bet carries a DoD gate and a breaker date; past breaker with gate unmet → Graveyard, no silent extensions)

---

## Build log

**2026-07-26 — v1 built, in review (PR #27), 2 days ahead of the 2026-08-08 ship breaker.**

Route `/tools/conflict-check-audit`, 7 files. Verify gate green off a clean
`origin/main` checkout: typecheck 0 · lint 0 · vitest 22/22 · build passes (route
prerenders static) · SSR baseline confirmed (all questions, rule citations, tiers,
`SoftwareApplication` + `FAQPage` JSON-LD in static HTML) · full browser flow driven.

Built per this PRD's v1 scope (§4). Deferred as planned: email gate,
two-respondent mode, state pages, benchmark report.

Deltas from the plan, carried as open items into review:
- **Benchmark row is dataLayer-only** — no server sink yet. Metric #6 (n=200)
  cannot begin accumulating until a sink exists. Wire before real traffic.
- **`lib/analytics.ts` was uncommitted on another branch**, so the two analytics
  calls are inlined in the component (identical `tool_view` / `tool_click_cta`
  event shapes). No behaviour change; fold back into the shared module later.
- **Rule citations need a lawyer's eyeball** before merge — standard Model Rules
  with a last-verified date + state-variance caveat, but state rules govern.

Remaining before Metric #1 counts as met: **merge PR #27 + Vercel deploy + verify
the live URL.** Built ≠ live.

---

## 1. The bet, in one line

A free eight-question audit of how a firm *actually* runs conflict checks wins a
KD 0–5 keyword cluster, qualifies Paralegal Teams buyers by making the firm
state its own gap out loud, and — if completions reach volume — produces the
benchmark dataset that finally earns counterbench.ai the links it does not have.

**Wager:** one build session for v1. Not the benchmark report. That is a
separate, later bet gated on evidence.

---

## 2. Why now — the evidence

### 2.1 The cluster is real and unclaimed

Ahrefs, US, pulled 2026-07-24:

| Keyword | Vol/mo | KD | CPC |
|---|---|---|---|
| conflict check | 300 | 5 | $6.00 |
| conflict checking software | 200 | – | – |
| conflict check software | 150 | 5 | $7.00 |
| conflict check meaning | 150 | – | – |
| law firm conflict check | 100 | 1 | $6.00 |
| client intake process law firm | 100 | 3 | – |
| imputed disqualification | 70 | **0** | – |
| conflicts check law firm | 70 | – | – |
| conflict checks for law firms | 40 | – | – |
| conflict check process | 30 | 1 | – (TP 400) |

~1,100/mo addressable, entire cluster KD 0–5, CPC $6–7. Small volume, unusually
high commercial intent.

### 2.2 A DR 8 domain holds page one

SERP for `law firm conflict check`:

| Pos | Page | DR | UR | Traffic | RDs |
|---|---|---|---|---|---|
| 2 | Clio — How to Run a Conflict Check | 85 | 4 | 439 | 14 |
| 3 | Dentons | 80 | 0 | 197 | – |
| 4 | Reddit r/biglaw | 95 | 0 | 90 | – |
| 5 | Barnes Walker — glossary | 54 | 0 | 83 | **0** |
| 7 | INTA | 78 | 0 | 34 | **0** |
| 8 | **clientconflictcheck.com** | **8** | 4 | 376 | 133 |
| 10 | Gartner — Best Conflict Check Software | 92 | 4 | 381 | 1 |

Three reads. Domain authority is not the gate — a DR 8 site ranks, and
counterbench.ai is DR 10. Page-level authority is negligible (UR 0–4, several
with zero referring domains) — these pages are beatable. And **software intent
is present in the SERP** (positions 8, 10), so Google will rank a tool here.

### 2.3 The intent check that killed the alternative

Bates Sanity Check looked stronger on volume (`bates numbering`, 1,500/mo,
KD 2). Its SERP is 100% definitional — Wikipedia, Adobe, Everlaw guides, zero
tools — and every audit-specific query (`bates number gaps`, `duplicate bates
numbers`, `bates numbering checker`) returns **no data at all**. A tool page
there cannot match intent. Conflict check passes the same test. That test is
now mandatory before any tool is specced.

### 2.4 Correction to the prior PRD

`PRD-new-tools-aeo-seo.md` states this tool has "**zero search volume**. This is
not an SEO asset." That is wrong. The error: it queried the tool's *name*, not
the problem's *name*. Recorded here so the failure mode does not repeat — it is
the same mistake that nearly shipped Bates.

---

## 3. Who it is for, and the job

**Buyer:** owner or managing attorney, solo to 10-attorney firm. Secondary:
the paralegal or office manager who actually runs intake.

**Job to be done:** "I think our conflict process is fine, but I could not prove
it and I am not sure what I am missing."

**Why they finish it:** eight fixed-choice questions, under three minutes, no
signup, and the output names a specific scenario they recognise rather than a
grade.

**Why it qualifies:** a firm cannot answer Q7 ("who can run a complete check
today?") with "exactly one person" and still believe its process is
institutional. The tool makes the Paralegal Teams argument on the firm's own
evidence. No pitch required.

---

## 4. Scope

### v1 — in

- Eight fixed-choice questions, each citing the ABA Model Rule it tests
- 0–24 score, four risk tiers
- Per-answer blind-spot findings: the concrete scenario that fails
- Per-finding remediation, ranked by effort — including the honest "20-minute
  fix, do it yourself" ones
- One-page PDF takeaway, forwardable to a managing partner
- Anonymous benchmark row written on completion
- Post-result, pre-benchmark ask: firm size, state, practice area (three fields,
  no email)
- Prominent not-legal-advice notice + plain-language privacy statement
- Full AEO wiring (§7)
- Analytics instrumentation (§8)

### v1 — explicitly out

| Deferred | Why | Revisit at |
|---|---|---|
| Email gate | No nurture sequence exists to gate into. `app/tools/` has zero email capture today. | When a sequence exists |
| Two-respondent mode (partner vs paralegal delta) | Best mechanic in the set, but doubles completion burden before we know anyone completes it once | n=50 completions |
| State-level pages `/[state]` | 50 indexable pages off state bar rule variance. Real, but v2. | n=50 + v1 ranking |
| Benchmark report | Needs n=200. Separate bet. | §6 |
| Any conflict-check *software* | Not the business | Never |

### Non-negotiables

- **Vendor-neutral.** Output may not read as marketing for any conflict-check
  product, including a future Counterbench one. The directory's entire value is
  neutrality (`GLOSSARY.md`, `CLAUDE.md` §3).
- **Never the moat line.** Do not claim Counterbench is the only both-layers
  player. It is false (CloudLex, Telamanis, Finch, Lexvia).
- **Not legal advice.** Audits *process*, never a specific conflict. Cite the
  rule, never interpret it. Never tells a firm whether it may take a matter.

---

## 5. The instrument

### 5.1 Questions → rules

Each question tests a documented failure mode and cites its rule. This is what
converts eight questions written by a non-lawyer into something a practicing
attorney cannot dismiss — and rule-cited content is disproportionately what
LLMs cite back.

| # | Question | Failure mode | Model Rule |
|---|---|---|---|
| 1 | When is the check run? | Post-engagement discovery | 1.7 |
| 2 | Which parties are searched? | Corporate families, related entities | 1.7, 1.13 |
| 3 | Are closed matters searched? | Former-client duties | 1.9 |
| 4 | Are non-engaged consults recorded? | Prospective-client confidences | 1.18 |
| 5 | Are lateral hires' prior books run? | Imputed disqualification, screening | 1.10 |
| 6 | Where do results live? | No system of record | – |
| 7 | Who can run a complete check today? | Single point of failure | – |
| 8 | Are waivers and walls tracked with scope + expiry? | Informed consent, confirmed in writing | 1.7(b) |

**Verification requirement:** rule numbers and text must be checked against the
current ABA Model Rules before ship, with a last-verified date on the page, and
a stated caveat that state rules vary. `imputed disqualification` is 70/mo at
KD 0 and unclaimed — Q5's explainer is the page that takes it.

### 5.2 Scoring

0–3 points per answer, 24 max.

| Tier | Score | Meaning |
|---|---|---|
| Documented | 19–24 | Survives the departure of any one person |
| Person-dependent | 12–18 | Works today; fails on turnover or volume |
| Reactive | 6–11 | Catches the obvious conflict, misses the imputed one |
| Undocumented | 0–5 | Running on memory |

The tier is not the product. The blind-spot list is. Q7 = "exactly one person"
returns the single-point-of-failure finding — the same argument as the
2026-07-21 radar draft on institutional knowledge, and it should cross-link.

---

## 6. The benchmark — a separate, gated bet

Every completion writes an anonymous row (firm size, state, practice area, eight
answers). At **n=200**, that dataset becomes *The State of Conflict Checking in
Small Law Firms*.

Why it matters more than the tool: counterbench.ai is DR 10 with **0 organic
keywords**. The bottleneck is link acquisition, not page quality. The model is
Clio — the firm ranking #2 on this SERP. Clio's blog post is not their moat;
the annual Legal Trends Report is, and the citations it earns are what make the
blog post rank.

**Honest cold-start risk:** 200 completions on a DR 10 domain with no list come
from LinkedIn, not search. If completions stall (§9 breaker), the answer is
distribution — not a better tool. Do not respond to a distribution failure by
rebuilding the instrument.

---

## 7. AEO / SEO requirements

- [ ] JSON-LD `SoftwareApplication` + `FAQPage`
- [ ] Entry in `public/llms.txt`
- [ ] Entry in `app/sitemap.ts`
- [ ] Canonical + OG via `lib/seo.ts`
- [ ] **Server-rendered baseline** — all eight questions, every answer option,
      tier definitions and blind-spot copy present in initial HTML. No
      client-only output.
- [ ] Answers "what is a law firm conflict check" in the **first 40 words**, in
      plain text, above the interactive element. The SERP is half definitional;
      this wins the snippet and the citation.
- [ ] Last-verified date on every rule citation

---

## 8. Success metrics — hypothesis · metric · threshold · breaker

House format, `_ops/EXECUTION.md`. Past breaker with threshold unmet → Graveyard
or explicit re-bet. No silent extensions.

| # | Hypothesis | Metric | Threshold | Breaker |
|---|---|---|---|---|
| 1 | It ships at all | v1 live on counterbench.ai | deployed + verify gate green | **2026-08-08** — ⏳ verify gate green + PR #27 open (2026-07-26); merge + deploy still pending |
| 2 | Firms finish it | completion rate (start → result) | ≥60% | 2026-09-05 |
| 3 | It reaches firms | completions | ≥50 | **2026-09-05** |
| 4 | It qualifies | result → `/paralegals` click, tier Reactive/Undocumented | ≥15% | 2026-09-05 |
| 5 | It ranks | top-10 US for any cluster term | 1 keyword | 2026-10-24 |
| 6 | Benchmark viable | completions | ≥200 | 2026-12-01 → report bet |

Instrument via `lib/analytics.ts`: completion rate, per-question drop-off, tier
distribution, CTA click by tier. Without this, a bad tool and bad distribution
are indistinguishable.

**Read the metrics correctly.** #2 low → the instrument is wrong (too long, too
vague, questions not recognisable). #3 low with #2 healthy → distribution is
wrong, tool is fine. These call for opposite responses.

---

## 9. Kill criteria

- Threshold #1 missed → the constraint is throughput, not this tool. Stop and
  fix shipping. (Standing evidence: 60 radar drafts unpublished, 17 tool
  concepts unbuilt, zero shipped in 30 days.)
- #3 missed with #2 healthy → tool is fine, distribution is absent. Do not
  rebuild. Fix distribution or park.
- Both #2 and #3 missed → Graveyard. No re-spec without an explicit re-bet.
- Business-level tripwire is unchanged and lives in `_ops/03-kill-criteria.md`
  (CB <8 retainer clients by 2026-09-01). This tool is a contributor to that
  number, not a substitute for it.

---

## 10. Sequencing

1. **Publish the 7 × 9/10 radar drafts.** Zero build cost, already written.
   This is the distribution that every metric above depends on. If these produce
   nothing, the tool has no audience and the benchmark has no source.
2. **Build v1** — one session (§4).
3. **Launch pairing:** publish the 2026-07-21 draft (2nd-year associate first-
   chairing a trial — "count the processes only one person can run"), then
   release the tool as the instrument that answers it. The launch post was
   written a month ago.
4. **Evaluate at 2026-09-05** against §8.
5. **v2 on evidence:** two-respondent mode, then state pages.
6. **Benchmark report** at n=200.

**This ships before statute-of-limitations** (`PRD-new-tools-aeo-seo.md` #1).
That answers the open sequencing question. SoL is 3,500/mo but KD 22 on a DR 10
domain with 0 organic keywords — a 6–12 month play. This is KD 0–5, winnable
this quarter, and it qualifies buyers for a retainer being actively sold. Take
the smaller winnable thing while the domain has no authority.

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| Questions read generic → attorneys dismiss it | Rule citations (§5.1); verify against current Model Rules before ship |
| Reads as legal advice | Process-only, never matter-specific; prominent notice; cite never interpret |
| State rule variance makes an answer wrong | State caveat + last-verified date; state nuance deferred to v2 pages |
| Firms won't disclose compliance gaps | Ungated, nothing stored personally, said plainly at the top |
| Benchmark never reaches n | Accepted. Gated bet (§6), not a v1 dependency |
| Ships and is never promoted | Sequencing step 1 + launch pairing (§10) |
| Vendor-neutrality drift in output copy | Review against `GLOSSARY.md` in the DoD |
| **Dirty tree** — `feat/ten-decisions-series` has ~10 modified files incl. `app/tools/[slug]/page.tsx` | Reconcile or stash before touching `app/tools/` |

---

## 12. Definition of done

`.claude/skills/verify` is the gate (`CLAUDE.md` §5): typecheck → lint → vitest
→ build → e2e (new route) → screenshot. Criteria immutable during a run —
editing a test or config to reach green voids it.

Additional to the standard gate:

- [ ] Unit tests: every tier boundary, every blind-spot trigger
- [ ] Rule citations verified against current Model Rules, last-verified date on page
- [ ] Server-rendered baseline confirmed with JS disabled
- [ ] Copy reviewed for vendor-neutrality and absence of the moat line
- [ ] Analytics events firing
- [ ] Live URL verified post-deploy (never assume CI passed)

---

## 13. Open decisions — two

1. **Ungated with a post-result three-field ask** (recommended) or a full email
   gate? Recommendation: ungated. The qualifying value is the firm confronting
   its own answers, not us holding an address — and the gate needs infrastructure
   that does not exist.
2. **Does this jump ahead of statute-of-limitations?** Recommendation: yes,
   per §10. Traffic says after; pipeline says now; the domain's authority says
   the KD 22 play is not available yet regardless.
