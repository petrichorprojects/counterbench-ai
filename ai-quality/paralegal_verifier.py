"""
Paralegal output verifier — PI-specific eval harness.

6 dimensions (0-3 each, max 18). Hard-failure logic on Dim 1.
Delivery gate: score < 9 blocks output. Score 16+ promotes to examples bank.
Single judge (Haiku) for speed; not a replacement for grader.py (general legal).
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

import anthropic

_client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

JUDGE_MODEL = "claude-haiku-4-5-20251001"

HARD_FAIL_PATTERNS = [
    r"\bwrong plaintiff name\b",
    r"\bincorrect plaintiff\b",
    r"\bwrong accident date\b",
    r"\bincorrect date of (loss|accident|incident)\b",
    r"\binvented medical provider\b",
    r"\bfabricated provider\b",
    r"\bstated demand not in source\b",
    r"\bdemand .{0,40} not (found|present|supported)\b",
]

WEAK_LIABILITY_PHRASES = [
    "allegedly", "it appears", "may have caused", "reportedly",
    "seems to indicate", "possibly caused", "could indicate",
]

BLOCK_THRESHOLD = 9
PROMOTE_THRESHOLD = 16

PROJECT_ROOT = Path(__file__).parent.parent


@dataclass
class DimensionScore:
    dimension: int
    name: str
    score: int
    max_score: int = 3
    rationale: str = ""
    hard_failed: bool = False


@dataclass
class ParalegalVerifierResult:
    case_slug: str
    task_type: str
    timestamp: str
    dimensions: list[DimensionScore] = field(default_factory=list)
    total: int = 0
    blocked: bool = False
    promoted: bool = False
    hard_fail_triggered: bool = False
    hard_fail_reason: str = ""

    @property
    def delivery_label(self) -> str:
        if self.total >= 16:
            return "SHIP — add to examples bank"
        elif self.total >= 13:
            return "MINOR REVISION"
        elif self.total >= 9:
            return "RETURN TO BRIEF"
        else:
            return "HARD FAIL — log and block"


def _check_hard_failures(output: str, source_docs: str) -> tuple[bool, str]:
    """Detect auto-0 conditions for Dimension 1 (Factual Accuracy)."""
    combined = f"{output}\n\n---SOURCE---\n{source_docs}"

    for pattern in HARD_FAIL_PATTERNS:
        if re.search(pattern, combined, re.IGNORECASE):
            return True, f"Auto-0 pattern matched: {pattern}"

    # Heuristic: plaintiff name in source not appearing in output
    # (Light check only — full LLM check covers deeper analysis)
    return False, ""


def _check_weak_liability(output: str) -> list[str]:
    found = []
    for phrase in WEAK_LIABILITY_PHRASES:
        if phrase.lower() in output.lower():
            found.append(phrase)
    return found


def _build_eval_prompt(output: str, source_docs: str, task_type: str, dim_num: int) -> str:
    dim_instructions = {
        1: """Dimension 1 — Factual Accuracy (0-3).
Hard-fail triggers (auto score 0): wrong plaintiff name, wrong accident date, invented/fabricated medical provider, demand stated that is not in source documents.
3 = All facts match source; no fabrications detected.
2 = Minor factual imprecision but no hard-fail conditions; no invented entities.
1 = Noticeable inaccuracies; some unsupported claims.
0 = Any hard-fail trigger present OR pervasive factual errors.""",

        2: """Dimension 2 — Completeness: Injuries and Treatment (0-3).
Must-capture items (check against source): ER visit, diagnosis, specialist referrals, surgeries, PT course (start/end dates), IME if applicable, any gaps >30 days.
3 = All applicable items captured with dates.
2 = Most items captured; 1-2 minor omissions without gaps >30 days.
1 = Key items missing (e.g., surgery omitted, PT course undated).
0 = Multiple must-capture items absent or no treatment timeline.""",

        3: """Dimension 3 — Liability Summary Quality (0-3).
