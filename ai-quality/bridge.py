#!/usr/bin/env python3
"""
Bridge — AI-Gated Grey Rollout System (WS3)
Routes requests to candidate model vs. baseline based on quality gate.
Scores candidate responses live; promotes or rolls back based on rolling score.

Usage:
  from bridge import Bridge
  bridge = Bridge(candidate="claude-opus-4-7", baseline="claude-sonnet-4-6")
  result = bridge.route(prompt, domain="legal")

  # Or run standalone evaluation sweep:
  python bridge.py --candidate claude-opus-4-7 --prompts test-prompts.jsonl
"""

import os
import json
import time
import sqlite3
import asyncio
import argparse
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import anthropic

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import google.generativeai as genai
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False


DB_PATH = Path(os.environ.get("AI_QUALITY_DB", "ai-quality.db"))

ROLLOUT_CONFIG = {
    "initial_traffic_pct": 5,
    "promotion_threshold": 7.5,
    "rollback_threshold": 5.5,
    "min_samples_before_decision": 20,
    "rolling_window_hours": 24,
    "max_traffic_pct": 80,
    "step_up_pct": 10,
    "step_up_after_samples": 50,
}


@dataclass
class RouteResult:
    prompt: str
    model_used: str
    response: str
    is_candidate: bool
    domain: str
    score: Optional[float] = None
    scored: bool = False
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS bridge_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prompt TEXT,
            model_used TEXT,
            is_candidate INTEGER,
            domain TEXT,
            score REAL,
            scored INTEGER DEFAULT 0,
            timestamp TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS rollout_state (
            id INTEGER PRIMARY KEY,
            candidate_model TEXT,
            baseline_model TEXT,
            traffic_pct INTEGER DEFAULT 5,
            status TEXT DEFAULT 'grey',
            last_updated TEXT
        )
    """)
    conn.commit()
    return conn


def get_rollout_state(conn: sqlite3.Connection, candidate: str, baseline: str) -> dict:
    row = conn.execute(
        "SELECT * FROM rollout_state WHERE candidate_model = ? AND baseline_model = ?",
        (candidate, baseline),
    ).fetchone()
    if not row:
        conn.execute(
            "INSERT INTO rollout_state (id, candidate_model, baseline_model, traffic_pct, status, last_updated) "
            "VALUES (NULL, ?, ?, ?, 'grey', ?)",
            (candidate, baseline, ROLLOUT_CONFIG["initial_traffic_pct"], datetime.utcnow().isoformat()),
        )
        conn.commit()
        return {"traffic_pct": ROLLOUT_CONFIG["initial_traffic_pct"], "status": "grey"}
    cols = ["id", "candidate_model", "baseline_model", "traffic_pct", "status", "last_updated"]
    return dict(zip(cols, row))


def update_rollout_state(conn: sqlite3.Connection, candidate: str, baseline: str, traffic_pct: int, status: str):
    conn.execute(
        "UPDATE rollout_state SET traffic_pct = ?, status = ?, last_updated = ? "
        "WHERE candidate_model = ? AND baseline_model = ?",
        (traffic_pct, status, datetime.utcnow().isoformat(), candidate, baseline),
    )
    conn.commit()


def save_result(conn: sqlite3.Connection, result: RouteResult):
    conn.execute(
        "INSERT INTO bridge_results (prompt, model_used, is_candidate, domain, score, scored, timestamp) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            result.prompt[:500],
            result.model_used,
            int(result.is_candidate),
            result.domain,
            result.score,
            int(result.scored),
            result.timestamp,
        ),
    )
    conn.commit()


def get_rolling_scores(conn: sqlite3.Connection, candidate: str, hours: int = 24) -> list[float]:
    cutoff = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
    rows = conn.execute(
        "SELECT score FROM bridge_results WHERE model_used = ? AND scored = 1 AND timestamp > ?",
        (candidate, cutoff),
    ).fetchall()
    return [r[0] for r in rows if r[0] is not None]


def should_use_candidate(traffic_pct: int) -> bool:
    import random
    return random.randint(1, 100) <= traffic_pct


async def call_model(model: str, prompt: str) -> str:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    response = client.messages.create(
        model=model,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


async def score_response_async(prompt: str, response: str, domain: str) -> float:
    """Quick 1-judge score using Haiku for speed. Full grader.py for forensics."""
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    score_prompt = f"""Rate this AI response on a scale of 1-10.

Domain: {domain}
Prompt: {prompt[:300]}
Response: {response[:500]}

