// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 VREINN SAS
import { describe, expect, it } from "vitest";
import { AS_OF, fixtureKB } from "./__fixtures__/kb";
import { assess, expandJurisdictions, groupByTier, isBaselineReason, matches, tierOf, type EngineKB, type Profile } from "./assess";

const kb: EngineKB = fixtureKB;
const profile = (p: Partial<Profile>): Profile => ({ jurisdictions: [], roles: [], industries: [], use_cases: [], data: [], size: "medium", ...p });
const summary = (r: ReturnType<typeof assess>) => r.templates.map((t) => `${t.id}|${t.bucket}|${t.due}`);

describe("matches: applicability conditions", () => {
  it("treats a missing condition, an empty object, an empty array and empty keys as 'always applies'", () => {
    const p = profile({});
    expect(matches(p, undefined)).toBe(true);
    expect(matches(p, null)).toBe(true);
    expect(matches(p, {})).toBe(true);
    expect(matches(p, [])).toBe(true);
    expect(matches(p, { roles: [], use_cases: [] })).toBe(true);
  });
  it("is OR within a key and AND between keys", () => {
    const p = profile({ roles: ["deployer"], industries: ["financial_services"], use_cases: ["credit_scoring"] });
    expect(matches(p, { roles: ["provider", "deployer"] })).toBe(true);
    expect(matches(p, { roles: ["provider"] })).toBe(false);
    expect(matches(p, { use_cases: ["credit_scoring"], industries: ["financial_services"] })).toBe(true);
    expect(matches(p, { use_cases: ["credit_scoring"], industries: ["healthcare"] })).toBe(false);
  });
  it("is OR between the conditions of an array", () => {
    const p = profile({ use_cases: ["recruitment"] });
    expect(matches(p, [{ use_cases: ["credit_scoring"] }, { use_cases: ["recruitment"] }])).toBe(true);
    expect(matches(p, [{ use_cases: ["credit_scoring"] }, { industries: ["healthcare"] }])).toBe(false);
  });
  it("tests sizes against the single profile size and jurisdictions against the expanded set", () => {
    expect(matches(profile({ size: "small" }), { sizes: ["micro", "small"] })).toBe(true);
    expect(matches(profile({ size: "large" }), { sizes: ["micro", "small"] })).toBe(false);
    expect(matches(profile({ jurisdictions: ["ES"], _juris: ["INTL", "ES", "EU"] }), { jurisdictions: ["EU"] })).toBe(true);
    expect(matches(profile({ jurisdictions: ["ES"] }), { jurisdictions: ["EU"] })).toBe(false);
  });
});

describe("expandJurisdictions", () => {
  it("adds parents and INTL", () => {
    expect([...expandJurisdictions(["ES", "US-CA"], kb.taxonomy)]).toEqual(["INTL", "ES", "EU", "US-CA", "US"]);
    expect([...expandJurisdictions([], kb.taxonomy)]).toEqual(["INTL"]);
    expect([...expandJurisdictions(["JP"], kb.taxonomy)]).toEqual(["INTL", "JP"]);
  });
});

