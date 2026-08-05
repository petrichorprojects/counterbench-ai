"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  calculateStackCost,
  type StackCostInputs,
  type StackOwnerRole,
} from "@/lib/law-firm-stack-cost";

const TOOL_SLUG = "law-firm-stack-cost-calculator";

type FormValues = Record<
  | "monthlySoftwareCost"
  | "setupHours"
  | "monthlyMaintenanceHours"
  | "ownerHourlyValue"
  | "disruptionsPerQuarter"
  | "hoursLostPerDisruption",
  string
> & { ownerRole: StackOwnerRole | "" };

const INITIAL_VALUES: FormValues = {
  monthlySoftwareCost: "",
  setupHours: "0",
  monthlyMaintenanceHours: "",
  ownerRole: "",
  ownerHourlyValue: "",
  disruptionsPerQuarter: "0",
  hoursLostPerDisruption: "0",
};

const OWNER_LABELS: Record<StackOwnerRole, string> = {
  "managing-attorney": "Managing attorney or partner",
  attorney: "Attorney",
  paralegal: "Paralegal or legal assistant",
  operations: "Operations or IT staff",
  external: "External consultant",
};

const DRIVER_LABELS = {
  software: "Software licenses",
  setup: "Build and migration time",
  maintenance: "Ongoing maintenance",
  disruption: "Disruptions",
};

function pushEvent(event: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
}

function parseInput(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.NaN;
}

