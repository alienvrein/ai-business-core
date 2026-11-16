// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 VREINN SAS

// Minimal, runnable example of the AI Business Core rules engine.
// Run it from engine/ with: npm run example
//
// The knowledge base below is made up: every regulation, obligation, citation and document id is
// invented for this example and does not describe any real rule. Replace it with your own data.
//
// In your own project, import from "@vreinn/aibc-engine" instead of the relative path.
import { assess, groupByTier, isBaselineReason, runGuidedPath, validateAnswers, EMPTY_ANSWERS, type CompanyProfile, type GuidedKB, type Reason } from "../engine/src/index";

const kb: GuidedKB = {
  taxonomy: {
    jurisdictions: [
      { id: "INTL", parent: null },
      { id: "EU", parent: null },
      { id: "ES", parent: "EU", selectable: true },
      { id: "MX", parent: null, selectable: true },
    ],
  },
  regulations: [
    {
      id: "eu_ai_act",
      jurisdiction: "EU",
      status: "in_force",
      obligations: [
        {
          id: "eu_ai_literacy",
          citation: "Art. 4",
          status: "in_force",
          applies_from: "2025-02-02",
          applies_when: { roles: ["deployer", "provider"] },
          templates: { required: ["ai_literacy_plan"], supporting: ["ai_use_policy"] },
          title: { en: "AI literacy (example)" },
        },
        {
          id: "eu_high_risk",
          citation: "Art. 26",
          status: "in_force",
          applies_from: "2027-08-02",
          applies_when: [{ use_cases: ["recruitment"] }, { use_cases: ["credit_scoring"], industries: ["financial_services"] }],
          templates: { required: ["risk_assessment"], supporting: [] },
        },
      ],
    },
    {
      id: "mx_bill",
      jurisdiction: "MX",
      status: "bill",
      obligations: [
        {
          id: "mx_transparency_bill",
          citation: "Art. 5",
          status: "bill",
          applies_from: null,
          applies_when: [],
          templates: { required: ["transparency_notice"], supporting: [] },
        },
      ],
    },
  ],
  baseline: [{ id: "bl_policy", templates: { recommended: ["ai_use_policy"] }, reason: "A usage policy is good practice." }],
};

const AS_OF = "2026-06-01";
const describe = (r: Reason): string => (isBaselineReason(r) ? `baseline rule ${r.baseline}` : `${r.regulation} ${r.citation} (${r.status})`);

// 1. Low level: describe the organization directly in engine terms.
const result = assess({ jurisdictions: ["ES"], roles: ["deployer"], use_cases: ["recruitment"], size: "small" }, kb, AS_OF);
console.log(`assess() as of ${result.as_of}`);
console.log(`  jurisdictions considered: ${result.jurisdictions.join(", ")}`);
for (const t of result.templates) {
  console.log(`  ${t.bucket.padEnd(11)} ${t.id}${t.due ? ` (from ${t.due})` : ""} <- ${t.reasons.map(describe).join("; ")}`);
}
const tiers = groupByTier(result);
console.log("groupByTier():", Object.fromEntries(Object.entries(tiers).map(([k, v]) => [k, v.map((t) => t.id)])));

// 2. High level: questionnaire answers through the guided path.
const answers: CompanyProfile = { ...EMPTY_ANSWERS, size: "small", hq: "ES", markets: ["ES", "MX", "CO"], profiles: ["P1"] };
const error = validateAnswers(answers);
if (error) throw new Error(`Invalid answers: ${error}`);
const outcome = runGuidedPath(answers, kb, AS_OF);
console.log("\nrunGuidedPath()");
console.log(`  suggested level: ${outcome.level.level} (${outcome.level.reason})`);
console.log(`  countries without rules in this knowledge base: ${outcome.uncovered.join(", ") || "none"}`);
for (const [tier, items] of Object.entries(outcome.tiers)) console.log(`  ${tier.padEnd(12)} ${items.map((t) => t.id).join(", ") || "-"}`);

console.log("\nReference output based on the answers given; not legal advice.");
