# Phase 5 — Pilot Eval Rubric

3-cycle evaluation (3 Sundays). Decides: fan out to Petrichor, tune voice, or kill.

## When to run
After 3 autonomous cycles land in `#cb-content-review`. Earliest possible: Monday after the 3rd Sunday run.

Block fan-out to other businesses until this eval passes.

---

## Scoring — log per draft

For each draft that lands in Slack, score it within 24h while context is fresh. Fill a row in `PHASE-5-LOG.md` (template at end of this file).

### 1. Voice fit (0/1/2)
- **2** = ship as-is or 1-line tweak
- **1** = light edit (rework 1-2 sentences, no structural change)
- **0** = rewrite required (wrong angle, wrong tone, fabricated specific, off-brand)

### 2. Source fidelity (0/1)
- **1** = every specific claim traces to the Intel Radar item or a documented public fact
- **0** = at least one invented case name, fabricated stat, or claim with no source

Source fidelity is the kill switch. Any 0 → root-cause same day. Two 0s across the pilot → halt the engine until fixed.

### 3. Counter-narrative integrity (0/1)
- **1** = "tools AND team" surfaces naturally OR is correctly absent (e.g. tool-directory-led post)
- **0** = collapses positioning (tools-only or team-only without the dual), or jams the line into a post where it does not fit

### 4. Hook quality (0/1/2)
- **2** = standalone first line that would stop scroll for a PI attorney
- **1** = passable, generic, but no glaring fail (no "I", no buzzwords)
- **0** = generic opener, starts with "I", or buries the lede

### 5. Format fit (0/1)
- **1** = text-post / carousel / infographic choice fits the signal shape
- **0** = wrong format picked (text-post for a stat-comparison; carousel for a 1-line opinion)

### 6. Time-to-decision (minutes)
- Wall-clock from "I open the draft" to "approved / edited / killed". Record raw minutes.
- Target: ≤10 min/draft. >20 min = friction signal.

---

## Per-cycle aggregates

Compute after each Sunday batch (2 drafts → 1 row per cycle):

| Metric | Formula | Target |
|---|---|---|
| Voice score avg | sum(voice fit) / (2 × drafts) | ≥0.70 |
| Source fidelity rate | drafts with score 1 / drafts | 1.00 |
| Counter-narrative rate | drafts with score 1 / drafts | ≥0.80 |
| Hook avg | sum(hook) / (2 × drafts) | ≥0.60 |
| Format-fit rate | drafts with score 1 / drafts | ≥0.80 |
| Median decision time | median(minutes) | ≤10 |
| Approval rate | approved drafts / total drafts | ≥0.50 |
| Publish rate | published drafts / approved drafts | ≥0.60 |

---

## Pilot exit gate (after cycle 3)

Aggregate across **all 6 drafts** (3 cycles × 2 drafts).

### PASS — fan out to Petrichor
All of the following hold:
- Voice score avg ≥0.70
- **Source fidelity rate = 1.00 (no exceptions)**
- Counter-narrative rate ≥0.80
- ≥3 drafts published (PRD §4 criterion)
- Median decision time ≤10 min

Action: clone engine to `Projects/Petrichor-Projects/content/engine/`. Rewrite `brand-voice.md` for Petrichor audience. Build the Petrichor signal source (post-funding startup tracker) since no Intel-Radar-equivalent exists yet.

### TUNE — fix and rerun 3 more cycles
Any one of:
- 0.50 ≤ voice avg < 0.70
- Counter-narrative rate < 0.80 but ≥0.50
- Hook avg < 0.60
- Format-fit rate < 0.80

Action: identify which prompt section drove the misses, edit `brand-voice.md` + the n8n `BRAND_VOICE` constant, run 3 more cycles. Do NOT fan out.

### KILL — engine concept fails
Any of:
- Source fidelity rate < 1.00 across cycles after a prompt fix attempt
- Voice avg < 0.50
- Approval rate < 0.30 (you reject most of what it produces)
- Median decision time > 30 min (drafts cost more time than starting from blank)

Action: shut down workflow. Write postmortem to `Projects/CounterbenchAI/content/engine/POSTMORTEM.md`. Move topic-selection back to manual.

---

## Diagnostic — when a metric fails, root-cause

Map failure → likely lever:

| Failing metric | Likely lever | Where to edit |
|---|---|---|
| Voice score avg low | Voice block too soft or contradicts itself | `brand-voice.md` + n8n `BRAND_VOICE` |
| Source fidelity = 0 | Source signal too thin, model fills the gap | Add explicit "emit `SKIP:thin-signal` token instead of fabricating" to prompt; raise `SCORE_MIN` |
| Counter-narrative miss | Position rule buried in voice block | Move counter-narrative to top of system prompt + add example |
| Hook quality low | No hook formulas in prompt | Add the 5 hook formulas from `linkedin-post-generator` skill |
| Format mismatch | Selector heuristic too crude | Tune regex in `topic-selector.js` + n8n Code node |
| Decision time high | Drafts almost-right but not-quite (most expensive failure mode) | Pull 3 high-time drafts, find the common edit, codify in voice block |

---

## PHASE-5-LOG.md template

Create this file when cycle 1 lands. One row per draft.

```markdown
# Phase 5 Pilot Log

| Cycle | Date | Draft # | Source title | Format | Voice (0-2) | Source (0/1) | CN (0/1) | Hook (0-2) | Format-fit (0/1) | Decision min | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-06-14 | 1 | ... | text-post | 2 | 1 | 1 | 2 | 1 | 6 | published | shipped clean |
| 1 | 2026-06-14 | 2 | ... | carousel | 1 | 1 | 1 | 1 | 1 | 12 | approved | tightened slide 3 |
```

After cycle 3: compute aggregates, apply exit gate, record decision in this file.

---

## Honest expectations

First 1-2 cycles will likely score TUNE, not PASS. Voice blocks always need iteration against real output. Budget 2 prompt-tuning rounds before judging the engine concept itself. The mechanism (Intel Radar → selector → generator → Slack) is the load-bearing piece; voice is config on top.

If TUNE happens twice with no improvement in voice avg between rounds, that is the kill signal — not a single low cycle.
