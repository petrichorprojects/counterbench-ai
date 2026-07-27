# Publish Queue — the 7 nines

**Built:** 2026-07-24
**Source:** #content-ready Content Radar, 2026-06-27 → 2026-07-23
**Scope:** the 7 drafts scored 9/10. All CounterbenchAI. All previously unpublished.
**Status:** STAGED DRAFTS. Nothing is published. Phil posts; Claude never sends or publishes.
**Why this exists:** PRD-conflict-check-audit §10 step 1 — this is the distribution that every metric in that PRD depends on.

---

## Cadence

Tue/Wed/Thu, 3 per week. Finishes 2026-08-11, which clears the conflict-audit
ship date (2026-08-08) so the launch pairing lands the week after.

| # | Slot | Post | Theme |
|---|---|---|---|
| 1 | Tue 2026-07-28 | Struck off for *not* using AI | Governance / news |
| 2 | Wed 2026-07-29 | Billable hours feel impossible | Revenue capture |
| 3 | Thu 2026-07-30 | Would you report improper AI use? | Governance / callback to #1 |
| 4 | Tue 2026-08-04 | Price the hours before the tools | Economics / solo buyer |
| 5 | Wed 2026-08-05 | 200,000 pages at 7pm | Capacity / crisis |
| 6 | Thu 2026-08-06 | "Why aren't you quicker?" | Capacity / the math |
| 7 | Tue 2026-08-11 | What's on your protect list? | Economics → bridges to the audit |

**Arc:** authority → revenue → governance → economics → crisis → math → bridge.
#7 ends on "what only a person can own," which is the same argument as Q7 of the
conflict audit. That is the handoff into the launch pairing (the 2026-07-21
institutional-knowledge draft + tool release, week of 2026-08-13).

---

## Blocking checks before ANY of these post

- [x] **#1 — UK claim VERIFIED 2026-07-24.** Real. UKJT published the *Legal
      Statement on Liability for AI Harms*, July 2026, chaired by Sir Geoffrey
      Vos, Master of the Rolls. Quote confirmed: "a professional could also be
      liable for failing to use AI for a task when a professional exercising
      reasonable care and skill would have done so." Regulatory punishment
      including being barred from practising is on the table. **Body updated:**
      "guidance" → "legal statement" (it is a non-binding statement of law, not
      regulation — lawyers will notice), Vos named, and the actual test added
      ("reasonable professional of comparable rank and specialism").
      Sources: legalfutures.co.uk, legalcheek.com, burges-salmon.com.
- [x] **#3 — HIPAA claim VERIFIED 2026-07-24, rephrased.** Substantially true
      but the original phrasing was attackable. As of July 2026: Anthropic's
      standard Claude Enterprise is not BAA-covered by default (admin must
      enable HIPAA mode with a signed BAA; Free/Pro/Max/Team/self-serve
      Enterprise have no BAA path). OpenAI offers a BAA for sales-managed
      Enterprise but it must be requested and executed; ChatGPT for Healthcare
      (Jan 2026) is the regulated path. **Body updated** to the general,
      unattackable form — which is also more useful, because it tells the reader
      what to check. Sources: support.claude.com HIPAA-ready Enterprise plans,
      hipaajournal.com.
- [ ] **Source links — do not deep-link the individual.** Every draft is built on
      one person venting in r/paralegal or r/LawFirm. Linking the thread exposes
      a named account to an audience that may include their employer. Recommend
      citing the subreddit in the first comment without the permalink. The drafts
      already anonymise the poster; the link undoes that.
- [ ] **Strip tool-concept blocks.** Several drafts carry internal scorecard
      notes. Bodies below are already cleaned — verify nothing internal survived.
- [ ] **Hashtags standardised.** Only 3 of 7 had them. Pick one set and apply
      consistently or drop entirely.
- [ ] **CTA convention.** No comment-bait. Newsletter subscribe + direct DM,
      per the LinkedIn principles.

---

## 1 — Tue 2026-07-28