function dollars(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function hours(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export function LawFirmStackCostCalculator() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [submittedInputs, setSubmittedInputs] = useState<StackCostInputs | null>(null);
  const [formError, setFormError] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailMessage, setEmailMessage] = useState("");

  useEffect(() => {
    pushEvent({ event: "tool_view", tool_slug: TOOL_SLUG });
  }, []);

  const result = useMemo(
    () => (submittedInputs ? calculateStackCost(submittedInputs) : null),
    [submittedInputs],
  );

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function calculate() {
    const numeric = {
      monthlySoftwareCost: parseInput(values.monthlySoftwareCost),
      setupHours: parseInput(values.setupHours),
      monthlyMaintenanceHours: parseInput(values.monthlyMaintenanceHours),
      ownerHourlyValue: parseInput(values.ownerHourlyValue),
      disruptionsPerQuarter: parseInput(values.disruptionsPerQuarter),
      hoursLostPerDisruption: parseInput(values.hoursLostPerDisruption),
    };

    if (!values.ownerRole || Object.values(numeric).some((value) => Number.isNaN(value))) {
      setFormError("The cost couldn't be calculated. Complete every field with a number of zero or more.");
      return;
    }

    const inputs: StackCostInputs = { ...numeric, ownerRole: values.ownerRole };
    const calculated = calculateStackCost(inputs);
    setFormError("");
    setSubmittedInputs(inputs);
    setEmailStatus("idle");
    setEmailMessage("");
    pushEvent({
      event: "stack_cost_calculated",
      tool_slug: TOOL_SLUG,
      verdict: calculated.verdict.key,
      owner_role: inputs.ownerRole,
      dominant_cost_driver: calculated.dominantCostDriver,
    });
    requestAnimationFrame(() => {
      document.getElementById("stack-cost-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function reset() {
    setValues(INITIAL_VALUES);
    setSubmittedInputs(null);
    setFormError("");
    setEmail("");
    setCompany("");
    setEmailStatus("idle");
    setEmailMessage("");
  }

  async function sendBreakdown() {
    if (!submittedInputs || !result) return;

    setEmailStatus("sending");
    setEmailMessage("");

    try {
      const response = await fetch("/api/stack-cost-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, inputs: submittedInputs }),
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setEmailStatus("error");
        setEmailMessage(body.message || "The breakdown couldn't be sent. Print or save this page instead.");
        return;
      }

      setEmailStatus("sent");
      setEmailMessage("Breakdown sent. Check your inbox.");
      pushEvent({
        event: "stack_cost_report_requested",
        tool_slug: TOOL_SLUG,
        verdict: result.verdict.key,
      });
    } catch {
      setEmailStatus("error");
      setEmailMessage("The breakdown couldn't be sent. Check your connection and try again.");
    }
  }

  return (
    <div className="scc">
      <form
        className="card scc-form"
        onSubmit={(event) => {
          event.preventDefault();
          calculate();
        }}
      >
        <div className="label">Your current stack</div>
        <h2>Count the cost that doesn't appear on an invoice</h2>
        <p className="text-muted max-w-700">
          Use firm-level estimates only. Don&apos;t enter client names, matter details, or confidential information.
        </p>

        <div className="scc-fields mt-5">
          <label>
            <span>Monthly software spend</span>
            <span className="scc-input-affix">
              <span aria-hidden="true">$</span>
              <input
                name="monthlySoftwareCost"
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                required
                placeholder="2,400"
                value={values.monthlySoftwareCost}
                onChange={(event) => update("monthlySoftwareCost", event.target.value)}
              />
            </span>
            <small>Include practice management, intake, research, automation, and storage</small>
          </label>

          <label>
            <span>Build and migration time</span>
            <span className="scc-input-suffix">
              <input
                name="setupHours"
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                required
                value={values.setupHours}
                onChange={(event) => update("setupHours", event.target.value)}
              />
              <span aria-hidden="true">hours</span>
            </span>
            <small>Count the time spent setting up or migrating this stack</small>
          </label>

          <label>
            <span>Ongoing maintenance</span>
            <span className="scc-input-suffix">
              <input
                name="monthlyMaintenanceHours"
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                required
                placeholder="12"
                value={values.monthlyMaintenanceHours}
                onChange={(event) => update("monthlyMaintenanceHours", event.target.value)}
              />
              <span aria-hidden="true">hours / month</span>
            </span>
            <small>Include updates, fixes, user support, and manual data cleanup</small>
          </label>

          <label>
            <span>Who owns the stack?</span>
            <select
              name="ownerRole"
              required
              value={values.ownerRole}
              onChange={(event) => update("ownerRole", event.target.value as StackOwnerRole | "")}
            >
              <option value="">Select a role</option>
              {Object.entries(OWNER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <small>Choose the person who handles routine maintenance and failures</small>
          </label>

          <label>
            <span>Hourly value used for the estimate</span>
            <span className="scc-input-affix">
              <span aria-hidden="true">$</span>
              <input
                name="ownerHourlyValue"
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                required
                placeholder="350"
                value={values.ownerHourlyValue}
                onChange={(event) => update("ownerHourlyValue", event.target.value)}
              />
            </span>
            <small>Use loaded employment cost, billable value, or a blended team rate</small>
          </label>

          <label>
            <span>Disruptions</span>
            <span className="scc-input-suffix">
              <input
                name="disruptionsPerQuarter"
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                required
                value={values.disruptionsPerQuarter}
                onChange={(event) => update("disruptionsPerQuarter", event.target.value)}
              />
              <span aria-hidden="true">per quarter</span>
            </span>
            <small>Count failures that interrupt intake, drafting, communication, or case work</small>
          </label>

          <label>
            <span>Team time lost per disruption</span>
            <span className="scc-input-suffix">
              <input
                name="hoursLostPerDisruption"
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                required
                value={values.hoursLostPerDisruption}
                onChange={(event) => update("hoursLostPerDisruption", event.target.value)}
              />
              <span aria-hidden="true">hours</span>
            </span>
            <small>Combine the time lost by everyone affected</small>
          </label>
        </div>

        <div className="scc-form-actions mt-5">
          <button type="submit" className="btn btn--primary">
            Calculate ownership cost
          </button>
          <span className="text-muted">About two minutes</span>
        </div>
        {formError ? (
          <p className="scc-message scc-message--error" role="alert">
            {formError}
          </p>
        ) : null}
      </form>

      {result && submittedInputs ? (
        <section id="stack-cost-result" className="scc-result" aria-live="polite">
          <div className="card scc-result-hero">
            <div className="label">Your result</div>
            <p className="scc-total-label">Your stack costs about</p>
            <p className="scc-total">{dollars(result.firstYearCost)}</p>
            <p className="scc-total-label">in the first year</p>
            <div className="scc-verdict mt-4">
              <span className={`scc-verdict-dot scc-verdict-dot--${result.verdict.key}`} aria-hidden="true" />
              <div>
                <h2>{result.verdict.title}</h2>
                <p>{result.verdict.summary}</p>
              </div>
            </div>
          </div>

          <div className="scc-metrics mt-4">
            <div className="card">
              <div className="label">Hidden labor</div>
              <strong>{dollars(result.hiddenLaborCost)}</strong>
              <p>{Math.round(result.hiddenLaborShare * 100)}% of first-year cost</p>
            </div>
            <div className="card">
              <div className="label">Operator time</div>
              <strong>{hours(result.firstYearOperatorHours)} hours</strong>
              <p>{hours(result.recurringOperatorHours)} recurring hours each year</p>
            </div>
            <div className="card">
              <div className="label">Three-year cost</div>
              <strong>{dollars(result.threeYearCost)}</strong>
              <p>{dollars(result.recurringAnnualCost)} recurring each year</p>
            </div>
            <div className="card">
              <div className="label">Largest cost driver</div>
              <strong>{DRIVER_LABELS[result.dominantCostDriver]}</strong>
              <p>{dollars(result.annualDowntimeCost)} lost to disruption each year</p>
            </div>
          </div>

          <div className="grid grid--2 grid--gap-2 mt-4 scc-breakdown">
            <div className="card">
              <div className="label">First-year breakdown</div>
              <dl className="scc-cost-list">
                <div>
                  <dt>Software licenses</dt>
                  <dd>{dollars(result.annualLicenseCost)}</dd>
                </div>
                <div>
                  <dt>Build and migration time</dt>
                  <dd>{dollars(result.setupLaborCost)}</dd>
                </div>
                <div>
                  <dt>Ongoing maintenance</dt>
                  <dd>{dollars(result.annualMaintenanceCost)}</dd>
                </div>
                <div>
                  <dt>Disruptions</dt>
                  <dd>{dollars(result.annualDowntimeCost)}</dd>
                </div>
              </dl>
            </div>

            <div className="card">
              <div className="label">Next three actions</div>
              <ol className="scc-actions">
                {result.verdict.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="card scc-email mt-4">
            <div>
              <div className="label">Keep the breakdown</div>
              <h3>Get these numbers by email</h3>
              <p className="text-muted">
                We&apos;ll send the result and next three actions. No client or matter data is included.
              </p>
            </div>
            {emailStatus !== "sent" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendBreakdown();
                }}
              >
                <label className="sr-only" htmlFor="stack-report-email">
                  Work email
                </label>
                <input
                  id="stack-report-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="you@firm.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={emailStatus === "error" ? true : undefined}
                />
                <input
                  className="scc-honeypot"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  name="company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
                <button type="submit" className="btn btn--primary btn--sm" disabled={emailStatus === "sending"}>
                  {emailStatus === "sending" ? "Sending…" : "Email the breakdown"}
                </button>
                <p className="text-muted scc-consent">
                  Counterbench may follow up about this result. See our <Link href="/privacy">privacy policy</Link>.
                </p>
              </form>
            ) : null}
            {emailMessage ? (
              <p
                className={`scc-message ${emailStatus === "error" ? "scc-message--error" : "scc-message--success"}`}
                role={emailStatus === "error" ? "alert" : "status"}
              >
                {emailMessage}
              </p>
            ) : null}
          </div>

          <div className="card scc-cta mt-4">
            <div>
              <div className="label">Need a second opinion?</div>
              <h3>See what to keep, replace, or hand off</h3>
              <p className="text-muted">
                Counterbench Advisory reviews the stack and the workflows around it. No software commissions and no
                preferred vendors.
              </p>
            </div>
            <Link
              href="/advisory?from=stack-cost-calculator"
              className="btn btn--primary btn--arrow"
              onClick={() =>
                pushEvent({
                  event: "tool_click_cta",
                  tool_slug: TOOL_SLUG,
                  destination: "/advisory",
                  verdict: result.verdict.key,
                })
              }
            >
              Review my stack
            </Link>
          </div>

          <div className="scc-result-actions mt-5">
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => window.print()}>
              Print or save as PDF
            </button>
            <button type="button" className="btn btn--secondary btn--sm" onClick={reset}>
              Start over
            </button>
          </div>

          <p className="text-muted scc-disclaimer mt-4">
            This estimate uses the hourly value you entered. It isn&apos;t an accounting valuation or a recommendation to
            buy or replace any specific product.
          </p>
        </section>
      ) : null}
    </div>
  );
}
