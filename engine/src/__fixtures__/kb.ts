// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 VREINN SAS

// A tiny, made-up knowledge base for the engine tests. Ids and rules are made up:
// they only exercise the engine's logic (AND/OR conditions, phases, statuses, baseline rules, parents).
import type { GuidedKB } from "../guided";

export const AS_OF = "2026-06-01";

export const fixtureKB: GuidedKB = {
  taxonomy: {
    jurisdictions: [
      { id: "INTL", parent: null },
      { id: "EU", parent: null },
      { id: "ES", parent: "EU", selectable: true },
      { id: "US", parent: null, selectable: true },
      { id: "US-CA", parent: "US", selectable: true },
      { id: "MX", parent: null, selectable: true },
    ],
  },
  regulations: [
    {
      id: "eu_ai_rules",
      jurisdiction: "EU",
      status: "in_force",
      obligations: [
        {
          // AND within one condition: any listed role.
          id: "eu_literacy",
          citation: "Art. 4",
          status: "in_force",
          applies_from: "2025-02-02",
          applies_when: { roles: ["deployer", "provider"] },
          templates: { required: ["ai_literacy_plan"], supporting: ["ai_use_policy"] },
          title: { en: "AI literacy" },
        },
        {
          // OR between conditions; the second one is an AND of use case and industry.
          id: "eu_high_risk",
          citation: "Art. 26",
          status: "in_force",
          applies_from: "2027-08-02",
          applies_when: [{ use_cases: ["recruitment"] }, { use_cases: ["credit_scoring"], industries: ["financial_services"] }],
          templates: { required: ["risk_assessment"], supporting: [] },
        },
        {
          id: "eu_repealed",
          citation: "Art. 99",
          status: "lapsed",
          applies_from: null,
          applies_when: {},
          templates: { required: ["obsolete_form"], supporting: [] },
        },
      ],
    },
    {
      id: "eu_biometrics_guidance",
      jurisdiction: "EU",
      status: "guidance",
      obligations: [
        {
          id: "eu_bio_guidance",
          citation: "Guidance 1/2025",
          status: "guidance",
          applies_from: null,
          applies_when: { data: ["biometric"] },
          templates: { required: ["biometric_notice"], supporting: [] },
        },
      ],
    },
    {
      id: "us_ca_ai_law",
      jurisdiction: "US-CA",
      status: "in_force",
      obligations: [
        {
          // Large organizations from 2026-01-01; medium ones only from the 2027 phase.
          id: "ca_impact",
          citation: "Sec. 10",
          status: "in_force",
          applies_from: "2026-01-01",
          applies_when: { sizes: ["large"] },
          phases: [{ date: "2027-01-01", applies_when: { sizes: ["medium"] } }],
          templates: { required: ["impact_assessment"], supporting: ["ai_use_policy"] },
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
  baseline: [
    { id: "bl_policy", templates: { recommended: ["ai_use_policy"] }, reason: "Every organization benefits from a usage policy." },
    {
      id: "bl_eu_agents",
      applies_when: { jurisdictions: ["EU"], use_cases: ["ai_agents"] },
      templates: { recommended: ["agent_register"] },
      reason: "Agents acting in systems should be listed.",
    },
  ],
};

export const VALID = {
  roles: new Set(["deployer", "provider", "public_supplier"]),
  sizes: new Set(["micro", "small", "medium", "large"]),
  industries: new Set(["professional_services", "financial_services", "public_sector"]),
  useCases: new Set(["recruitment", "credit_scoring", "customer_chatbot", "public_benefits", "genai_internal", "ai_agents", "model_training"]),
  data: new Set(["personal", "financial", "biometric"]),
};
