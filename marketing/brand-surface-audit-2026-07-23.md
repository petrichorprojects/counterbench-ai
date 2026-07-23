# CounterbenchAI: Brand Surface Audit

Run 2026-07-23 against production. Skill: `brand-surface-audit` v1.0.0.
Surfaces: counterbench.ai (7 pages), verdictops.com redirect chain, counterbenchai.substack.com, off-site entity surfaces, Wikidata.

---

## Diagnosis

CounterbenchAI has no machine-readable identity at all. Not a wrong one. None.

Zero JSON-LD across every page checked. No Organization entity, no `sameAs`, no Wikidata item, no off-site profile that resolves. The human-readable layer is strong and the positioning is clean. An answer engine asked "who is Counterbench.AI" has nothing structured to consume.

This is the inverse of the defect this skill was built on. On Category Gravity, Mettle, and Reality-Audit the machine layer contradicted the human layer. Here the machine layer is absent. Same root cause: nobody proofreads what they never wrote.

Second finding, unrelated and more urgent: the throwaway `@justheardthat` account still holds **admin** on the CounterbenchAI Substack after today's ownership transfer.

---

## Confirmed findings

### 1. The old account retained admin on the CounterbenchAI publication

Live in the page data at `counterbenchai.substack.com/about`:

```
"name":"Phil R","handle":"justheardthat","role":"admin","owner":false
```

Ownership moved. The role did not. This is the exact trap named in `category-gravity/substack-account-split-runbook-2026-07-19.md`, and it arrived by the mechanism predicted there: Substack detaches ownership without detaching the account.

Not currently a public breach. The signed-out profile check passes (see below), so `admin` does not render a publication chip the way ownership did. But the association is live, the throwaway account retains full administrative access to a CounterbenchAI property, and the public co-listing can return if the role is ever changed to Byline.

Fix from the CounterbenchAI account: Settings, Team, remove `Phil R / @justheardthat` entirely. Remove, not demote.

### 2. Zero structured data on every page

**CORRECTED 2026-07-23, same day.** The production observation below is accurate. My implied cause was wrong.

The schema was never missing. It was **written and never shipped.** `lib/seo.ts` already exports `organizationJsonLd()`, `serviceJsonLd()`, and `faqPageJsonLd()`, and `app/layout.tsx` already injects the Organization block sitewide. The comment on it reads "Sitewide Organization schema, AEO fix, tasks/AEO-AUDIT-TODO.md", so someone did this work deliberately.

None of it is deployed. All of it sits as **uncommitted working-tree changes** on branch `feat/ten-decisions-series`:

```
M app/layout.tsx
M app/(marketing)/paralegals/page.tsx
M app/tools/[slug]/page.tsx
M app/(marketing)/workshop/page.tsx
```

`git show HEAD:app/layout.tsx | grep -c "ld+json"` returns **0**. So does the same check against `origin/main`. The branch is 3 commits ahead of main and the schema is not in any of them.

Verified this is a deploy gap and not a render problem: `favicon-32.png`, `apple-touch-icon.png`, and `/css/style.css` all appear in production HTML, and they come from the same `<head>` in the same `layout.tsx`. The head is server-rendered. The JSON-LD will appear the moment the code ships.

That changes the fix from "author schema" to "ship the schema that exists." It also raises a question the audit cannot answer: an entire AEO fix suite is sitting uncommitted in a working tree. Whatever stalled it is the actual blocker, and it is worth knowing what that was before assuming a commit is all it needs.

Original production finding, unchanged and still accurate:

| Page | bytes | `ld+json` | `schema.org` | `itemtype` | `og:title` |
|---|---|---|---|---|---|
| `/` | 40,546 | 0 | 0 | 0 | 2 |
| `/paralegals` | 63,887 | 0 | 0 | 0 | 2 |
| `/about` | 24,567 | 0 | 0 | 0 | 2 |

Open Graph is present, which covers social preview cards. Open Graph is not an entity graph. Nothing on the site declares an Organization, a service, a founder, or a single external profile.

### 3. Off-site entity presence is nil, and Wikidata has no item

| Surface | Result |
|---|---|
| `linkedin.com/company/counterbenchai` | 404 |
| `linkedin.com/company/counterbench` | 404 |
| `x.com/counterbenchai` | 404 |
| `github.com/counterbenchai` | 404 |
| Wikidata search "Counterbench" | 0 results |
| Crunchbase | **403, unknown.** See "died under verification" below. |

For a brand whose product is a directory that recommends other tools, being absent from every directory that would recommend it is a structural problem, not a cosmetic one.

### 4. Neither agent-readable file carries any identity

`llms.txt` (1,828 bytes) and `.well-known/brand-facts.json` (3,306 bytes) both exist and both are well-built for what they cover: offerings, audience, key pages, policies.

Neither contains a single identity key. `brand-facts.json` keys in full:

```
name, website, category, summary, audience, offerings, specialization,
differentiators, keyPages, anchorGuides, discovery, policies, compliance,
notes, lastUpdated
```

No `owner`, no `founder`, no `sameAs`, no `legal_name`, no `parent`, no social. Same for `llms.txt`: zero matches for founder, owner, parent, or any personal name.

These are the two files written specifically for machines. Both describe what the company sells and neither says who it is.

### 5. Title tags duplicate the brand, and one carries an em-dash

```
/            <title>Counterbench.AI — The Right AI Tool for Your Legal Task | Counterbench.AI</title>
/paralegals  <title>Paralegal Teams for PI Firms | Counterbench.AI | Counterbench.AI</title>
```

Brand name appears twice in both. The homepage title runs 73 characters, past the ~60 where truncation starts.

