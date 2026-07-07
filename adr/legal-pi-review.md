# ADR: legal-pi-review skill

## Decision
Create a `legal-pi-review` skill specializing `legal-review` for personal injury law firm documents.

## Rationale
CounterbenchAI targets PI law firms. The generic `legal-review` lacks PI domain knowledge: lien priority, contingency fee caps, Medicare/Medicaid Secondary Payer Act compliance, state bar fee-sharing rules, HIPAA PHI handling in vendor agreements.

## Scope
- Invoked via `/legal-pi-review <file>`
- Reuses 5 existing subagents with PI-specific prompts
- PI-weighted score penalties
- Output: `PI-CONTRACT-REVIEW-[docname]-[date].md`

## Status
Accepted
