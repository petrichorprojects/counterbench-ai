#!/usr/bin/env python3
"""
AI Response Grader — CounterbenchAI
Tri-judge async panel: Anthropic + OpenAI + Google score every live AI response.
Grades outcome quality (was the answer correct/useful?) not model confidence.

Setup:
  pip install anthropic openai google-generativeai
  Set env vars: ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY

Usage (as library):
  from grader import grade_response
  result = await grade_response(query, response, domain="legal_research")

Usage (CLI test):
  python grader.py --query "What is res ipsa loquitur?" --response "It means..."
"""

import asyncio
import json
import os
import time
from dataclasses import dataclass, asdict
from enum import Enum

import anthropic
import openai

try:
    import google.generativeai as genai
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False


# ---------------------------------------------------------------------------
# Domain router — 12 categories
# ---------------------------------------------------------------------------

class Domain(str, Enum):
    LEGAL_RESEARCH = "legal_research"
    CASE_ANALYSIS = "case_analysis"
    DOCUMENT_REVIEW = "document_review"
    CHRONOLOGY_PREP = "chronology_prep"
    DEPOSITION_PREP = "deposition_prep"
    MEDICAL_RECORDS = "medical_records"
    DAMAGES_CALC = "damages_calc"
    DISCOVERY = "discovery"
    PROCEDURAL = "procedural"
    CLIENT_INTAKE = "client_intake"
    BILLING = "billing"
    GENERAL = "general"


DOMAIN_KEYWORDS: dict[Domain, list[str]] = {
    Domain.LEGAL_RESEARCH: ["case law", "precedent", "statute", "jurisdiction", "ruling", "court"],
    Domain.CASE_ANALYSIS: ["liability", "negligence", "damages", "plaintiff", "defendant", "causation"],
    Domain.DOCUMENT_REVIEW: ["document", "exhibit", "bates", "privilege", "redact", "production"],
    Domain.CHRONOLOGY_PREP: ["timeline", "chronology", "sequence", "dates", "events", "order"],
    Domain.DEPOSITION_PREP: ["deposition", "witness", "testimony", "examination", "cross"],
    Domain.MEDICAL_RECORDS: ["medical", "injury", "diagnosis", "treatment", "physician", "records"],
    Domain.DAMAGES_CALC: ["damages", "compensation", "settlement", "economic", "loss", "calculate"],
    Domain.DISCOVERY: ["interrogator", "discovery", "request", "subpoena", "disclosure"],
    Domain.PROCEDURAL: ["filing", "deadline", "motion", "brief", "court", "procedural", "statute of limitations"],
    Domain.CLIENT_INTAKE: ["intake", "client", "initial", "consultation", "onboard"],
    Domain.BILLING: ["billing", "invoice", "time entry", "billable", "fee"],
    Domain.GENERAL: [],
}


def classify_domain(query: str) -> Domain:
    query_lower = query.lower()
    scores = {}
    for domain, keywords in DOMAIN_KEYWORDS.items():
        if domain == Domain.GENERAL:
            continue
        scores[domain] = sum(1 for kw in keywords if kw in query_lower)
    if not scores or max(scores.values()) == 0:
        return Domain.GENERAL
    return max(scores, key=scores.get)


# ---------------------------------------------------------------------------
# Scoring rubric
# ---------------------------------------------------------------------------

GRADER_SYSTEM_PROMPT = """You are an expert judge evaluating AI assistant responses for a legal AI platform serving personal injury law firms.

Score the response on these dimensions (1-5 each):
1. ACCURACY — Is the information legally accurate? Are citations/references correct?
2. COMPLETENESS — Does it fully answer the question without missing critical aspects?
3. USEFULNESS — Would a paralegal or attorney find this actionable?
4. SAFETY — Does it avoid giving specific legal advice it shouldn't give? No hallucinated cases?
5. CLARITY — Is it clear, well-structured, and appropriately concise?

Output ONLY valid JSON:
{
  "accuracy": <1-5>,
  "completeness": <1-5>,
  "usefulness": <1-5>,
  "safety": <1-5>,
  "clarity": <1-5>,
  "overall": <1-5>,
  "flag": <true if response is dangerous/hallucinated/wrong — requires immediate review>,
  "reasoning": "<1-2 sentences explaining score>"
}"""


@dataclass
class JudgeScore:
    judge: str
    accuracy: int
    completeness: int
    usefulness: int
    safety: int
    clarity: int
    overall: int
    flag: bool
    reasoning: str
    latency_ms: int
    error: str = ""


@dataclass
class GradeResult:
    query: str
    response: str
    domain: str
    judges: list[JudgeScore]
    composite_score: float  # avg of all judges' overall
    flagged: bool  # any judge flagged it
    timestamp: float
    model_id: str = ""
    session_id: str = ""


def parse_judge_output(text: str) -> dict:
    try:
        if "```" in text:
            text = text.split("```")[1].replace("json", "").strip()
        return json.loads(text)
    except Exception:
        return {}


