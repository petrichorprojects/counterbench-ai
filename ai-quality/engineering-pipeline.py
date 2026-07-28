#!/usr/bin/env python3
"""
AI Quality Engineering Pipeline — CounterbenchAI
6 daily jobs that process low-scoring responses:
  1. Cluster failure types by domain + score pattern
  2. Generate problem summaries per cluster
  3. Create Linear tickets for each cluster
  4. Draft fix PRs (prompt improvements, routing changes)
  5. Update quality dashboard metrics
  6. Send daily digest to Philipp

Setup:
  pip install anthropic linear-sdk httpx
  Set env vars: ANTHROPIC_API_KEY, LINEAR_API_KEY, LINEAR_TEAM_ID
  DB: PostgreSQL connection via DATABASE_URL (or SQLite for local dev)

Run: python engineering-pipeline.py
Cron: 0 6 * * * python /path/to/engineering-pipeline.py  (6am daily)
"""

import os
import json
import asyncio
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass
from collections import defaultdict

import anthropic
import httpx
from paralegal_verifier import get_low_paralegal_scores

# ---------------------------------------------------------------------------
# Storage interface — swap for PostgreSQL in production
# ---------------------------------------------------------------------------

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "quality.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS grades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT,
                response TEXT,
                domain TEXT,
                composite_score REAL,
                flagged INTEGER,
                model_id TEXT,
                session_id TEXT,
                judge_scores TEXT,  -- JSON
                timestamp REAL,
                pipeline_processed INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS clusters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                domain TEXT,
                pattern TEXT,
                grade_ids TEXT,  -- JSON array
                avg_score REAL,
                linear_ticket_id TEXT,
                linear_ticket_url TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        db.commit()


def save_grade(result) -> int:
    with get_db() as db:
        cur = db.execute("""
            INSERT INTO grades (query, response, domain, composite_score, flagged, model_id, session_id, judge_scores, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            result.query,
            result.response,
            result.domain,
            result.composite_score,
            1 if result.flagged else 0,
            result.model_id,
            result.session_id,
            json.dumps([vars(j) if hasattr(j, '__dict__') else j for j in result.judges]),
            result.timestamp,
        ))
        db.commit()
        return cur.lastrowid


def get_low_scores(hours_back: int = 24, threshold: float = 3.0) -> list[dict]:
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours_back)).timestamp()
    with get_db() as db:
        rows = db.execute("""
            SELECT * FROM grades
            WHERE composite_score < ? AND timestamp > ? AND pipeline_processed = 0
            ORDER BY composite_score ASC
        """, (threshold, cutoff)).fetchall()
    return [dict(r) for r in rows]


def mark_processed(ids: list[int]):
    if not ids:
        return
    placeholders = ",".join("?" * len(ids))
    with get_db() as db:
        db.execute(f"UPDATE grades SET pipeline_processed = 1 WHERE id IN ({placeholders})", ids)
        db.commit()


# ---------------------------------------------------------------------------
# Job 1: Cluster failure types
# ---------------------------------------------------------------------------

@dataclass
class FailureCluster:
    domain: str
    pattern: str
    grade_ids: list[int]
    avg_score: float
    examples: list[dict]


def cluster_failures(low_scores: list[dict]) -> list[FailureCluster]:
    by_domain = defaultdict(list)
    for row in low_scores:
        by_domain[row["domain"]].append(row)

    clusters = []
    for domain, rows in by_domain.items():
        avg = sum(r["composite_score"] for r in rows) / len(rows)
        clusters.append(FailureCluster(
            domain=domain,
            pattern=f"Low scores in {domain} ({len(rows)} responses, avg {avg:.1f}/5)",
            grade_ids=[r["id"] for r in rows],
            avg_score=round(avg, 2),
            examples=rows[:3],
        ))

    return sorted(clusters, key=lambda c: c.avg_score)


# ---------------------------------------------------------------------------
# Job 2: Generate problem summary per cluster
# ---------------------------------------------------------------------------

async def summarize_cluster(cluster: FailureCluster, client: anthropic.AsyncAnthropic) -> str:
    examples_text = "\n\n---\n\n".join([
        f"Query: {ex['query']}\nResponse: {ex['response'][:400]}\nScore: {ex['composite_score']}/5"
        for ex in cluster.examples
    ])

    msg = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=600,
        messages=[{"role": "user", "content": f"""Analyze these low-scoring AI responses in the "{cluster.domain}" domain.

{examples_text}

Identify:
1. The root cause (hallucination? wrong format? missing context? wrong domain routing?)
2. What a correct response would look like
3. A specific fix recommendation (prompt change? routing change? training example needed?)

Output as JSON:
{{
  "root_cause": "...",
  "pattern_name": "short label for this failure type",
  "fix_type": "prompt_change | routing_fix | example_needed | context_issue",
  "fix_description": "specific change to make",
  "priority": "high | medium | low"
}}"""}]
    )

    try:
        text = msg.content[0].text.strip()
        if "```" in text:
            text = text.split("```")[1].replace("json", "").strip()
        return text
    except Exception:
        return "{}"


# ---------------------------------------------------------------------------
# Job 3: Create Linear tickets
# ---------------------------------------------------------------------------

LINEAR_API_URL = "https://api.linear.app/graphql"


async def create_linear_ticket(
    title: str,
    description: str,
    priority: int = 2,
) -> tuple[str, str]:
    """Returns (ticket_id, ticket_url)"""
    api_key = os.environ.get("LINEAR_API_KEY", "")
    team_id = os.environ.get("LINEAR_TEAM_ID", "")

    if not api_key or not team_id:
        print("  [Linear] No LINEAR_API_KEY or LINEAR_TEAM_ID — skipping ticket creation")
        return "", ""

    mutation = """
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          url
          identifier
        }
      }
    }
    """

    payload = {
        "query": mutation,
        "variables": {
            "input": {
                "teamId": team_id,
                "title": title,
                "description": description,
                "priority": priority,
                "labelIds": [],
            }
        }
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            LINEAR_API_URL,
            json=payload,
            headers={"Authorization": api_key, "Content-Type": "application/json"},
            timeout=10,
        )
        data = resp.json()
        issue = data.get("data", {}).get("issueCreate", {}).get("issue", {})
        return issue.get("id", ""), issue.get("url", "")


# ---------------------------------------------------------------------------
# Job 4: Draft fix recommendations
# ---------------------------------------------------------------------------

async def draft_fix_pr(cluster: FailureCluster, summary: dict, client: anthropic.AsyncAnthropic) -> str:
    fix_type = summary.get("fix_type", "")
    fix_desc = summary.get("fix_description", "")

    if fix_type == "prompt_change":
        msg = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=800,
            messages=[{"role": "user", "content": f"""Write a specific prompt improvement for the {cluster.domain} domain.