The em-dash is a live voice violation. `counterbench-voice.md` rule 4: "Hyphens only. No em-dashes. Non-negotiable per CB Hard Bans + global legal-writing rule." It is sitting in the single most-rendered string on the site, in front of a legal audience the voice file describes as buzzword-allergic.

### 6. Canonical host uses a temporary redirect

`www.counterbench.ai` returns **302** to the apex. A 302 is temporary and invites search engines to keep the `www` host in the index. Host consolidation wants 301 or 308.

Low severity in isolation. It matters more than usual here because there is no other entity signal doing the consolidation work.

### 7. The site never links to its own newsletter

Substack references across `/`, `/paralegals`, `/about`, `llms.txt`: **zero.**

`counterbenchai.substack.com` is live and now correctly owned, and no surface on counterbench.ai points to it. The publication cannot accumulate subscribers from the site, and it contributes nothing to entity resolution because nothing connects the two.

---

## What passed, and should not be disturbed

**Petrichor isolation is clean.** GLOSSARY states CounterbenchAI is a separate business with no public brand connection to Petrichor. Verified across four layers:

| Surface | `petrichor` | `rimmler` | `petrichorgrowth` |
|---|---|---|---|
| `/` | 0 | 0 | 0 |
| `/paralegals` | 0 | 0 | 0 |
| `/about` | 0 | 0 | 0 |
| `llms.txt` + `brand-facts.json` | 0 | 0 | 0 |

No shared email domain, no shared Calendly, no footer link. This is the one portfolio brand where the isolation rule is fully honored in production.

**The Substack profile acceptance test passes.** `substack.com/@justheardthat`, fetched signed out, now lists Category Gravity only. "The Counterbench" no longer appears. Today's transfer achieved its public objective. Finding 1 is the residue, not a failure of the transfer.

**`llms.txt` key pages all resolve.** All 11 advertised paths return 200. No phantom URLs pointed at crawlers.

**Real 404 handling.** The control path returns 308 at 15 bytes against a 40,546-byte homepage, so this site is not an SPA catch-all and a 200 here is meaningful. Every status code in this audit can be trusted.

**The VerdictOps redirect works.** All paths land on `counterbench.ai/paralegals` with a 200.

---

## Findings that died under verification

Recorded so the next run does not re-raise them.

**"Crunchbase profile is missing."** Returns **403**, which is anti-bot blocking, not absence. Cannot be resolved from a script. Needs a signed-out browser check before anyone claims it either way.

**"The Counterbench Substack is gone."** `thecounterbench.substack.com` 404s, but that was my guessed URL. The real publication is `counterbenchai.substack.com` and it is live. A wrong guess about a URL is not a finding about a brand.

**"VerdictOps does not 301 as documented."** GLOSSARY and SOUL both say "301s to counterbench.ai/paralegals". The live chain is `307` apex to www, then `308` to the destination. Technically neither hop is a 301, but **308 is a permanent redirect and search engines treat it equivalently to 301** for consolidation and link equity. The documented intent is being achieved. The docs are imprecise, not wrong, and this is not worth a fix.

One genuine note inside that non-finding: deep paths collapse. `verdictops.com/services` lands on `/paralegals`, not a matching page. For a merged brand consolidating onto one service page that is a defensible choice, and it beats a 404.

---

## Fixes, ranked by dependency then impact

1. **Remove `@justheardthat` from the CounterbenchAI Substack team.** Two minutes, from the CounterbenchAI account. Blocks nothing, but it is the only finding where a wrong account currently holds live administrative access.

2. **Ship the Organization JSON-LD that already exists.** Revised after the correction above: this is a commit-and-deploy task, not an authoring task. The blocker is whatever stalled `feat/ten-decisions-series`, not missing code. Three improvements were applied to `lib/seo.ts` on 2026-07-23 before shipping:
   - **`legalName` removed.** It was set to `"Counterbench.AI"`, the brand string. In schema.org `legalName` means the registered legal name of the entity, which is a corporate fact. Asserting it unverified is the same defect flagged on Reality-Audit in the 2026-07-19 audit. Restore it once the registered name is confirmed.
   - **`logo` moved** from `favicon-32.png` (32x32, verified) to `apple-touch-icon.png` (180x180, verified). Organization logo guidance wants at least 112px on the shortest side; a 32px logo is ignored.
   - **`alternateName: ["CounterbenchAI", "Counterbench"]` added.** Both forms are in real public use across the site, the repo, and the Substack. This is what tells an engine the variants are one entity.

   `sameAs` still correctly omitted, since no off-site profile resolves yet. Add it under fix 3.

3. **Create at least a LinkedIn company page.** This blocks the `sameAs` array in fix 2 from being worth writing. One real profile beats an empty array. LinkedIn first: it is where PI firm decision-makers actually verify a vendor exists.

4. **Add identity keys to `llms.txt` and `brand-facts.json`.** Owner, founding context, the VerdictOps history, and the Substack. Cheap, and these files are already well-maintained so the habit exists.

5. **Fix the title tags.** Remove the duplicated brand, cut the homepage title under 60 characters, and replace the em-dash with a hyphen or a colon. The em-dash is a house-rule violation on the most-read string on the site.

6. **Change `www` to a 301 or 308.** Host consolidation hygiene.

7. **Link the Substack from the site.** Footer at minimum. Two orphaned assets that should be reinforcing each other.

Items 1 and 5 are quick. Item 2 is the one that changes whether this brand exists to an answer engine.

---

## Needs a check I could not run

- Crunchbase: signed-out browser, to settle the 403.
- Whether a LinkedIn company page exists under a slug I did not guess. I tried `counterbenchai` and `counterbench`.
- Whether `counterbenchai.substack.com` still bylines posts as "Phil R" after the display-name change, or whether the change has propagated.
