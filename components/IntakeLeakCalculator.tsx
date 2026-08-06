"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  calculateIntakeLeak,
  INTAKE_LEAK_DEFAULTS,
  type IntakeLeakInput,
} from "@/lib/intake-leak-calculator";
import styles from "@/app/tools/intake-leak-calculator/intake-leak-calculator.module.css";

const TOOL_SLUG = "intake-leak-calculator";
const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type FieldKey = keyof IntakeLeakInput;

function pushEvent(event: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
}

interface InputRowProps {
  id: string;
  field: FieldKey;
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  prefix?: string;
  featured?: boolean;
  onChange: (field: FieldKey, value: number) => void;
}

function InputRow({
  id,
  field,
  label,
  description,
  value,
  min,
  max,
  step,
  unit,
  prefix,
  featured = false,
  onChange,
}: InputRowProps) {
  const boundedRangeValue = Math.min(max, Math.max(min, value));
  const progress = ((boundedRangeValue - min) / (max - min)) * 100;

  function update(raw: string) {
    const numeric = Number(raw);
    onChange(field, Number.isFinite(numeric) ? numeric : 0);
  }

  return (
    <div className={`${styles.fieldRow} ${featured ? styles.featuredField : ""}`}>
      <div className={styles.fieldCopy}>
        <label htmlFor={id}>{label}</label>
        <p>{description}</p>
      </div>
      <div className={styles.controlPair}>
        <input
          className={styles.range}
          type="range"
          id={`${id}-range`}
          aria-label={`${label} slider`}
          min={min}
          max={max}
          step={step}
          value={boundedRangeValue}
          style={{ "--range-progress": `${progress}%` } as React.CSSProperties}
          onChange={(event) => update(event.target.value)}
        />
        <div className={styles.numberWrap}>
          {prefix ? <span>{prefix}</span> : null}
          <input
            type="number"
            id={id}
            min={0}
            max={field === "seriousRate" ? 100 : undefined}
            step={step}
            value={value}
            onChange={(event) => update(event.target.value)}
          />
          {unit ? <span>{unit}</span> : null}
        </div>
      </div>
    </div>
  );
}

