import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  calculateStackCost,
  type StackCostInputs,
  type StackOwnerRole,
} from "@/lib/law-firm-stack-cost";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const ipHits = new Map<string, number[]>();
const OWNER_ROLES: StackOwnerRole[] = [
  "managing-attorney",
  "attorney",
  "paralegal",
  "operations",
  "external",
];

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, hits] of ipHits) {
    const active = hits.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
    if (active.length === 0) ipHits.delete(ip);
    else ipHits.set(ip, active);
  }
}, 10 * 60 * 1000).unref();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function validEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  );
}

function boundedNumber(value: unknown, max: number): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= max ? value : null;
}

function parseInputs(value: unknown): StackCostInputs | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const ownerRole = input.ownerRole;
  if (typeof ownerRole !== "string" || !OWNER_ROLES.includes(ownerRole as StackOwnerRole)) return null;

  const monthlySoftwareCost = boundedNumber(input.monthlySoftwareCost, 10_000_000);
  const setupHours = boundedNumber(input.setupHours, 100_000);
  const monthlyMaintenanceHours = boundedNumber(input.monthlyMaintenanceHours, 10_000);
  const ownerHourlyValue = boundedNumber(input.ownerHourlyValue, 100_000);
  const disruptionsPerQuarter = boundedNumber(input.disruptionsPerQuarter, 10_000);
  const hoursLostPerDisruption = boundedNumber(input.hoursLostPerDisruption, 100_000);

  if (
    monthlySoftwareCost === null ||
    setupHours === null ||
    monthlyMaintenanceHours === null ||
    ownerHourlyValue === null ||
    disruptionsPerQuarter === null ||
    hoursLostPerDisruption === null
  ) {
    return null;
  }

  return {
    monthlySoftwareCost,
    setupHours,
    monthlyMaintenanceHours,
    ownerRole: ownerRole as StackOwnerRole,
    ownerHourlyValue,
    disruptionsPerQuarter,
    hoursLostPerDisruption,
  };
}

function dollars(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

async function forwardLead(payload: Record<string, unknown>) {
  const url = process.env.N8N_LEAD_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
    });
  } catch (error) {
    console.error({ event: "stack_cost_n8n_forward_failed", error: String(error) });
  }
}

export async function POST(request: Request) {
  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json(
      { message: "Too many email requests. Print or save this page, or try again later." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ message: "The breakdown couldn't be sent. Try again." }, { status: 400 });
  }

  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  if (!validEmail(body.email)) {
    return NextResponse.json({ message: "Enter a valid work email." }, { status: 400 });
  }

  const inputs = parseInputs(body.inputs);
  if (!inputs) {
    return NextResponse.json(
      { message: "The calculation details couldn't be read. Calculate the result again and retry." },
      { status: 400 },
    );
  }

  const email = body.email.trim();
  const result = calculateStackCost(inputs);

  await forwardLead({
    business: "CounterbenchAI",
    cta: "Law firm stack cost report",
    source: "law-firm-stack-cost-calculator",
    email,
    verdict: result.verdict.key,
    first_year_cost: Math.round(result.firstYearCost),
    recurring_annual_cost: Math.round(result.recurringAnnualCost),
    three_year_cost: Math.round(result.threeYearCost),
    hidden_labor_share: Math.round(result.hiddenLaborShare * 100),
    owner_role: inputs.ownerRole,
    dominant_cost_driver: result.dominantCostDriver,
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error({ event: "stack_cost_report_no_resend_key" });
    return NextResponse.json(
      { message: "Email delivery is temporarily unavailable. Print or save this page instead." },
      { status: 503 },
    );
  }

  const text = [
    "Your law firm tech stack cost breakdown",
    "",
    `First-year ownership cost: ${dollars(result.firstYearCost)}`,
    `Recurring annual cost: ${dollars(result.recurringAnnualCost)}`,
    `Three-year cost: ${dollars(result.threeYearCost)}`,
    `Hidden labor: ${dollars(result.hiddenLaborCost)} (${Math.round(result.hiddenLaborShare * 100)}% of first-year cost)`,
    `First-year operator time: ${Math.round(result.firstYearOperatorHours)} hours`,
    "",
    `Verdict: ${result.verdict.title}`,
    result.verdict.summary,
    "",
    "Next three actions:",
    ...result.verdict.actions.map((action, index) => `${index + 1}. ${action}`),
    "",
    "First-year cost breakdown:",
    `Software licenses: ${dollars(result.annualLicenseCost)}`,
    `Build and migration time: ${dollars(result.setupLaborCost)}`,
    `Ongoing maintenance: ${dollars(result.annualMaintenanceCost)}`,
    `Disruptions: ${dollars(result.annualDowntimeCost)}`,
    "",
    "Review the stack with Counterbench Advisory:",
    "https://counterbench.ai/advisory?from=stack-cost-report",
    "",
    "This estimate uses the hourly value entered in the calculator. It isn't an accounting valuation or a recommendation to buy or replace any specific product.",
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM || "Counterbench.AI <noreply@counterbench.ai>",
      to: email,
      subject: `Your law firm tech stack cost: ${dollars(result.firstYearCost)} in year one`,
      text,
    });

    if (response.error) throw new Error(response.error.message);
  } catch (error) {
    console.error({ event: "stack_cost_report_send_failed", error: String(error) });
    return NextResponse.json(
      { message: "The breakdown couldn't be sent. Print or save this page instead." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
