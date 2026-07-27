# SPEC — Conflict Check Blind Spot Audit (`/tools/conflict-check-audit`)

Status: proposal, awaiting approval
Date: 2026-07-24
Supersedes: `PRD-new-tools-aeo-seo.md` item #4 (see "Correction to the PRD" below)
Origin: 2026-07-18 content radar draft, scorecard 33/40
Data source: Ahrefs Keywords Explorer + SERP Overview (US), pulled 2026-07-24

---

## Correction to the PRD

`PRD-new-tools-aeo-seo.md` (2026-07-19) ranks this tool #4 and states: "**Zero
search volume.** This is not an SEO asset." That is wrong, and the error is
worth naming because it recurs: the PRD queried the tool's *name*, not the
problem's *name*. Searching "conflict check audit" returns nothing; searching
what the buyer actually types returns a live cluster.

| Keyword | Vol/mo | KD | CPC |
|---|---|---|---|
| conflict check | 300 | 5 | $6.00 |
| conflict checking software | 200 | – | – |
| conflict check software | 150 | 5 | $7.00 |
| conflict check meaning | 150 | – | – |
| law firm conflict check | 100 | 1 | $6.00 |
| client intake process law firm | 100 | 3 | – |
| imputed disqualification | 70 | 0 | – |
| conflicts check law firm | 70 | – | – |
| conflict checks for law firms | 40 | – | – |
| conflict check process | 30 | 1 | – (TP 400) |

~1,100/mo addressable, entire cluster at **KD 0–5**, CPC $6–7 (legal software
buyers). This is small volume with unusually high commercial intent — the
opposite of the PI consumer cluster in the PRD, and complementary to it.

**SERP evidence that DR 10 can compete** (`law firm conflict check`, top 10):

| Pos | Page | DR | UR | Traffic | RDs |
|---|---|---|---|---|---|
| 2 | Clio — How to Run a Conflict Check | 85 | 4 | 439 | 14 |
| 3 | Dentons — What is a Conflict Check | 80 | 0 | 197 | – |
| 4 | Reddit r/biglaw | 95 | 0 | 90 | – |
| 5 | Barnes Walker — glossary entry | 54 | 0 | 83 | **0** |
| 7 | INTA — trademark practice | 78 | 0 | 34 | **0** |
| 8 | **clientconflictcheck.com** | **8** | 4 | 376 | 133 |
| 10 | Gartner — Best Conflict Check Software | 92 | 4 | 381 | 1 |

Two things follow. First, **a DR 8 domain holds position 8** — domain authority
is not the gate here; counterbench.ai is DR 10. Second, **page-level authority
is near zero across the board** (UR 0–4, several pages with 0 referring
domains). These are beatable pages.

Third, and load-bearing for the format: **software/comparison intent is present
in the SERP** (positions 8 and 10). Google is willing to rank a tool for this
query. That is the specific check that Bates Sanity Check failed — there, every
top-10 result was definitional and no tool ranked, so a tool page could not
match intent. Here it can.

**Revised PRD sequence:** #4 stays after #1 (statute of limitations) on volume,
but it is no longer "sales-only." It is a small, high-intent SEO asset *and* the
best qualifying instrument in the set. If the immediate need is pipeline rather
than traffic, it ships first.

---

## What it is

Eight questions about how the firm *actually* runs conflict checks — not what
its written policy says. Output is a named list of blind spots, a risk tier, and
the specific scenario each blind spot fails on.

The qualifying power is structural: a firm cannot complete the audit without
admitting whether its conflict process exists in writing or in one person's
head. That admission is the opening for Paralegal Teams.

## Positioning constraints

- Vendor-neutral, per `GLOSSARY.md` and the directory's whole premise. The
  output may not read as a pitch for any conflict-check software, including a
  future Counterbench one.
- **Never the moat line.** Do not claim Counterbench is the only both-layers
  player (`CLAUDE.md` §3, memory `project_counterbench_moat_collapse`).
- Not legal advice. This audits *process*, never a specific conflict. Every
  output carries the notice; no output tells a firm whether it may take a matter.

## The eight questions

Each maps to a documented failure mode in conflict practice. Answer set is
fixed-choice, no free text (keeps scoring deterministic and server-renderable).

