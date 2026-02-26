"use client";

import { useMemo, useState } from "react";

type Matter =
  | "contracts"
  | "litigation"
  | "employment"
  | "ip"
  | "privacy"
  | "ediscovery"
  | "corporate"
  | "real_estate"
  | "research"
  | "general";

type Stage = "intake" | "draft" | "review" | "research" | "manage" | "negotiation" | "compliance" | "trial_prep";
type Sens = "low" | "medium" | "high";
type Budget = "free_only" | "free_or_paid";
type Platform = "any" | "web" | "chrome" | "ios" | "android";

function RadioGroup({
  name,
  label,
  value,
  options,
  onChange
}: {
  name: string;
  label: string;
  value: string;
  options: Array<{ value: string; title: string; desc: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
      <legend className="label" style={{ marginBottom: 10 }}>
        {label}
      </legend>
      <div style={{ display: "grid", gap: 10 }}>
        {options.map((o) => (
          <label
            key={o.value}
            style={{
              display: "grid",
              gridTemplateColumns: "18px 1fr",
              gap: 12,
              alignItems: "start",
              padding: "12px 12px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: value === o.value ? "var(--nav-active-bg)" : "var(--input-bg)",
              cursor: "pointer"
            }}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={(e) => onChange(e.target.value)}
              style={{ marginTop: 2 }}
            />
            <span>
              <span className="text-white" style={{ fontSize: "0.95rem", fontWeight: 650 }}>
                {o.title}
              </span>
              <span className="text-muted" style={{ display: "block", marginTop: 4, fontSize: "0.875rem", lineHeight: 1.45 }}>
                {o.desc}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function TriageWizard() {
  const [step, setStep] = useState(1);

  const [matter, setMatter] = useState<Matter>("contracts");
  const [stage, setStage] = useState<Stage>("review");
  const [sens, setSens] = useState<Sens>("medium");
  const [budget, setBudget] = useState<Budget>("free_or_paid");
  const [platform, setPlatform] = useState<Platform>("any");

  const canNext = true;
  const progress = useMemo(() => Math.round((step / 3) * 100), [step]);

  function toPlaybookSlug(): string {
    // Deterministic mapping (v1). Server will still validate and can pick a better match.
    if (stage === "intake") return "intake-triage-quickstart";
    if (matter === "contracts") return "contract-review-quickstart";
    if (matter === "privacy") return "privacy-compliance-audit";
    if (matter === "ediscovery") return "ediscovery-doc-review";
    if (matter === "litigation") return "litigation-trial-prep";
    if (matter === "ip") return "ip-patent-drafting";
    if (matter === "employment") return "employment-handbook-policies";
    if (matter === "research") return "legal-research-brief";
    if (matter === "corporate") return "firm-ops-automation";
    return "general-legal-ai-starter";
  }

  function goNext() {
    setStep((s) => Math.min(3, s + 1));
  }
  function goBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <div>
      <div className="card" style={{ padding: "1rem 1.25rem", borderRadius: 12, marginBottom: "1rem" }}>
        <div className="flex flex--between flex--center" style={{ gap: 12 }}>
          <div className="text-muted" style={{ fontSize: "0.875rem" }}>
            Step {step} of 3
          </div>
          <div className="text-muted" style={{ fontSize: "0.875rem" }}>
            {progress}%
          </div>
        </div>
        <div style={{ height: 6, background: "var(--progress-track)", borderRadius: 999, marginTop: 10, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "var(--progress-fill)" }} />
        </div>
      </div>

      {step === 1 && (
        <RadioGroup
          name="matter"
          label="Matter type"
          value={matter}
          onChange={(v) => setMatter(v as Matter)}
          options={[
            { value: "contracts", title: "Contracts", desc: "Review, drafting, and negotiation support." },
            { value: "privacy", title: "Privacy + Compliance", desc: "Policies, audits, and governance workflows." },
            { value: "research", title: "Legal research", desc: "Find authorities and draft cite-checkable notes." },
            { value: "litigation", title: "Litigation", desc: "Evidence mapping, case file building, trial prep." },
            { value: "ediscovery", title: "eDiscovery", desc: "Document review, prioritization, defensible notes." },
            { value: "ip", title: "IP + Patents", desc: "Prior art, claims drafting, internal review memos." },
            { value: "employment", title: "Employment", desc: "Handbooks and policy drafting/updates." },
            { value: "corporate", title: "Corporate / Ops", desc: "Repeatable workflows and automation." },
            { value: "general", title: "General", desc: "A safe default playbook." }
          ]}
        />
      )}

      {step === 2 && (
        <RadioGroup
          name="stage"
          label="Workflow stage"
          value={stage}
          onChange={(v) => setStage(v as Stage)}
          options={[
            { value: "intake", title: "Intake / Triage", desc: "Turn messy facts into a clean matter summary." },
            { value: "draft", title: "Draft", desc: "Generate first passes and templates." },
            { value: "review", title: "Review", desc: "Analyze documents and produce defensible notes." },
            { value: "research", title: "Research", desc: "Plan, search, extract authorities, cite-check." },
            { value: "negotiation", title: "Negotiation", desc: "Fallback positions and redline strategy." },
            { value: "compliance", title: "Compliance", desc: "Map obligations and close gaps." },
            { value: "trial_prep", title: "Trial prep", desc: "Issues, evidence map, witness outline." },
            { value: "manage", title: "File management", desc: "Organize, route, and keep an audit trail." }
          ]}
        />
      )}

      {step === 3 && (
        <div className="grid grid--2 grid--gap-2" style={{ gap: "1rem" }}>
          <RadioGroup
            name="sens"
            label="Sensitivity"
            value={sens}
            onChange={(v) => setSens(v as Sens)}
            options={[
              { value: "low", title: "Low", desc: "Public or non-sensitive material." },
              { value: "medium", title: "Medium", desc: "Internal docs without privileged content." },
              { value: "high", title: "High", desc: "Client data, privileged info, or regulated material." }
            ]}
          />
          <div style={{ display: "grid", gap: "1rem" }}>
            <RadioGroup
              name="budget"
              label="Budget"
              value={budget}
              onChange={(v) => setBudget(v as Budget)}
              options={[
                { value: "free_or_paid", title: "Free or paid", desc: "Show the best fit." },
                { value: "free_only", title: "Free only", desc: "Only free options." }
              ]}
            />
            <RadioGroup
              name="platform"
              label="Platform"
              value={platform}
              onChange={(v) => setPlatform(v as Platform)}
              options={[
                { value: "any", title: "Any", desc: "No platform constraints." },
                { value: "web", title: "Web", desc: "Browser-based tools." },
                { value: "chrome", title: "Chrome", desc: "Extensions and web tooling." },
                { value: "ios", title: "iOS", desc: "Mobile-first tools." },
                { value: "android", title: "Android", desc: "Mobile-first tools." }
              ]}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex--between flex--center flex--gap-2 flex--resp-col">
        <div className="flex flex--gap-2">
          <button className="btn btn--secondary btn--sm" type="button" onClick={goBack} disabled={step === 1}>
            Back
          </button>
          {step < 3 && (
            <button className="btn btn--primary btn--sm" type="button" onClick={goNext} disabled={!canNext}>
              Next
            </button>
          )}
        </div>

        {step === 3 && (
          <a
            className="btn btn--primary btn--arrow"
            href={`/playbooks/${toPlaybookSlug()}?matter=${encodeURIComponent(matter)}&stage=${encodeURIComponent(stage)}&sens=${encodeURIComponent(
              sens
            )}&budget=${encodeURIComponent(budget)}&platform=${encodeURIComponent(platform)}&from=triage`}
          >
            Generate playbook
          </a>
        )}
      </div>

      <p className="mt-4 text-muted" style={{ fontSize: "0.875rem" }}>
        Don’t include confidential details. This generator produces workflow suggestions and drafts, not legal advice.
      </p>
    </div>
  );
}

