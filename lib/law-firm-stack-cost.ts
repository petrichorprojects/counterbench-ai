export type StackOwnerRole =
  | "managing-attorney"
  | "attorney"
  | "paralegal"
  | "operations"
  | "external";

export type StackVerdictKey = "keep" | "simplify" | "hand-off" | "replace-weak-link";

export interface StackCostInputs {
  monthlySoftwareCost: number;
  setupHours: number;
  monthlyMaintenanceHours: number;
  ownerRole: StackOwnerRole;
  ownerHourlyValue: number;
  disruptionsPerQuarter: number;
  hoursLostPerDisruption: number;
}

export interface StackVerdict {
  key: StackVerdictKey;
  title: string;
  summary: string;
  actions: string[];
}

export interface StackCostResult {
  annualLicenseCost: number;
  setupLaborCost: number;
  annualMaintenanceHours: number;
  annualMaintenanceCost: number;
  annualDowntimeHours: number;
  annualDowntimeCost: number;
  firstYearOperatorHours: number;
  recurringOperatorHours: number;
  hiddenLaborCost: number;
  firstYearCost: number;
  recurringAnnualCost: number;
  threeYearCost: number;
  hiddenLaborShare: number;
  recurringLaborShare: number;
  dominantCostDriver: "software" | "setup" | "maintenance" | "disruption";
  verdict: StackVerdict;
}

const ATTORNEY_ROLES: StackOwnerRole[] = ["managing-attorney", "attorney"];

function finiteNonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function dominantDriver(values: Record<StackCostResult["dominantCostDriver"], number>) {
  return (Object.entries(values) as Array<[StackCostResult["dominantCostDriver"], number]>).reduce(
    (largest, current) => (current[1] > largest[1] ? current : largest),
  )[0];
}

function verdictFor(params: {
  inputs: StackCostInputs;
  annualLicenseCost: number;
  annualDowntimeCost: number;
  annualDowntimeHours: number;
  recurringOperatorHours: number;
  recurringLaborShare: number;
}): StackVerdict {
  const {
    inputs,
    annualLicenseCost,
    annualDowntimeCost,
    annualDowntimeHours,
    recurringOperatorHours,
    recurringLaborShare,
  } = params;

  const disruptionsAreMaterial =
    inputs.disruptionsPerQuarter >= 3 &&
    (annualDowntimeHours >= 48 || annualDowntimeCost >= annualLicenseCost * 0.25);

  if (disruptionsAreMaterial) {
    return {
      key: "replace-weak-link",
      title: "Replace the weak link",
      summary:
        "Disruptions now cost enough time to justify replacing the system or connection that causes them. Identify that failure point before replacing the whole stack.",
      actions: [
        "Name the system or connection behind the last three disruptions",
        "Set a maximum acceptable outage cost before the next renewal",
        "Compare one replacement against the cost of another year of disruption",
      ],
    };
  }

  const attorneyOwnsStack = ATTORNEY_ROLES.includes(inputs.ownerRole);
  if (attorneyOwnsStack && recurringOperatorHours >= 60) {
    return {
      key: "hand-off",
      title: "Hand off the operation",
      summary:
        "The stack may be worth keeping, but an attorney is spending too much time running it. Move routine ownership before changing the software.",
      actions: [
        "Assign one operational owner and one backup",
        "Document maintenance, access, and failure-recovery steps",
        "Keep attorney involvement for approvals and exceptions",
      ],
    };
  }

  if (recurringOperatorHours >= 120 || recurringLaborShare >= 0.5) {
    return {
      key: "simplify",
      title: "Simplify the stack",
      summary:
        "Labor now drives at least as much cost as the software. Remove duplicate tools and the manual connections that require the most upkeep.",
      actions: [
        "Rank every tool by use, cost, and maintenance time",
        "Remove the lowest-value duplicate before adding another tool",
        "Replace the most manual connection with a supported integration",
      ],
    };
  }

  return {
    key: "keep",
    title: "Keep the stack",
    summary:
      "The visible software cost still accounts for most of the total, and your firm has kept the recurring operator load low. Protect that advantage with clear ownership.",
    actions: [
      "Keep a current list of tools, owners, and renewal dates",
      "Review maintenance time once per quarter",
      "Set a disruption threshold that triggers a replacement review",
    ],
  };
}