1. **Timing** — At what point is the check run? (before intake call / after
   intake before engagement / at engagement letter / varies)
2. **Scope of parties** — Which parties get searched? (named client only /
   client + adverse / + related entities and corporate families / + witnesses,
   experts, co-counsel)
3. **Former clients** — Are closed matters searched? (yes, all history / last N
   years / only if someone remembers / no)
4. **Prospective clients** — Are non-engaged consults recorded and searched?
   (yes / sometimes / no)
5. **Lateral hires** — Is an incoming attorney's or paralegal's prior client
   list run against the firm's book? (yes, systematically / informally / no)
6. **System of record** — Where do results live? (conflict-check software /
   practice-management system / spreadsheet / email / nowhere)
7. **Ownership** — Who can run a complete check today? (any trained staff / two
   or more people / exactly one person / unclear)
8. **Waivers** — Are waivers and ethical walls tracked with expiry and scope?
   (tracked in system / in the file / verbally / not tracked)

## Scoring

Each answer carries 0–3 points; 24 max. Tiers:

- **19–24 — Documented.** Process survives the departure of any one person.
- **12–18 — Person-dependent.** Works today, fails on turnover or volume.
- **6–11 — Reactive.** Catches the obvious conflict, misses the imputed one.
- **0–5 — Undocumented.** The firm is relying on memory.

Tier alone is not the product. The value is the **blind-spot list**: for each
low-scoring answer, name the concrete scenario it fails on. Q5 answered "no"
returns imputed disqualification on the lateral's prior book. Q4 answered "no"
returns the prospective-client-confidence problem. Q7 answered "exactly one
person" returns the single-point-of-failure finding — which is the same
argument as the 2026-07-21 radar draft on institutional knowledge, and should
cross-link to it.

## Build

- Route: `app/tools/conflict-check-audit/page.tsx`, thin server component
  matching `contract-qa-planner/page.tsx` (33 lines, imports a component from
  `components/`, pulls defaults from `lib/`).
- `components/ConflictCheckAudit.tsx` — the interactive form.
- `lib/conflict-check-audit.ts` — questions, weights, tier thresholds,
  blind-spot copy. Pure data + pure functions, unit-testable.
- No database, no API route, no persistence. Scoring is client-side arithmetic
  over a static table.
- **Server-rendered baseline is mandatory** (PRD shared requirement): the eight
  questions, all answer options, the tier definitions, and every blind-spot
  explanation must exist in the initial HTML. Crawlers and LLMs must see the
  full content without running the form.

## AEO requirements (from PRD §"Shared AEO requirements")

- [ ] JSON-LD `SoftwareApplication` + `FAQPage`
- [ ] Entry in `public/llms.txt`
- [ ] Entry in `app/sitemap.ts`
- [ ] Canonical + OG via `lib/seo.ts`
- [ ] Answers "what is a law firm conflict check" in the **first 40 words**, in
      plain text, above the interactive element — the SERP is half definitional
      and this is what wins the snippet and the citation
- [ ] Not-legal-advice notice, prominent

## Open gap — lead capture does not exist

The radar draft assumes an email gate. **There is no email capture anywhere in
`app/tools/`** — grep confirms zero matches across all seven existing tool
pages. So either:

- **(a) Ungated**, CTA links to `/paralegals`. Ships this week, no new
  infrastructure, no conversion tracking. *Recommended.*
- **(b) Gated**, requires building capture + storage + a sequence first. That is
  a separate project and it blocks this one.

Recommend (a). The audit's qualifying value comes from the firm confronting its
own answers, not from Counterbench holding an email address. Revisit gating
once there is a nurture sequence to gate *into*.

## Verification

`.claude/skills/verify` is the gate (`CLAUDE.md` §5): typecheck → lint → vitest
→ build → e2e (new route, so e2e applies) → screenshot. Add unit tests for the
scoring function: every tier boundary, and each blind-spot trigger.

## Effort

Roughly one focused session. The form is fixed-choice with no backend; the real
work is writing eight questions and their blind-spot explanations so a
practicing attorney recognises them as accurate rather than generic.

## Two decisions needed

1. Gated or ungated (recommend ungated — ship now).
2. Does this jump ahead of statute-of-limitations, or ship after it? Traffic
   says after; pipeline says now.