**Source:** r/legaltech, "Lawyers risk being struck off for not using AI" · insight · 9/10 · radar 2026-07-19
**Hook (first 2 lines, pre-truncation):** "For three years the legal profession has treated AI as a risk you take on. / The UK just flipped it."
**Why first:** news hook decays, and it earns authority without selling anything.

```
For three years the legal profession has treated AI as a risk you take on.

The UK just flipped it.

The UK Jurisdiction Taskforce, backed by the Ministry of Justice and chaired by Sir Geoffrey Vos, the Master of the Rolls, published a legal statement saying a professional could be liable for failing to use AI for a task when a professional exercising reasonable care and skill would have done so. Regulatory punishment on the table includes being barred from practising.

Read that again. Not using it becomes the negligence.

The test is whether a reasonable professional of comparable rank and specialism would have used it. That is a statement of law rather than a new regulation, which is exactly why it lands harder: it describes how a court would already reason today.

Here is the squeeze most firm owners haven't priced in yet: both risks are now live at the same time. Use it carelessly and you have a confidentiality and malpractice problem. Don't use it at all and you're drifting below an emerging standard of care.

There is no side to pick. There is only a documented standard.

What that looks like in practice at a small firm:

• A written list of what AI is approved for and what it is not
• A named human who reviews output before it leaves the building
• A record showing why the choice was made either way

US bars will land somewhere similar with a lag. The firms that will be fine are the ones who wrote the memo before they were asked for it.
```

**First comment:** source citation (see blocking check on deep-linking) + newsletter.
**Flags:** Fact-check DONE (2026-07-26) — UKJT legal statement, Sir Geoffrey Vos, "barred from practising" verified; body already corrected. No CTA in body — correct for an authority post.

---

## 2 — Wed 2026-07-29

**Source:** r/paralegal, "Billable hours feel impossible" · pain · 9/10 · radar 2026-07-04
**Hook:** "A paralegal just described the billing problem nobody at the firm wants to say out loud."

```
A paralegal just described the billing problem nobody at the firm wants to say out loud.

Three years in. 15+ client matters a day. Endless .1 and .2 entries for emails and quick reviews. Timers that never get started because the next email already landed. End of the day: about half the billable hours actually worked.

The work was there. The record wasn't.

This is the gap I keep seeing. Firms treat under-billing as a discipline problem, so they tell people to try harder with a stopwatch. It isn't a discipline problem. It's a capture problem. Human attention can't run a timer and do the work at the same time, all day, across 15 matters.

Two things close it, and you need both:

1. Tooling that reconstructs time passively from the activity that already happened, emails, documents, matters touched, into defensible entries a paralegal reviews instead of invents.

2. A team with the actual bandwidth to review and clean those entries, so accuracy doesn't ride on one exhausted person remembering to click "stop."

AI alone gives you a pile of suggested entries nobody trusts. People alone gives you the stopwatch problem. The firms that fix billing use the tool to capture and the team to verify.

If half your worked hours are quietly falling off the invoice, that isn't a training issue. That's revenue you already earned and never recorded.
```

**Flags:** "use the tool to capture and the team to verify" is the both-layers framing. Keep it as a general claim about what works. Do **not** let it drift into the moat line — Counterbench is not the only player pairing tools with a service.

---

## 3 — Thu 2026-07-30

**Source:** r/paralegal, "Would you report improper AI use?" · insight · 9/10 · radar 2026-07-19
**Hook:** "A paralegal at a plaintiffs' PI firm just found out every client file at the office had been handed to an AI tool."
**Why here:** completes the pair with #1. #1 says you must use it; #3 says here is what careless use costs.

