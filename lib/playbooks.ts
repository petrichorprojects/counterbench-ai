import type { Playbook, Tool } from "./schemas";

export type MatterType =
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

export type WorkflowStage =
  | "intake"
  | "draft"
  | "review"
  | "research"
  | "manage"
  | "negotiation"
  | "compliance"
  | "trial_prep";

export type Sensitivity = "low" | "medium" | "high";
export type Budget = "free_only" | "free_or_paid";

export interface TriageAnswers {
  matter: MatterType;
  stage: WorkflowStage;
  sensitivity: Sensitivity;
  budget: Budget;
  platform: "web" | "chrome" | "ios" | "android" | "any";
}

export interface SelectedTool {
  tool: Tool;
  why: string[];
}

export interface PlaybookResult {
  playbook: Playbook;
  answers: TriageAnswers;
  tools: SelectedTool[];
  prompts: Array<{ slug: string; title: string; description: string }>;
  skills: Array<{ slug: string; title: string; description: string }>;
  markdown: string;
}

function containsAny(hay: string, needles: string[]): boolean {
  const h = hay.toLowerCase();
  for (const n of needles) {
    if (!n.trim()) continue;
    if (h.includes(n.toLowerCase())) return true;
  }
  return false;
}

function uniqBySlug(items: SelectedTool[]): SelectedTool[] {
  const seen = new Set<string>();
  const out: SelectedTool[] = [];
  for (const it of items) {
    if (seen.has(it.tool.slug)) continue;
    seen.add(it.tool.slug);
    out.push(it);
  }
  return out;
}

export function defaultAnswers(): TriageAnswers {
  return { matter: "contracts", stage: "review", sensitivity: "medium", budget: "free_or_paid", platform: "any" };
}

export function coerceAnswers(sp: Record<string, string | string[] | undefined>): TriageAnswers {
  const get = (k: string): string => {
    const v = sp[k];
    return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
  };
  const base = defaultAnswers();
  const matter = (get("matter") || base.matter) as MatterType;
  const stage = (get("stage") || base.stage) as WorkflowStage;
  const sensitivity = (get("sens") || base.sensitivity) as Sensitivity;
  const budget = (get("budget") || base.budget) as Budget;
  const platform = (get("platform") || base.platform) as TriageAnswers["platform"];

  const allowedMatter: MatterType[] = ["contracts", "litigation", "employment", "ip", "privacy", "ediscovery", "corporate", "real_estate", "research", "general"];
  const allowedStage: WorkflowStage[] = ["intake", "draft", "review", "research", "manage", "negotiation", "compliance", "trial_prep"];
  const allowedSens: Sensitivity[] = ["low", "medium", "high"];
  const allowedBudget: Budget[] = ["free_only", "free_or_paid"];
  const allowedPlatform: TriageAnswers["platform"][] = ["web", "chrome", "ios", "android", "any"];

  return {
    matter: allowedMatter.includes(matter) ? matter : base.matter,
    stage: allowedStage.includes(stage) ? stage : base.stage,
    sensitivity: allowedSens.includes(sensitivity) ? sensitivity : base.sensitivity,
    budget: allowedBudget.includes(budget) ? budget : base.budget,
    platform: allowedPlatform.includes(platform) ? platform : base.platform
  };
}

export function selectPlaybook(playbooks: Playbook[], answers: TriageAnswers): Playbook {
  if (playbooks.length === 0) {
    throw new Error("No playbooks available.");
  }
  // Score by condition matches. If multiple match, prefer more specific templates (more conditions).
  const scored = playbooks.map((p) => {
    let score = 0;
    const cond = p.conditions ?? { matter_types: [], stages: [], sensitivity: [] };

    const matterOk = cond.matter_types.length === 0 || cond.matter_types.includes(answers.matter);
    const stageOk = cond.stages.length === 0 || cond.stages.includes(answers.stage);
    const sensOk = cond.sensitivity.length === 0 || cond.sensitivity.includes(answers.sensitivity);

    if (matterOk) score += 5;
    if (stageOk) score += 3;
    if (sensOk) score += 1;

    const specificity = (cond.matter_types.length ? 1 : 0) + (cond.stages.length ? 1 : 0) + (cond.sensitivity.length ? 1 : 0);
    score += specificity;

    return { p, score };
  });

  scored.sort((a, b) => b.score - a.score || (a.p.order ?? 0) - (b.p.order ?? 0));
  return (scored[0]?.p ?? playbooks[0]) as Playbook;
}

