# Deploy — CB Content Engine

Steps to take the engine from disk to autonomous weekly drafts.

## Prereqs

- [ ] n8n Cloud access (existing, you run Intel Radar there)
- [ ] `NOTION_API_KEY` already set in n8n env (used by other workflows)
- [ ] `ANTHROPIC_API_KEY` set in n8n env (check; add if missing)
- [ ] Slack workspace admin access (you have)

## 1. Create review channel

In Slack: create `#cb-content-review`, private, invite yourself + Murrow bot (so n8n can post).
Capture the channel ID for the workflow.

## 2. Import the workflow

n8n → Workflows → Import from File → select `n8n-workflow.json`.

Channel ID is pre-wired to `C0BA0U9Q25N` (#cb-content-review). One check:

- **Anthropic node** → confirm `ANTHROPIC_API_KEY` resolves. If not present,
  Settings → Variables → add it.
- **Slack node** → on first open, n8n may ask you to re-pick the Slack credential
  from the workspace's existing connection. Pick the one used by Intel Radar.

## 3. Test-run

n8n → Execute Workflow.
Expected: 2 Slack messages in `#cb-content-review`, each with source signal + draft post body.

If 0 messages: Code node "Select Topics" likely returned `skip:true` (no fresh items
in the last 7 days). Either lower SCORE_MIN to 2.0 temporarily or wait for new Intel
Radar items.

If error in Notion node: check `NOTION_API_KEY` has the Intel Radar DB shared with
the integration.

## 4. Voice QA gate

Read both drafts. Either:
- **Pass** → activate the workflow schedule. First autonomous run = next Sunday 5pm ET.
- **Fail** → edit `content/engine/brand-voice.md`. Re-sync the `BRAND_VOICE` constant
  in the n8n workflow Code: Build Prompt node. Re-test.

## 5. Register the cron

Append to `Projects/daily-systems/CRON-REGISTRY.md`:

```
| CB Content Engine | n8n Cloud | Sun 17:00 ET | weekly | draft 2 LinkedIn posts from Intel Radar -> #cb-content-review | content/engine/ |
```

## 6. First-cycle protocol (week 1)

- Sun 5pm ET: drafts land in `#cb-content-review`
- Mon AM: review in Slack
- Approve one → post manually to LinkedIn → log it:

  ```bash
  cd ~/Downloads/Projects/CounterbenchAI/content/engine
  node log-publish.js \
    --source-id "<notion-page-id-from-slack>" \
    --title "<source title>" \
    --format text-post \
    --asset "drafts/2026-W23/<draft-file>.md" \
    --permalink "https://linkedin.com/posts/..."
  ```

  Inspect log: `node log-publish.js --list`

- Selector auto-dedups against the log on the next Sunday run.
- Track: time-to-approve, edit-volume per draft, time-to-publish.

## Pilot exit criteria (3 cycles)

Per PRD §4:
- [ ] ≥80% drafts need light edit only (not rewrite)
- [ ] ≥3 drafts published across 3 weeks
- [ ] Zero invented case/firm specifics caught in review

If all 3 hold: fan out to Petrichor (Phase 2 of portfolio rollout).
If any fail: tune `brand-voice.md` + format prompts before fanning out.

## Failure modes to watch

1. **Empty weeks** — Intel Radar produces few high-score items some weeks. Selector
   emits skip. Acceptable; do not auto-lower the bar.
2. **Voice drift** — Sonnet may go corporate. Counter: bans list in brand voice is
   long for a reason. If a buzzword sneaks in 2x, add it to the bans.
3. **Source thinness** — Reddit posts with `[content unavailable]` give weak signal.
   Selector should already filter via `haiku_score >= 3.0` but watch for fabricated
   specifics in drafts. If seen: add explicit "if signal is thin, refuse and emit a
   skip token" instruction in the prompt builder.