```
A paralegal at a plaintiffs' PI firm just found out every client file at the office had been handed to an AI tool. Medical malpractice records included.

The attorney who did it was bragging about how good it was. Also admitted they had no idea whether it was compliant.

It isn't. Enterprise plans are not HIPAA-covered by default. Coverage requires an executed business associate agreement, and on several product surfaces it is not available at all. And no client was ever told their medical records were being processed this way.

So now the person deciding whether to report a potential malpractice exposure is the paralegal. Not the managing partner. Not a compliance officer. The lowest-paid person in the room, who also happens to be on thin ice with their bosses.

That is the actual story here, and it is playing out at hundreds of small firms right now.

The problem was never that the attorney used AI. It's that the firm had no answer to three questions before the upload happened:

1. Which tool, and what is its data handling posture in writing
2. What categories of client data are allowed to touch it
3. What did we tell the client

A firm that can answer those three can move fast on AI. A firm that can't is running an uninsured experiment with other people's medical records, and the only control left is whether a nervous paralegal decides to speak up.

Adopt the tools. Write the policy first.
```

**Flags:** HIPAA claim VERIFIED + reworded (2026-07-26) — "enterprise plans not HIPAA-covered by default" is accurate; body already carries the softened wording. Still watch: this is the closest post to naming a vendor by implication — keep it neutral.

---

## 4 — Tue 2026-08-04

**Source:** r/LawFirm, "Drowning in doc review and first drafts as a solo" · pain · 9/10 · radar 2026-07-23
**Hook:** "A solo lawyer posted this week that he cannot afford AI. He is also spending most of his weekends on document review and first drafts."
**Note:** "this week" needs updating — the thread is from late July, this posts 2026-08-04.

```
A solo lawyer posted that he cannot afford AI. He is also spending most of his weekends on document review and first drafts.

Both things are true. That is the trap.

The pricing conversation always starts in the wrong place. Westlaw and Lexis quote a multi-year bundle. The newer AI platforms quote a per-seat number built for a 200-attorney budget. So the solo runs the math on the invoice and stops there.

The number that actually decides it is the one nobody hands you: what your unbilled review hours already cost.

Run it honestly. Ten hours a week on doc review and initial drafting, at a $350 blended rate, is roughly $14,000 a month of capacity you are giving away. Against that, a $500 tool stack is not expensive. It is rounding.

The catch is that the tool alone does not recover those ten hours. Software moves the drafting time. Somebody still has to review the output, chase the missing exhibit, and format the thing before it goes out. That work does not disappear because you bought a subscription.

That is why the honest answer for most solos is not a platform. It is a small stack of cheap point tools plus one person who actually runs them.

Price the hours first. Then price the tools.
```

**Flags:** timestamp fix. Original carried #LegalTech #SoloPractice #LawFirmOperations #LegalOps — apply the standard set or none.

---

## 5 — Wed 2026-08-05

**Source:** r/paralegal, "Feeling insane" (200k pages, no ediscovery) · pain · 9/10 · radar 2026-06-30
**Hook:** "A litigation paralegal got handed 200,000 pages at 7pm and told to bates-stamp and serve by midnight. Three nights in a row."
**Why here:** most visceral story in the set. Highest share probability.

```
A litigation paralegal got handed 200,000 pages at 7pm and told to bates-stamp and serve by midnight. Three nights in a row.

Then got accused of not being detail-oriented when Adobe assigned the same bates number to two different pages.

This is not a people problem. It is a tooling-and-staffing problem the firm refused to solve.

The gap I keep seeing in small and mid firms:

• No ediscovery software. Dropbox and Adobe doing work they were never built for.
• No surge capacity. One person absorbing a 200k-page dump alone.
• The fix gets framed as "hire someone more careful" instead of "build the workflow."

The market keeps selling firms a choice: buy AI tools, or hire a team. That framing is the actual trap.

You need both. The software to catch a duplicate bates number before it cascades across 200,000 pages, and the trained humans to run it when the 7pm dump lands.

If your ediscovery stack is a shared Dropbox folder and a prayer, the next emergency is already on the calendar. You just do not know the date yet.
```

**Flags:** names Adobe in a failure story. Verify the behaviour described is real
and fairly characterised — the directory sells vendor-neutrality, and an unfair
swipe at a named vendor costs more than the line is worth.