export function calculateStackCost(raw: StackCostInputs): StackCostResult {
  const inputs: StackCostInputs = {
    monthlySoftwareCost: finiteNonNegative(raw.monthlySoftwareCost),
    setupHours: finiteNonNegative(raw.setupHours),
    monthlyMaintenanceHours: finiteNonNegative(raw.monthlyMaintenanceHours),
    ownerRole: raw.ownerRole,
    ownerHourlyValue: finiteNonNegative(raw.ownerHourlyValue),
    disruptionsPerQuarter: finiteNonNegative(raw.disruptionsPerQuarter),
    hoursLostPerDisruption: finiteNonNegative(raw.hoursLostPerDisruption),
  };

  const annualLicenseCost = inputs.monthlySoftwareCost * 12;
  const setupLaborCost = inputs.setupHours * inputs.ownerHourlyValue;
  const annualMaintenanceHours = inputs.monthlyMaintenanceHours * 12;
  const annualMaintenanceCost = annualMaintenanceHours * inputs.ownerHourlyValue;
  const annualDowntimeHours = inputs.disruptionsPerQuarter * 4 * inputs.hoursLostPerDisruption;
  const annualDowntimeCost = annualDowntimeHours * inputs.ownerHourlyValue;
  const recurringOperatorHours = annualMaintenanceHours + annualDowntimeHours;
  const firstYearOperatorHours = inputs.setupHours + recurringOperatorHours;
  const hiddenLaborCost = setupLaborCost + annualMaintenanceCost + annualDowntimeCost;
  const recurringAnnualCost = annualLicenseCost + annualMaintenanceCost + annualDowntimeCost;
  const firstYearCost = recurringAnnualCost + setupLaborCost;
  const threeYearCost = firstYearCost + recurringAnnualCost * 2;
  const hiddenLaborShare = firstYearCost > 0 ? hiddenLaborCost / firstYearCost : 0;
  const recurringLaborCost = annualMaintenanceCost + annualDowntimeCost;
  const recurringLaborShare = recurringAnnualCost > 0 ? recurringLaborCost / recurringAnnualCost : 0;
  const dominantCostDriver = dominantDriver({
    software: annualLicenseCost,
    setup: setupLaborCost,
    maintenance: annualMaintenanceCost,
    disruption: annualDowntimeCost,
  });

  const verdict = verdictFor({
    inputs,
    annualLicenseCost,
    annualDowntimeCost,
    annualDowntimeHours,
    recurringOperatorHours,
    recurringLaborShare,
  });

  return {
    annualLicenseCost,
    setupLaborCost,
    annualMaintenanceHours,
    annualMaintenanceCost,
    annualDowntimeHours,
    annualDowntimeCost,
    firstYearOperatorHours,
    recurringOperatorHours,
    hiddenLaborCost,
    firstYearCost,
    recurringAnnualCost,
    threeYearCost,
    hiddenLaborShare,
    recurringLaborShare,
    dominantCostDriver,
    verdict,
  };
}

export const STACK_COST_FAQ = [
  {
    q: "What counts as law firm technology stack cost?",
    a: "The calculator includes software licenses, build and migration time, ongoing maintenance, and time lost when systems or connections fail.",
  },
  {
    q: "How should I value attorney or staff time?",
    a: "Use a loaded hourly employment cost for a conservative estimate, or the value of time redirected from billable work to measure opportunity cost.",
  },
  {
    q: "Does a high result mean the firm should replace its software?",
    a: "No. A high result may mean the stack needs simpler connections or a different operational owner. The calculator separates software, maintenance, setup, and disruption costs so the firm can address the real driver.",
  },
  {
    q: "Does this calculator require client or matter data?",
    a: "No. It uses only firm-level cost and time estimates. Do not enter client names, matter details, or confidential information.",
  },
];