Penalize weak trigger phrases: "allegedly," "it appears," "may have caused," "reportedly," "seems to indicate," "possibly caused."
3 = Clear, definitive liability narrative; no hedge phrases; supported by source.
2 = Mostly clear; 1-2 hedge phrases that could be removed without loss.
1 = Hedged throughout; narrative feels uncertain or unsupported.
0 = Liability characterization is vague, contradictory, or factually wrong.""",

        4: """Dimension 4 — Damages Calculation Integrity (0-3).
Categories to verify: medical specials (billed vs. paid distinction), lost wages with basis (hourly rate × days or salary documentation), property damage if applicable, out-of-pocket expenses, future medical if claimed.
3 = All applicable categories present with correct math and billed/paid distinction.
2 = Most categories present; minor math imprecision or missing billed/paid split.
1 = Damages listed without basis or math; key category (e.g., lost wages) missing.
0 = Damages fabricated, totals wrong by >10%, or no damages section.""",

        5: """Dimension 5 — Deadline and Flag Accuracy (0-3).
Check: SOL date stated and correct for jurisdiction, active liens noted if present in source, insurance response deadlines flagged, jurisdiction confirmed.
3 = SOL correct, all active deadlines flagged, jurisdiction confirmed.
2 = SOL present but 1 deadline or lien missed; jurisdiction stated.
1 = SOL missing or only approximate; flags incomplete.
0 = No deadline section, wrong SOL, or jurisdiction not confirmed.""",

        6: """Dimension 6 — Correspondence Usability (0-3).
For correspondence tasks only. If task_type is not correspondence, score 3 automatically.
Ready-to-send criteria: correct recipient named, claim number present, professional tone, single clear ask.
3 = All four criteria met; send-ready with no edits.
2 = Three of four met; one minor fix needed.
1 = Two or fewer criteria met; substantive rewrite required.
0 = Wrong recipient, missing claim number, or multiple conflicting asks.""",
    }

    if dim_num == 6 and "correspondence" not in task_type.lower():
        # Auto-score 3 for non-correspondence tasks
        return "AUTO"

    return f"""You are evaluating paralegal AI output for a personal injury law firm.

TASK TYPE: {task_type}

PARALEGAL AI OUTPUT:
{output}

SOURCE DOCUMENTS (ground truth):
{source_docs}

SCORING INSTRUCTIONS:
{dim_instructions[dim_num]}