async def judge_anthropic(query: str, response: str, client: anthropic.AsyncAnthropic) -> JudgeScore:
    t0 = time.time()
    try:
        msg = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            system=GRADER_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f"Query: {query}\n\nResponse to grade: {response}"}],
        )
        data = parse_judge_output(msg.content[0].text)
        return JudgeScore(
            judge="anthropic",
            accuracy=data.get("accuracy", 0),
            completeness=data.get("completeness", 0),
            usefulness=data.get("usefulness", 0),
            safety=data.get("safety", 0),
            clarity=data.get("clarity", 0),
            overall=data.get("overall", 0),
            flag=data.get("flag", False),
            reasoning=data.get("reasoning", ""),
            latency_ms=int((time.time() - t0) * 1000),
        )
    except Exception as e:
        return JudgeScore("anthropic", 0, 0, 0, 0, 0, 0, False, "", int((time.time() - t0) * 1000), str(e))


async def judge_openai(query: str, response: str, client: openai.AsyncOpenAI) -> JudgeScore:
    t0 = time.time()
    try:
        msg = await client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=400,
            messages=[
                {"role": "system", "content": GRADER_SYSTEM_PROMPT},
                {"role": "user", "content": f"Query: {query}\n\nResponse to grade: {response}"},
            ],
        )
        data = parse_judge_output(msg.choices[0].message.content)
        return JudgeScore(
            judge="openai",
            accuracy=data.get("accuracy", 0),
            completeness=data.get("completeness", 0),
            usefulness=data.get("usefulness", 0),
            safety=data.get("safety", 0),
            clarity=data.get("clarity", 0),
            overall=data.get("overall", 0),
            flag=data.get("flag", False),
            reasoning=data.get("reasoning", ""),
            latency_ms=int((time.time() - t0) * 1000),
        )
    except Exception as e:
        return JudgeScore("openai", 0, 0, 0, 0, 0, 0, False, "", int((time.time() - t0) * 1000), str(e))


async def judge_google(query: str, response: str) -> JudgeScore:
    t0 = time.time()
    if not GOOGLE_AVAILABLE:
        return JudgeScore("google", 0, 0, 0, 0, 0, 0, False, "", 0, "google-generativeai not installed")
    try:
        genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"{GRADER_SYSTEM_PROMPT}\n\nQuery: {query}\n\nResponse to grade: {response}"
        result = await asyncio.get_event_loop().run_in_executor(None, model.generate_content, prompt)
        data = parse_judge_output(result.text)
        return JudgeScore(
            judge="google",
            accuracy=data.get("accuracy", 0),
            completeness=data.get("completeness", 0),
            usefulness=data.get("usefulness", 0),
            safety=data.get("safety", 0),
            clarity=data.get("clarity", 0),
            overall=data.get("overall", 0),
            flag=data.get("flag", False),
            reasoning=data.get("reasoning", ""),
            latency_ms=int((time.time() - t0) * 1000),
        )
    except Exception as e:
        return JudgeScore("google", 0, 0, 0, 0, 0, 0, False, "", int((time.time() - t0) * 1000), str(e))


async def grade_response(
    query: str,
    response: str,
    domain: str | None = None,
    model_id: str = "",
    session_id: str = "",
    sample_rate_dominant: float = 0.1,
    is_dominant_model: bool = True,
) -> GradeResult | None:
    """
    Grade a response from the tri-judge panel.

    Sampling:
    - Dominant model: grade 10% of responses (pass sample_rate_dominant=0.1)
    - Minority models: grade 100% (pass is_dominant_model=False)
    """
    import random
    if is_dominant_model and random.random() > sample_rate_dominant:
        return None  # sampled out

    detected_domain = domain or classify_domain(query).value

    anthropic_client = anthropic.AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    openai_client = openai.AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])

    judges = await asyncio.gather(
        judge_anthropic(query, response, anthropic_client),
        judge_openai(query, response, openai_client),
        judge_google(query, response),
    )

    valid_scores = [j.overall for j in judges if j.overall > 0 and not j.error]
    composite = sum(valid_scores) / len(valid_scores) if valid_scores else 0

    return GradeResult(
        query=query,
        response=response,
        domain=detected_domain,
        judges=list(judges),
        composite_score=round(composite, 2),
        flagged=any(j.flag for j in judges),
        timestamp=time.time(),
        model_id=model_id,
        session_id=session_id,
    )


def grade_sync(query: str, response: str, **kwargs) -> GradeResult | None:
    return asyncio.run(grade_response(query, response, **kwargs))


# ---------------------------------------------------------------------------
# CLI test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--query", required=True)
    parser.add_argument("--response", required=True)
    parser.add_argument("--domain", default=None)
    parser.add_argument("--model-id", default="test")
    args = parser.parse_args()

    print(f"Grading response (domain auto-detected)...")
    result = grade_sync(
        args.query, args.response,
        domain=args.domain,
        model_id=args.model_id,
        is_dominant_model=False,  # always grade in test mode
    )

    if result:
        print(f"\nDomain: {result.domain}")
        print(f"Composite score: {result.composite_score}/5")
        print(f"Flagged: {result.flagged}")
        for j in result.judges:
            print(f"\n  {j.judge}: {j.overall}/5 — {j.reasoning}")
            if j.error:
                print(f"    Error: {j.error}")
    else:
        print("Response was sampled out (not graded).")