function toolMatchesConstraints(t: Tool, a: TriageAnswers): boolean {
  if (a.budget === "free_only" && t.pricing !== "free") return false;
  if (a.platform !== "any" && !t.platform.some((p) => p.toLowerCase() === a.platform)) return false;
  return true;
}

function buildToolWhy(tool: Tool, playbookTitle: string, extra: string[] = []): string[] {
  const why = extra.length ? extra : [];
  if (why.length) return why;
  // Fallback to a single sentence “why” that doesn’t overclaim.
  return [`Commonly used in the "${playbookTitle}" workflow.`];
}

export function pickToolsForPlaybook(playbook: Playbook, answers: TriageAnswers, tools: Tool[]): SelectedTool[] {
  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  const selected: SelectedTool[] = [];

  // 1) Curated tools first.
  for (const r of playbook.recommended_tools ?? []) {
    const t = bySlug.get(r.tool_slug);
    if (!t) continue;
    if (!toolMatchesConstraints(t, answers)) continue;
    selected.push({ tool: t, why: buildToolWhy(t, playbook.title, r.why ?? []) });
  }

  // 2) Rule-based fill.
  const remainingPool = tools.filter((t) => toolMatchesConstraints(t, answers));
  for (const rule of playbook.tool_rules ?? []) {
    const ruleLimit = rule.limit ?? 6;
    if (ruleLimit <= 0) continue;

    let added = 0;
    const candidates = remainingPool.filter((t) => {
      const catHay = t.categories.join(" ");
      const tagHay = t.tags.join(" ");
      const matchCats = rule.include_categories?.length ? containsAny(catHay, rule.include_categories) : true;
      const matchTags = rule.include_tags?.length ? containsAny(tagHay, rule.include_tags) : true;
      return matchCats && matchTags;
    });

    for (const c of candidates) {
      if (selected.length >= 9) break;
      if (selected.filter((x) => x.tool.slug === c.slug).length) continue;
      selected.push({ tool: c, why: buildToolWhy(c, playbook.title) });
      added += 1;
      if (added >= ruleLimit) break;
    }
  }

  // 3) Final cap and ensure uniqueness.
  return uniqBySlug(selected).slice(0, 9);
}

export function buildPlaybookMarkdown(r: Omit<PlaybookResult, "markdown">): string {
  const lines: string[] = [];
  lines.push(`# ${r.playbook.title}`);
  lines.push("");
  lines.push(r.playbook.description);
  lines.push("");
  lines.push(`**Matter:** ${r.answers.matter}`);
  lines.push(`**Stage:** ${r.answers.stage}`);
  lines.push(`**Sensitivity:** ${r.answers.sensitivity}`);
  lines.push(`**Budget:** ${r.answers.budget}`);
  lines.push(`**Platform:** ${r.answers.platform}`);
  lines.push("");

  if (r.tools.length) {
    lines.push("## Recommended Tools");
    lines.push("");
    for (const t of r.tools) {
      lines.push(`- **${t.tool.name}** (${t.tool.pricing}, ${t.tool.platform.join(", ")})`);
      lines.push(`  - ${t.tool.url}`);
      for (const w of t.why.slice(0, 3)) lines.push(`  - ${w}`);
    }
    lines.push("");
  }

  if (r.playbook.checklist?.length) {
    lines.push("## Checklist");
    lines.push("");
    for (const c of r.playbook.checklist) lines.push(`- [ ] ${c}`);
    lines.push("");
  }

  if (r.playbook.risk_notes?.length) {
    lines.push("## Risk Notes");
    lines.push("");
    for (const n of r.playbook.risk_notes) lines.push(`- ${n}`);
    lines.push("");
  }

  return lines.join("\n");
}
