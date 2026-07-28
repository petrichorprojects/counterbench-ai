# CounterbenchAI Content Engine

Autonomous LinkedIn draft generation from Intel Radar legal signals. Draft-only - Phil approves + publishes.

Full spec: `../../PRD-autonomous-content-engine.md`

## Loop
```
Intel Radar (Notion ledger, scored daily)
   -> topic-selector  (top N, dedup vs published-log.json, map item -> format)
   -> generators      (linkedin-post-generator / noise-to-linkedin-carousel / graphic-chart)
        + brand-voice.md injected verbatim
   -> drafts/YYYY-WW/ + Slack #cb-content-review
   -> Phil approves + publishes (manual)
   -> append to published-log.json
```

## Files
| File | Role |
|------|------|
| `brand-voice.md` | Voice block injected into every generator. Derived from SOUL.md. |
| `published-log.json` | Dedup ledger. Source items already used. Prevents regeneration. |
| `drafts/YYYY-WW/` | Weekly staged output. |

## Config (pilot defaults)
- Review channel: `#cb-content-review` (new)
- Scheduler: n8n weekly cron, Sun 5pm ET
- Volume: 2 drafts/week (scale after voice proven)

## Hard rules
1. Draft only. Never auto-publish. (boundaries.md)
2. No em-dashes. Hyphens only.
3. Every draft traces to a real Intel Radar source item.
4. CounterbenchAI voice only. No Petrichor/Reality-Audit bleed.

## Status
- [x] Phase 0 - scaffold (voice block, log, drafts dir)
- [x] Phase 1 - topic-selector (topic-selector.js + n8n Code node port)
- [x] Phase 2 - voice proof (drafts/2026-W23/post-ai-briefs-sanctions.md, approved)
- [x] Phase 3 - format routing (text-post / carousel / infographic prompts in n8n)
- [x] Phase 4 - n8n workflow built (n8n-workflow.json) - awaiting import + activation per DEPLOY.md
- [x] Phase 5 rubric defined (PHASE-5-EVAL.md) - awaiting first 3 autonomous cycles to score

## Files
- `brand-voice.md` - voice block injected into every generator
- `published-log.json` - dedup ledger
- `topic-selector.js` - standalone Node script (local test variant)
- `n8n-workflow.json` - production cron (import to n8n Cloud)
- `DEPLOY.md` - import + activation steps
- `drafts/YYYY-WW/` - weekly staged drafts