export function IntakeLeakCalculator() {
  const [inputs, setInputs] = useState<IntakeLeakInput>({ ...INTAKE_LEAK_DEFAULTS });
  const result = useMemo(() => calculateIntakeLeak(inputs), [inputs]);

  useEffect(() => {
    pushEvent({ event: "tool_view", tool_slug: TOOL_SLUG });
  }, []);

  function update(field: FieldKey, value: number) {
    setInputs((current) => ({ ...current, [field]: value }));
  }

  function trackCta() {
    pushEvent({ event: "tool_click_cta", tool_slug: TOOL_SLUG, destination: "/paralegals" });
  }

  return (
    <>
      <section className={styles.calculatorShell} id="calculator" aria-labelledby="calculator-title">
        <form className={styles.inputsPanel} onSubmit={(event) => event.preventDefault()}>
          <div className={styles.panelHeading}>
            <span className={styles.stepNumber}>01</span>
            <div>
              <p className={styles.overline}>Enter the monthly numbers</p>
              <h2 id="calculator-title">What crosses your front desk?</h2>
            </div>
          </div>

          <div className={styles.fieldList}>
            <InputRow
              id="call-volume"
              field="callVolume"
              label="Google LSA calls"
              description="Average calls in one month."
              value={result.callVolume}
              min={10}
              max={500}
              step={5}
              unit="calls"
              onChange={update}
            />
            <InputRow
              id="cost-per-call"
              field="costPerCall"
              label="Cost per call"
              description="What Google charges, not your case value."
              value={result.costPerCall}
              min={5}
              max={150}
              step={1}
              prefix="$"
              onChange={update}
            />
            <InputRow
              id="serious-rate"
              field="seriousRate"
              label="Serious-inquiry rate"
              description="The share your firm would genuinely want to work."
              value={result.seriousRate}
              min={1}
              max={80}
              step={1}
              unit="%"
              featured
              onChange={update}
            />

            <details className={styles.details}>
              <summary>
                Refine the staff-time estimate <span aria-hidden="true">+</span>
              </summary>
              <div className={styles.detailsBody}>
                <InputRow
                  id="average-minutes"
                  field="averageMinutes"
                  label="Minutes per non-serious call"
                  description="Include notes and follow-up."
                  value={result.averageMinutes}
                  min={1}
                  max={45}
                  step={1}
                  unit="min"
                  onChange={update}
                />
                <InputRow
                  id="hourly-cost"
                  field="hourlyCost"
                  label="Loaded paralegal cost"
                  description="Hourly wage plus payroll burden."
                  value={result.hourlyCost}
                  min={15}
                  max={100}
                  step={1}
                  prefix="$"
                  unit="/hr"
                  onChange={update}
                />
              </div>
            </details>
          </div>
        </form>

        <aside className={styles.resultsPanel} aria-live="polite" aria-atomic="true">
          <div className={styles.resultHeading}>
            <p className={styles.overline}>Your monthly intake leak</p>
            <span className={styles.livePill}><i aria-hidden="true" /> Live estimate</span>
          </div>

          <div className={styles.primaryResult}>
            <span className={styles.currencyMark}>$</span>
            <strong data-testid="monthly-leak">{integer.format(result.monthlyLeak)}</strong>
            <span className={styles.cadence}>/ month</span>
          </div>
          <p className={styles.resultDefinition}>
            Ad spend tied to non-serious calls, plus the staff time used to handle them.
          </p>

          <div className={styles.resultGrid}>
            <div className={styles.metric}>
              <span>LSA spend on non-serious calls</span>
              <strong>{currency.format(result.nonSeriousAdSpend)}</strong>
            </div>
            <div className={styles.metric}>
              <span>Paralegal time absorbed</span>
              <strong>{oneDecimal.format(result.staffHours)} hrs</strong>
            </div>
            <div className={styles.metric}>
              <span>Non-serious calls</span>
              <strong>{integer.format(result.nonSeriousCalls)}</strong>
            </div>
            <div className={styles.metric}>
              <span>Cost per serious inquiry</span>
              <strong>
                {result.costPerSeriousInquiry === null
                  ? "No serious inquiries"
                  : currency.format(result.costPerSeriousInquiry)}
              </strong>
            </div>
          </div>

          <div className={styles.annualLine}>
            <span>Annualized operating leak</span>
            <strong>{currency.format(result.annualLeak)}</strong>
          </div>
          <p className={styles.resultNote}>
            {result.callsPerSeriousInquiry === null
              ? "At 0%, the model has no serious inquiries to price."
              : `At this rate, one serious inquiry takes ${oneDecimal.format(result.callsPerSeriousInquiry)} LSA calls.`}
          </p>
        </aside>
      </section>

      <section className={styles.prescription} aria-labelledby="triage-heading">
        <div className={styles.prescriptionHeading}>
          <span className={styles.stepNumber}>02</span>
          <div>
            <p className={styles.overline}>Do not move the leak</p>
            <h2 id="triage-heading">Screen with software.<br />Work the maybes with judgment.</h2>
          </div>
        </div>
        <div className={styles.layers}>
          <article>
            <span>Layer 01</span>
            <h3>Filter the obvious noise</h3>
            <p>
              Use automation for practice-area fit, jurisdiction, conflict checks, timing, and the questions that do
              not require legal judgment.
            </p>
          </article>
          <article>
            <span>Layer 02</span>
            <h3>Give the maybes to a person</h3>
            <p>
              A trained paralegal catches urgency, ambiguity, and the serious caller who does not sound polished on
              the first pass.
            </p>
          </article>
        </div>
        <div className={styles.ctaBand}>
          <div>
            <span>Your leak is now visible.</span>
            <strong>Build the team that closes it.</strong>
          </div>
          <Link href="/paralegals" onClick={trackCta}>
            See Counterbench Paralegal Teams <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