describe("assess on a fixture knowledge base", () => {
  it("applies defaults and an in-force obligation; skips lapsed ones", () => {
    const r = assess({ jurisdictions: ["ES"], size: "small" }, kb, AS_OF);
    expect(r.as_of).toBe(AS_OF);
    expect(r.profile).toMatchObject({ roles: ["deployer"], data: ["personal"], size: "small", industries: [], use_cases: [] });
    expect(r.jurisdictions).toEqual(["INTL", "ES", "EU"]);
    expect(r.obligations.map((o) => o.obligation)).toEqual(["eu_literacy"]);
    expect(summary(r)).toEqual(["ai_literacy_plan|required|null", "ai_use_policy|recommended|null"]);
    const policy = r.templates.find((t) => t.id === "ai_use_policy")!;
    expect(policy.reasons).toHaveLength(2);
    expect(policy.reasons.some((x) => !isBaselineReason(x) && x.supporting && x.bucket === "required")).toBe(true);
    expect(Object.keys(r).sort()).toEqual(["as_of", "jurisdictions", "obligations", "profile", "templates"]);
  });

  it("handles OR-of-AND conditions, future dates, phases and guidance", () => {
    const r = assess(
      { jurisdictions: ["US-CA", "ES"], industries: ["financial_services"], use_cases: ["credit_scoring"], data: ["biometric"] },
      kb,
      AS_OF,
    );
    expect(r.jurisdictions).toEqual(["INTL", "US-CA", "US", "ES", "EU"]);
    expect(summary(r)).toEqual([
      "ai_literacy_plan|required|null",
      "impact_assessment|upcoming|2027-01-01",
      "risk_assessment|upcoming|2027-08-02",
      "ai_use_policy|recommended|null",
      "biometric_notice|recommended|null",
    ]);
    const tiers = groupByTier(r);
    expect(tiers.required.map((t) => t.id)).toEqual(["ai_literacy_plan"]);
    expect(tiers.recommended.map((t) => t.id)).toEqual(["impact_assessment", "risk_assessment", "ai_use_policy"]);
    expect(tiers.nice_to_have.map((t) => t.id)).toEqual(["biometric_notice"]);
  });

  it("falls back from phases to the base condition, and drops the obligation when neither matches", () => {
    expect(summary(assess({ jurisdictions: ["US-CA"], size: "large" }, kb, AS_OF))).toContain("impact_assessment|required|null");
    expect(summary(assess({ jurisdictions: ["US-CA"], size: "small" }, kb, AS_OF)).some((s) => s.startsWith("impact_assessment"))).toBe(false);
    // The 2027 phase becomes "required" once the as-of date passes it.
    expect(summary(assess({ jurisdictions: ["US-CA"] }, kb, "2027-02-01"))).toContain("impact_assessment|required|null");
  });

  it("an empty array condition always applies; bills only reach nice to have", () => {
    const r = assess({ jurisdictions: ["MX"] }, kb, AS_OF);
    expect(summary(r)).toEqual(["ai_use_policy|recommended|null", "transparency_notice|recommended|null"]);
    expect(groupByTier(r).nice_to_have.map((t) => t.id)).toEqual(["ai_use_policy", "transparency_notice"]);
  });

  it("evaluates baseline rules with jurisdiction conditions against the expanded jurisdictions", () => {
    const has = (input: Parameters<typeof assess>[0]) => assess(input, kb, AS_OF).templates.some((t) => t.id === "agent_register");
    expect(has({ jurisdictions: ["ES"], use_cases: ["ai_agents"] })).toBe(true);
    expect(has({ jurisdictions: ["MX"], use_cases: ["ai_agents"] })).toBe(false);
    expect(has({ jurisdictions: ["ES"] })).toBe(false);
  });

  it("defaults the as-of date to today", () => {
    expect(assess({}, kb).as_of).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("ignores extra fields in the knowledge base", () => {
    const extended = { ...kb, extra: [{ id: "x" }] } as EngineKB;
    expect(assess({ jurisdictions: ["ES"] }, extended, AS_OF)).toEqual(assess({ jurisdictions: ["ES"] }, kb, AS_OF));
  });
});

describe("tierOf", () => {
  it("maps engine buckets", () => {
    const base = { id: "x", due: null };
    const ob = (bucket: "required" | "upcoming" | "recommended", supporting = false) => ({
      obligation: "o",
      regulation: "r",
      jurisdiction: "EU",
      citation: "c",
      status: "in_force",
      date: null,
      bucket,
      ...(supporting ? { supporting } : {}),
    });
    expect(tierOf({ ...base, bucket: "required", reasons: [ob("required")] })).toBe("required");
    expect(tierOf({ ...base, bucket: "upcoming", reasons: [ob("upcoming")] })).toBe("recommended");
    expect(tierOf({ ...base, bucket: "recommended", reasons: [ob("required", true)] })).toBe("recommended");
    expect(tierOf({ ...base, bucket: "recommended", reasons: [ob("recommended")] })).toBe("nice_to_have");
    expect(tierOf({ ...base, bucket: "recommended", reasons: [{ baseline: "b", reason: "", bucket: "recommended" }] })).toBe("nice_to_have");
  });
});