Respond ONLY with valid JSON (no markdown, no explanation outside the JSON):
{{
  "score": <integer 0-3>,
  "rationale": "<one concise sentence explaining the score>"
}}"""


async def _score_dimension(
    output: str, source_docs: str, task_type: str, dim_num: int, dim_name: str
) -> DimensionScore:
    prompt = _build_eval_prompt(output, source_docs, task_type, dim_num)

    if prompt == "AUTO":
        return DimensionScore(
            dimension=dim_num, name=dim_name, score=3,
            rationale="Non-correspondence task — dimension not applicable, auto-scored 3."
        )

    try:
        response = _client.messages.create(
            model=JUDGE_MODEL,
            max_tokens=256,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()
        data = json.loads(raw)
        score = max(0, min(3, int(data.get("score", 0))))
        rationale = data.get("rationale", "")
    except Exception as exc:
        score = 0
        rationale = f"Judge error: {exc}"

    return DimensionScore(dimension=dim_num, name=dim_name, score=score, rationale=rationale)


async def _run_all_dimensions(output: str, source_docs: str, task_type: str) -> list[DimensionScore]:
    dims = [
        (1, "Factual Accuracy"),
        (2, "Completeness: Injuries and Treatment"),
        (3, "Liability Summary Quality"),
        (4, "Damages Calculation Integrity"),
        (5, "Deadline and Flag Accuracy"),
        (6, "Correspondence Usability"),
    ]
    tasks = [
        _score_dimension(output, source_docs, task_type, num, name)
        for num, name in dims
    ]
    return await asyncio.gather(*tasks)


def _log_to_case_file(result: ParalegalVerifierResult, output: str) -> Path:
    case_dir = PROJECT_ROOT / "content" / "runs" / result.case_slug
    case_dir.mkdir(parents=True, exist_ok=True)
    target = case_dir / "verifier-output.md"

    lines = [
        f"# Verifier Output — {result.case_slug}",
        f"",
        f"**Timestamp:** {result.timestamp}",
        f"**Task type:** {result.task_type}",
        f"**Total score:** {result.total} / 18",
        f"**Delivery:** {result.delivery_label}",
        f"**Blocked:** {'YES' if result.blocked else 'no'}",
        f"",
    ]

    if result.hard_fail_triggered:
        lines += [f"**⛔ Hard Fail:** {result.hard_fail_reason}", ""]

    lines += ["## Dimension Scores", ""]
    for dim in result.dimensions:
        flag = " ⛔" if dim.hard_failed else ""
        lines.append(f"**Dim {dim.dimension} — {dim.name}:** {dim.score}/{dim.max_score}{flag}")
        lines.append(f"> {dim.rationale}")
        lines.append("")

    lines += [
        "## Output Evaluated",
        "",
        "```",
        output[:3000] + ("..." if len(output) > 3000 else ""),
        "```",
    ]

    target.write_text("\n".join(lines))
    return target


def _append_lessons(result: ParalegalVerifierResult) -> None:
    lessons_path = PROJECT_ROOT / "tasks" / "lessons.md"
    lessons_path.parent.mkdir(parents=True, exist_ok=True)

    dim_summary = "; ".join(
        f"Dim{d.dimension}={d.score}" for d in result.dimensions
    )
    entry = (
        f"\n## {result.timestamp[:10]} — Paralegal eval hard fail: {result.case_slug}\n"
        f"- **Score:** {result.total}/18 — {result.delivery_label}\n"
        f"- **Dimensions:** {dim_summary}\n"
        f"- **Task type:** {result.task_type}\n"
    )
    if result.hard_fail_triggered:
        entry += f"- **Hard fail trigger:** {result.hard_fail_reason}\n"

    weak_phrases = _check_weak_liability(result.hard_fail_reason or "")
    if weak_phrases:
        entry += f"- **Weak phrases found:** {', '.join(weak_phrases)}\n"

    entry += f"- **Prevention:** Review source docs before generating; check SOL + provider names.\n"

    with lessons_path.open("a") as f:
        f.write(entry)


def _append_examples_bank(result: ParalegalVerifierResult, output: str) -> None:
    bank_path = PROJECT_ROOT / "content" / "foundation" / "stores" / "examples-bank.md"
    bank_path.parent.mkdir(parents=True, exist_ok=True)

    entry = (
        f"\n## Example — {result.case_slug} ({result.timestamp[:10]})\n"
        f"**Score:** {result.total}/18 | **Task:** {result.task_type}\n\n"
        f"```\n{output[:2000]}{'...' if len(output) > 2000 else ''}\n```\n"
    )

    with bank_path.open("a") as f:
        f.write(entry)


def verify_paralegal_output(
    output: str,
    source_docs: str,
    case_slug: str,
    task_type: str = "medical-chronology",
) -> ParalegalVerifierResult:
    timestamp = datetime.utcnow().isoformat()

    result = ParalegalVerifierResult(
        case_slug=case_slug,
        task_type=task_type,
        timestamp=timestamp,
    )

    # Hard failure check (pre-LLM, pattern-based)
    hard_fail, hard_fail_reason = _check_hard_failures(output, source_docs)

    # Run all 6 dimensions in parallel
    dims = asyncio.run(_run_all_dimensions(output, source_docs, task_type))

    # Apply hard-fail override to Dim 1
    if hard_fail:
        dims[0].score = 0
        dims[0].hard_failed = True
        dims[0].rationale = f"Hard-fail override: {hard_fail_reason}"
        result.hard_fail_triggered = True
        result.hard_fail_reason = hard_fail_reason

    result.dimensions = dims
    result.total = sum(d.score for d in dims)
    result.blocked = result.total < BLOCK_THRESHOLD
    result.promoted = result.total >= PROMOTE_THRESHOLD

    # Side effects
    _log_to_case_file(result, output)

    if result.blocked:
        _append_lessons(result)

    if result.promoted:
        _append_examples_bank(result, output)

    return result


def save_paralegal_grade(result: ParalegalVerifierResult) -> None:
    """Write result to ai-quality.db for engineering-pipeline.py compatibility."""
    import sqlite3

    db_path = Path(__file__).parent / "quality.db"
    con = sqlite3.connect(db_path)
    con.execute("""
        CREATE TABLE IF NOT EXISTS paralegal_grades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_slug TEXT NOT NULL,
            task_type TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            total INTEGER NOT NULL,
            blocked INTEGER NOT NULL,
            promoted INTEGER NOT NULL,
            hard_fail INTEGER NOT NULL,
            dim1 INTEGER, dim2 INTEGER, dim3 INTEGER,
            dim4 INTEGER, dim5 INTEGER, dim6 INTEGER,
            processed INTEGER DEFAULT 0
        )
    """)
    scores = {d.dimension: d.score for d in result.dimensions}
    con.execute(
        """INSERT INTO paralegal_grades
           (case_slug, task_type, timestamp, total, blocked, promoted, hard_fail,
            dim1, dim2, dim3, dim4, dim5, dim6)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            result.case_slug, result.task_type, result.timestamp,
            result.total, int(result.blocked), int(result.promoted),
            int(result.hard_fail_triggered),
            scores.get(1), scores.get(2), scores.get(3),
            scores.get(4), scores.get(5), scores.get(6),
        ),
    )
    con.commit()
    con.close()