Problem: {summary.get('root_cause', '')}
Fix needed: {fix_desc}

Output a concrete system prompt addition or modification (3-5 sentences) that would prevent this failure."""}]
        )
        return f"**Prompt Fix Draft:**\n\n{msg.content[0].text.strip()}"

    elif fix_type == "routing_fix":
        return f"**Routing Fix:**\n\nUpdate domain classifier to add/adjust keywords for `{cluster.domain}`. See `grader.py:DOMAIN_KEYWORDS`.\n\nSpecific change: {fix_desc}"

    elif fix_type == "example_needed":
        msg = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            messages=[{"role": "user", "content": f"""Write a gold-standard example Q&A pair for the {cluster.domain} domain.
This will be used as a few-shot example in the system prompt.

Problem being solved: {summary.get('root_cause', '')}

Output:
User: [example question]
Assistant: [ideal response, 100-200 words]"""}]
        )
        return f"**Example Q&A for Few-Shot:**\n\n{msg.content[0].text.strip()}"

    return f"**Manual Review Needed:**\n\n{fix_desc}"


# ---------------------------------------------------------------------------
# Job 5: Quality metrics
# ---------------------------------------------------------------------------

def compute_metrics(hours_back: int = 24) -> dict:
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours_back)).timestamp()
    with get_db() as db:
        rows = db.execute(
            "SELECT composite_score, flagged, domain FROM grades WHERE timestamp > ?",
            (cutoff,)
        ).fetchall()

    if not rows:
        return {}

    scores = [r["composite_score"] for r in rows]
    by_domain = defaultdict(list)
    for r in rows:
        by_domain[r["domain"]].append(r["composite_score"])

    return {
        "total_graded": len(rows),
        "avg_score": round(sum(scores) / len(scores), 2),
        "flagged": sum(1 for r in rows if r["flagged"]),
        "below_3": sum(1 for s in scores if s < 3),
        "above_4": sum(1 for s in scores if s >= 4),
        "by_domain": {
            d: round(sum(s) / len(s), 2)
            for d, s in by_domain.items()
        }
    }


# ---------------------------------------------------------------------------
# Job 6: Daily digest
# ---------------------------------------------------------------------------

def format_digest(metrics: dict, clusters: list[FailureCluster], tickets: list[tuple]) -> str:
    date = datetime.now().strftime("%Y-%m-%d")
    lines = [
        f"# AI Quality Digest — {date}",
        "",
        "## Overall",
        f"- Responses graded: {metrics.get('total_graded', 0)}",
        f"- Avg score: {metrics.get('avg_score', 0)}/5",
        f"- Flagged: {metrics.get('flagged', 0)}",
        f"- Below 3.0: {metrics.get('below_3', 0)}",
        f"- Above 4.0: {metrics.get('above_4', 0)}",
        "",
        "## By Domain",
    ]
    for domain, score in (metrics.get("by_domain") or {}).items():
        lines.append(f"- {domain}: {score}/5")

    lines += ["", "## Failure Clusters This Period"]
    for cluster in clusters:
        lines.append(f"- **{cluster.domain}**: {len(cluster.grade_ids)} low scores, avg {cluster.avg_score}/5")

    lines += ["", "## Linear Tickets Created"]
    for ticket_id, ticket_url, title in tickets:
        if ticket_url:
            lines.append(f"- [{title[:60]}]({ticket_url})")
        else:
            lines.append(f"- {title[:60]} (ticket creation failed)")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

async def run_pipeline():
    init_db()
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M')}] Starting AI Quality Engineering Pipeline")

    client = anthropic.AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    # Job 1: Cluster
    print("\nJob 1: Fetching low-scoring responses...")
    low_scores = get_low_scores(hours_back=24, threshold=3.0)
    print(f"  {len(low_scores)} low-scoring responses found")

    if not low_scores:
        print("  No failures to process today.")
        metrics = compute_metrics()
        print(f"\nJob 5: Metrics — avg score: {metrics.get('avg_score', 0)}/5")
        return

    clusters = cluster_failures(low_scores)
    print(f"  {len(clusters)} failure clusters identified")

    # Jobs 2-4: Summarize + ticket + fix
    tickets = []
    for cluster in clusters:
        print(f"\nJob 2: Summarizing cluster: {cluster.domain}...")
        summary_raw = await summarize_cluster(cluster, client)
        try:
            summary = json.loads(summary_raw)
        except Exception:
            summary = {}

        fix_draft = await draft_fix_pr(cluster, summary, client)

        priority_map = {"high": 1, "medium": 2, "low": 3}
        priority = priority_map.get(summary.get("priority", "medium"), 2)

        title = f"[AI Quality] {cluster.domain}: {summary.get('pattern_name', 'Low scores')}"
        description = f"""**Cluster**: {cluster.domain}
