# CounterbenchAI — Operating Manual

Read this before touching anything. **The `README.md` is stale** — it describes an old "pure static site, no build step, Netlify, counterbench.com" version. That repo is gone. This is a Next.js app (App Router), TypeScript, Drizzle, Playwright, deployed to Vercel at **counterbench.ai**. When README and this file disagree, this file wins; treat README as historical until it's rewritten.

CounterbenchAI is the merged legal-tech brand (VerdictOps sunset into it, 2026-04-22). Two arms: a **free, vendor-neutral legal-AI tool directory** (the SEO/lead engine) and **Paralegal Teams** (human-in-the-loop retainer service, $3,750–$6,500/mo). Most of the repo is content + content pipeline, not app logic. `phil@counterbench.ai` is the sole legal-tech identity.

## 0. Source-of-truth hierarchy

When two documents disagree, the higher one wins:

1. `SOUL.md` (71 lines) — operating philosophy, positioning. Read first.
2. `GLOSSARY.md` (56 lines) — vocabulary. Use these exact terms; do not coin synonyms.
3. This file — repo shape, pipeline, conventions.
4. `adr/` — architecture decision records. Check before re-litigating a structural choice.
5. `tasks/` — todo, PRDs, session logs.

**Canonical-repo warning (from README, still true):** this is the one true Counterbench repo. Never edit or deploy from a nested duplicate such as `VerdictOps/counterbench-ai`. If you find yourself in a path containing `VerdictOps/`, stop.

## 1. Repo map

| Path | What it is | Editable? |
|---|---|---|
| `app/` | **Next.js App Router — the live site.** `app/(marketing)/` is the route group for public pages (`paralegals`, `advisory`, etc.); `app/api/` serverless handlers; `app/legal-pad/` the tool. This is canonical. | Yes — source |
| `pages/` | Legacy static `.html` (`about.html`, `diagnostic.html`…). Pre-Next artifacts. **Do not add here.** Confirm whether a page already lives in `app/` before touching a `pages/` file. | Migrate, don't extend |
| `content/` | Live content: tool directory entries, prompts, resources, pSEO guides. Consumed by the search index + page builders. | Yes |
| `content_preview/` | Staging mirror. Selected by `CB_CONTENT_ROOT=content_preview`. All `:preview` npm scripts target it. Stage risky bulk imports here first. | Yes |
| `scripts/` | The content pipeline (tsx). `import-tools`, `import-prompts-*`, `import-resources-*`, `seed-*`, `build-search-index`, `qa-tools`, `check-pricing-drift.mjs`, `validate-tool-names.ts`. | Yes |
| `drizzle/` | Drizzle ORM schema + migrations. | Yes (via drizzle-kit) |
| `lib/`, `components/`, `design-system/` | App code, shared UI, tokens. | Yes |
| `ai-quality/` | Eval/quality harness for AI outputs. | Yes |
| `__tests__/`, `tests/` | Vitest units + Playwright e2e (`tests/e2e/`). | Yes |
| `out/`, `.next/` | Build output. | **Never edit directly** |
| `marketing/` | Outreach logs, evidence. Append-only, dated, attributed. | Append |

## 2. Build & pipeline (exact commands)

```
npm run typecheck          # tsc --noEmit
npm run lint               # next lint
npm run build              # prebuild runs build-search-index, then next build
npm run e2e                # self-builds if .next/BUILD_ID missing, then playwright
```

- **`build-search-index` runs automatically** in `prebuild` and `dev`. If search is empty locally, that step failed — read its output, don't hand-edit the index.
- **Content pipeline is preview-first.** Every `import-*`/`seed-*` script has a `:preview` twin that writes to `content_preview/`. Import there, `qa:preview`, then run the live version. Bulk imports that go straight to `content/` have shipped bad data before.
- **`check-pricing-drift.mjs` is a real gate.** It cross-checks tier names + prices between `app/(marketing)/paralegals/page.tsx`, `app/(marketing)/advisory/page.tsx`, and `public/pricing.md`. If you touch any price, run it — a drifted `pricing.md` is agent-readable and ships wrong numbers to LLMs.
- Deploy is Vercel. **After any push that triggers deploy, verify the live URL** — never assume CI passed.