def get_low_paralegal_scores(hours_back: int = 24, threshold: int = 12) -> list[dict]:
    """Return unprocessed paralegal evals below threshold for pipeline ingestion."""
    import sqlite3

    db_path = Path(__file__).parent / "quality.db"
    if not db_path.exists():
        return []

    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    rows = con.execute(
        """SELECT * FROM paralegal_grades
           WHERE total < ?
             AND processed = 0
             AND timestamp > datetime('now', ? || ' hours')
           ORDER BY timestamp DESC""",
        (threshold, -hours_back),
    ).fetchall()
    con.close()
    return [dict(r) for r in rows]


def _print_result(result: ParalegalVerifierResult) -> None:
    print(f"\n{'='*60}")
    print(f"PARALEGAL VERIFIER — {result.case_slug}")
    print(f"{'='*60}")
    for dim in result.dimensions:
        flag = " ⛔ HARD FAIL" if dim.hard_failed else ""
        print(f"  Dim {dim.dimension} {dim.name}: {dim.score}/3{flag}")
        print(f"    {dim.rationale}")
    print(f"{'─'*60}")
    print(f"  TOTAL: {result.total}/18 — {result.delivery_label}")
    print(f"  Blocked: {'YES' if result.blocked else 'no'}")
    print(f"  Promoted to examples bank: {'YES' if result.promoted else 'no'}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Paralegal output verifier (PI-specific)")
    parser.add_argument("--output", required=True, help="Paralegal AI output text")
    parser.add_argument("--source-docs", required=True, help="Source documents (ground truth)")
    parser.add_argument("--case-slug", required=True, help="Case identifier, e.g. case-001")
    parser.add_argument("--task-type", default="medical-chronology",
                        help="Task type: medical-chronology | demand-letter | correspondence | lien-summary")
    parser.add_argument("--save-db", action="store_true", help="Persist result to quality.db")
    args = parser.parse_args()

    result = verify_paralegal_output(
        output=args.output,
        source_docs=args.source_docs,
        case_slug=args.case_slug,
        task_type=args.task_type,
    )

    _print_result(result)

    if args.save_db:
        save_paralegal_grade(result)
        print("Saved to quality.db")

    sys.exit(1 if result.blocked else 0)