**Affected responses**: {len(cluster.grade_ids)}
**Avg score**: {cluster.avg_score}/5
**Root cause**: {summary.get('root_cause', 'Unknown')}
**Fix type**: {summary.get('fix_type', 'Unknown')}

---

{fix_draft}

---

**Grade IDs**: {', '.join(str(i) for i in cluster.grade_ids[:20])}"""

        print(f"Job 3: Creating Linear ticket for {cluster.domain}...")
        ticket_id, ticket_url = await create_linear_ticket(title, description, priority)
        tickets.append((ticket_id, ticket_url, title))

        if ticket_id:
            # Save cluster to DB
            with get_db() as db:
                db.execute("""
                    INSERT INTO clusters (date, domain, pattern, grade_ids, avg_score, linear_ticket_id, linear_ticket_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    datetime.now().strftime("%Y-%m-%d"),
                    cluster.domain,
                    summary.get("pattern_name", ""),
                    json.dumps(cluster.grade_ids),
                    cluster.avg_score,
                    ticket_id,
                    ticket_url,
                ))
                db.commit()

    # Mark processed
    all_ids = [r["id"] for r in low_scores]
    mark_processed(all_ids)

    # Job 5: Metrics
    print("\nJob 5: Computing quality metrics...")
    metrics = compute_metrics()
    print(f"  Avg score (24h): {metrics.get('avg_score', 0)}/5")

    # Job 6: Digest
    print("\nJob 6: Generating daily digest...")
    digest = format_digest(metrics, clusters, tickets)

    digest_path = Path(__file__).parent / f"digest-{datetime.now().strftime('%Y-%m-%d')}.md"
    digest_path.write_text(digest)
    print(f"  Digest saved: {digest_path}")
    print("\n" + digest)

    # Job 7: Paralegal eval sweep — surface blocked PI outputs into cluster pipeline
    print("\nJob 7: Paralegal eval sweep...")
    blocked_evals = get_low_paralegal_scores(hours_back=24, threshold=12)
    if blocked_evals:
        print(f"  {len(blocked_evals)} blocked paralegal evals found")
        for row in blocked_evals:
            # Normalize 0-18 score to 0-5 for compatibility with existing grade pipeline
            normalized = round((row["total"] / 18) * 5, 2)
            with get_db() as db:
                db.execute(
                    """INSERT OR IGNORE INTO grades
                       (response_id, domain, model, score, timestamp, processed)
                       VALUES (?, ?, ?, ?, ?, 0)""",
                    (
                        f"paralegal-{row['case_slug']}-{row['id']}",
                        "paralegal-pi",
                        "paralegal-verifier",
                        normalized,
                        row["timestamp"],
                    ),
                )
                db.execute(
                    "UPDATE paralegal_grades SET processed=1 WHERE id=?",
                    (row["id"],),
                )
                db.commit()
        print(f"  Injected {len(blocked_evals)} evals into grade pipeline (domain=paralegal-pi)")
    else:
        print("  No blocked paralegal evals in last 24h")


if __name__ == "__main__":
    asyncio.run(run_pipeline())