---

## 6 — Thu 2026-08-06

**Source:** r/paralegal, "I Don't Know What to do Anymore" · pain · 9/10 · radar 2026-06-27
**Hook:** "A paralegal told her firm she was drowning. The response: 'Why aren't you quicker?'"

```
A paralegal told her firm she was drowning. The response: "Why aren't you quicker?"

That firm signs 3 to 5 new clients a week and won't hire help. She's behind on nearly every discovery file. This isn't a speed problem. It's a math problem.

When intake outruns capacity for a month straight, no productivity hack closes the gap. One person is doing the work of three.

Firms misread this as a performance issue because the alternative feels expensive. The truly expensive option is the invisible one: missed deadlines, malpractice exposure, and the paralegal who quits and walks out with two years of case knowledge.

The fix is capacity. AI to triage and draft the repetitive discovery load, plus a paralegal team to actually run it when your one person is past the line.

You don't have to choose between the software and the staff. The firms that keep growing pick both.
```

**Flags:** original ended "What's the breaking point you've watched a good
paralegal hit?" — **cut**, reads as comment-bait. Removed above.
"walks out with two years of case knowledge" is the institutional-knowledge
thread that #7 and the conflict audit both pull on. Deliberate.

---

## 7 — Tue 2026-08-11

**Source:** r/LawFirm, "Has anyone successfully utilized Claude to automate administrative tasks?" · pain · 9/10 · radar 2026-07-10
**Hook:** "A solo PI attorney with 40 open cases asked whether Claude could take over his retainer agreements, letters of representation, treatment follow-ups, and demand letters."
**Why last:** ends on "what must a person own," which is the exact frame the conflict audit opens with.

```
A solo PI attorney with 40 open cases asked whether Claude could take over his retainer agreements, letters of representation, treatment follow-ups, and demand letters.

Three of those four, yes. The fourth is the one that decides what his cases are worth.

Retainers, LORs, and treatment follow-ups are template work with variables. Same structure every time, low judgment, high volume. A model handles them and a human spot-checks. That is a real week back.

Demand letters are not template work wearing a costume. The number you anchor on, what you emphasize from the records, what you leave out because it invites an argument you do not want: that is the case. Hand it to a model with no context on the adjuster, the venue, or the client, and you get a document that looks correct and settles low.

The trap is that both categories feel like paperwork from the outside. They are not. One is throughput. The other is leverage.

Most firms get this backwards. They keep doing the templates by hand because those feel like real lawyering, then rush the demand because they are out of hours.

Sort your admin into what a model can draft and what a person has to own. Automate the first list without guilt. Protect the second list like revenue, because that is what it is.

What is on your protect list?
```

**Flags:** closing question kept — it is specific, asks for a real answer, and
sets up the audit. This is the one post where the question earns its place.

---

## Tracking

| # | Slot | Verified | Posted | Impressions | Comments | Profile views |
|---|---|---|---|---|---|---|
| 1 | 07-28 | ☐ | ☐ | | | |
| 2 | 07-29 | ☐ | ☐ | | | |
| 3 | 07-30 | ☐ | ☐ | | | |
| 4 | 08-04 | ☐ | ☐ | | | |
| 5 | 08-05 | ☐ | ☐ | | | |
| 6 | 08-06 | ☐ | ☐ | | | |
| 7 | 08-11 | ☐ | ☐ | | | |

**Read at 2026-08-13:** if seven posts of this quality produce no meaningful
reach or inbound, the conflict-audit completion targets (PRD §8, threshold #3:
50 completions by 2026-09-05) are not reachable through LinkedIn alone, and the
distribution assumption behind the whole plan needs re-betting before more build
time goes in.

---

## Remaining backlog after this queue

53 drafts still unpublished (45 × 8/10, 8 × ≤7/10) across CounterbenchAI,
Petrichor and Reality Audit, plus ~30 intel-radar Stage B entries in
`_ops/memory-content-drafts.md`. This queue clears the top 12% only.