Score on: accuracy (1-5) + usefulness (1-5). Output ONLY a JSON object:
{{"accuracy": N, "usefulness": N, "overall": N, "flag": false}}
Flag=true only if the response is harmful or factually dangerous."""

    result = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=100,
        messages=[{"role": "user", "content": score_prompt}],
    )
    try:
        data = json.loads(result.content[0].text)
        return float(data.get("overall", 5.0))
    except (json.JSONDecodeError, KeyError, ValueError):
        return 5.0


def evaluate_rollout(conn: sqlite3.Connection, candidate: str, baseline: str, state: dict):
    scores = get_rolling_scores(conn, candidate)
    if len(scores) < ROLLOUT_CONFIG["min_samples_before_decision"]:
        return state

    avg = sum(scores) / len(scores)
    traffic_pct = state["traffic_pct"]
    status = state["status"]

    if avg < ROLLOUT_CONFIG["rollback_threshold"] and status != "rolled_back":
        print(f"[Bridge] ROLLBACK: avg score {avg:.2f} < {ROLLOUT_CONFIG['rollback_threshold']}. Routing all traffic to baseline.")
        update_rollout_state(conn, candidate, baseline, 0, "rolled_back")
        state["traffic_pct"] = 0
        state["status"] = "rolled_back"

    elif avg >= ROLLOUT_CONFIG["promotion_threshold"] and len(scores) >= ROLLOUT_CONFIG["step_up_after_samples"]:
        new_pct = min(traffic_pct + ROLLOUT_CONFIG["step_up_pct"], ROLLOUT_CONFIG["max_traffic_pct"])
        if new_pct != traffic_pct:
            print(f"[Bridge] PROMOTE: avg score {avg:.2f}. Increasing traffic {traffic_pct}% → {new_pct}%")
            update_rollout_state(conn, candidate, baseline, new_pct, "grey")
            state["traffic_pct"] = new_pct

    return state


class Bridge:
    def __init__(self, candidate: str, baseline: str, score_live: bool = True):
        self.candidate = candidate
        self.baseline = baseline
        self.score_live = score_live
        self.conn = get_db()

    def route(self, prompt: str, domain: str = "general") -> RouteResult:
        state = get_rollout_state(self.conn, self.candidate, self.baseline)
        use_candidate = state["status"] not in ("rolled_back",) and should_use_candidate(state["traffic_pct"])

        model = self.candidate if use_candidate else self.baseline
        response = asyncio.run(call_model(model, prompt))

        result = RouteResult(
            prompt=prompt,
            model_used=model,
            response=response,
            is_candidate=use_candidate,
            domain=domain,
        )

        if self.score_live and use_candidate:
            score = asyncio.run(score_response_async(prompt, response, domain))
            result.score = score
            result.scored = True
            evaluate_rollout(self.conn, self.candidate, self.baseline, state)

        save_result(self.conn, result)
        return result

    def status(self) -> dict:
        state = get_rollout_state(self.conn, self.candidate, self.baseline)
        scores = get_rolling_scores(self.conn, self.candidate)
        return {
            "candidate": self.candidate,
            "baseline": self.baseline,
            "traffic_pct": state["traffic_pct"],
            "status": state["status"],
            "samples_24h": len(scores),
            "avg_score_24h": round(sum(scores) / len(scores), 2) if scores else None,
        }


def run_sweep(candidate: str, baseline: str, prompts_file: str):
    bridge = Bridge(candidate=candidate, baseline=baseline)
    prompts = []
    with open(prompts_file) as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    obj = json.loads(line)
                    prompts.append(obj)
                except json.JSONDecodeError:
                    prompts.append({"prompt": line, "domain": "general"})

    print(f"Running sweep: {len(prompts)} prompts, candidate={candidate}")
    for i, obj in enumerate(prompts, 1):
        result = bridge.route(obj["prompt"], domain=obj.get("domain", "general"))
        print(f"[{i}/{len(prompts)}] {'candidate' if result.is_candidate else 'baseline'} — score={result.score}")
        time.sleep(0.5)

    print("\n--- Rollout Status ---")
    print(json.dumps(bridge.status(), indent=2))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--candidate", required=True, help="Candidate model ID")
    parser.add_argument("--baseline", default="claude-sonnet-4-6")
    parser.add_argument("--prompts", help="JSONL file of {prompt, domain} objects")
    parser.add_argument("--status", action="store_true", help="Print current rollout status")
    args = parser.parse_args()

    if args.status:
        bridge = Bridge(candidate=args.candidate, baseline=args.baseline)
        print(json.dumps(bridge.status(), indent=2))
    elif args.prompts:
        run_sweep(args.candidate, args.baseline, args.prompts)
    else:
        parser.error("Provide --prompts or --status")


if __name__ == "__main__":
    main()