## 3. Conventions

### Git
- Commits: `feat(scope): message`, `fix:`, `chore:`, `docs:`. Real scopes in log: `content`, `aeo`, `seo`.
- Branches: `feat/kebab-description`. Never work directly on `main`. Multi-part work → feature branch → PR.
- **Never commit or push without an explicit ask.** Hard boundary. Stage and report.
- After adding files, `git status` to confirm they're tracked (a `.gitignore` rule has swallowed new files in sibling repos).

### Content & vocabulary
- Directory entries, prompts, resources follow the existing schema in `content/`. Match the shape of neighbors before inventing fields.
- Vocabulary is `GLOSSARY.md`, exactly. The directory's whole value is being **vendor-neutral** — never write copy that reads as marketing for one tool.
- Logs are append-only, dated, attributed. New month = new file matching the naming pattern; never restructure an existing log.

### The moat line — do not use it
The claim that Counterbench is the "only player with both the software layer and the human layer" is **false** (CloudLex, Telamanis, Finch, Lexvia all pair tools + service). Do not write it into any page, pitch, or content. The real, defensible differentiator is the **free vendor-neutral directory** feeding a human paralegal service. (See memory `project_counterbench_moat_collapse`.)

## 4. Named mistakes a weaker model makes here

1. **Trusting README.** It describes a dead static site. → *Verify stack from `package.json` + `app/`, not README.*
2. **Editing `pages/*.html`.** They're legacy. → *New/changed pages go in `app/`. Check `app/` first; if a page exists only in `pages/`, ask how it's routed before editing.*
3. **Importing straight to `content/`.** → *Use the `:preview` twin + `qa:preview` first. Live import last.*
4. **Silent pricing drift.** Changing a tier on a page but not `public/pricing.md`. → *Run `scripts/check-pricing-drift.mjs` after any price touch.*
5. **Editing the search index by hand.** → *It's generated by `build-search-index`. Fix the source content, rebuild.*
6. **Deploying from a nested duplicate.** → *Only this repo. Never `VerdictOps/counterbench-ai`.*
7. **Vendor bias in directory copy.** → *Neutral, always. The directory sells trust, not any single tool.*
8. **Autonomous send/publish/commit.** → *Never send, publish, or commit/push without an explicit ask. Prep, stage, report.*

## 5. Definition of done

Run the **`verify` skill** (`.claude/skills/verify`) before presenting any code change as done. Its gate: `typecheck` → `lint` → `vitest run` → `build` → `e2e` (when pages/routes/API/receptionist touched) → screenshot (visual changes). No DESIGN.md drift check exists here — the skill says so; do not invent one. Criteria are immutable during a run: fixing a test, lint config, or tsconfig to reach green voids it.

## 6. When uncertain — escalation

Default when ambiguous: **prep, don't dispatch** (Yellow).

- **Green (proceed):** implementation inside an approved plan; refactors in existing patterns; content pipeline runs; research with a written summary; builds/tests/gates; internal process automation.
- **Yellow (do 80%, stage, stop):** product/feature/roadmap decisions (propose with data, wait); email/DM drafts (write, never send); pricing scenarios (model, never change live).
- **Red (assemble context, Phil decides):** client-facing service communications — law firms expect human judgment, this is not automatable; pricing quotes; anything public under the brand.
- **Hard stops:** send anything; publish anywhere; commit/push unasked; change live pricing; touch production data; create accounts.

When genuinely blocked, ask exactly one question: `Blocked on: [X]. Recommended default: [Y]. If [A] I'll…; if [B]…`. Never ask what a file read or `git log` answers.

## 7. Session start (30 seconds)

1. `git status` + branch — know what's dirty.
2. Skim `SOUL.md` + `tasks/` headers.
3. Touching the site → §2 pipeline is your definition of done; the `verify` skill is the gate.
4. Touching prices → `check-pricing-drift.mjs` is mandatory.
5. Ambiguous task → classify Green/Yellow/Red before the first tool call.
