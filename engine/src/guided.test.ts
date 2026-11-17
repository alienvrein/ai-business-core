// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 GROU LLC
import { describe, expect, it } from "vitest";
import { AS_OF, fixtureKB } from "./__fixtures__/kb";
import { OTHER_COUNTRY, type CompanyProfile } from "./profile";
import { EMPTY_ANSWERS, STEPS, firstInvalidStep, normalizeAnswers, primaryReason, reasonKey, reasonLines, regionParentMap, runGuidedPath, stepError, validateAnswers } from "./guided";
import type { Reason } from "./assess";

describe("guided path: pieces", () => {
  it("validates answers step by step", () => {
    expect(validateAnswers(EMPTY_ANSWERS)).toBe("needSize");
    expect(validateAnswers({ ...EMPTY_ANSWERS, roles: [] })).toBe("needRole");
    expect(validateAnswers({ ...EMPTY_ANSWERS, size: "small" })).toBe("needHq");
    expect(validateAnswers({ ...EMPTY_ANSWERS, size: "small", hq: OTHER_COUNTRY })).toBe("needMarket");
    expect(validateAnswers({ ...EMPTY_ANSWERS, size: "small", hq: "MX" })).toBe("needProfile");
    expect(validateAnswers({ ...EMPTY_ANSWERS, size: "small", hq: "MX", profiles: ["P1"] })).toBeNull();
    expect(firstInvalidStep(EMPTY_ANSWERS)).toBe(0);
    expect(firstInvalidStep({ ...EMPTY_ANSWERS, size: "small", hq: "MX", profiles: ["P1"] })).toBe(-1);
    expect(stepError("industries", EMPTY_ANSWERS)).toBeNull();
    expect(STEPS).toHaveLength(7);
  });

  it("normalizes: HQ first, parents of regions appended, idempotent", () => {
    const rp = regionParentMap(fixtureKB.taxonomy);
    expect(rp.get("US-CA")).toBe("US");
    expect(rp.has("ES")).toBe(false); // ES is selectable but EU is not
    const n = normalizeAnswers({ ...EMPTY_ANSWERS, hq: "MX", markets: ["US-CA"] }, rp);
    expect(n.markets).toEqual(["MX", "US-CA", "US"]);
    expect(normalizeAnswers(n, rp)).toEqual(n);
  });

  it("accepts non-normalized answers (same result as normalized)", () => {
    const raw = { ...EMPTY_ANSWERS, size: "small", hq: "MX", markets: ["US-CA"], profiles: ["P1"] } as CompanyProfile;
    const a = runGuidedPath(raw, fixtureKB, AS_OF);
    const b = runGuidedPath(a.answers, fixtureKB, AS_OF);
    expect(b.result).toEqual(a.result);
    expect(a.answers.markets).toEqual(["MX", "US-CA", "US"]);
  });

  it("returns tiers, level and uncovered countries, and nothing else", () => {
    const o = runGuidedPath({ ...EMPTY_ANSWERS, size: "medium", hq: "ES", markets: ["JP", "US-CA"], profiles: ["P1", "P5"] }, fixtureKB, AS_OF);
    expect(Object.keys(o).sort()).toEqual(["answers", "input", "level", "result", "tiers", "uncovered"]);
    expect(o.answers.markets).toEqual(["ES", "JP", "US-CA", "US"]);
    expect(o.input.jurisdictions).toEqual(["ES", "EU", "US-CA", "US"]);
    expect(o.uncovered).toEqual(["JP"]);
    expect(o.level).toEqual({ level: "reinforced", reason: "advanced_profile" });
    expect(o.tiers.required.map((t) => t.id)).toEqual(["ai_literacy_plan"]);
    expect(o.tiers.recommended.map((t) => t.id)).toEqual(["impact_assessment", "ai_use_policy"]);
    expect(o.tiers.nice_to_have.map((t) => t.id)).toEqual(["agent_register"]);
  });
});

describe("guided path: reasons of one document", () => {
  const ob = (obligation: string, bucket: "required" | "upcoming" | "recommended", supporting = false): Reason => ({
    obligation,
    regulation: "r",
    jurisdiction: "EU",
    citation: "c",
    status: "in_force",
    date: null,
    bucket,
    ...(supporting ? { supporting } : {}),
  });
  const bl = (baseline: string): Reason => ({ baseline, reason: `why ${baseline}`, bucket: "recommended" });

  it("de-duplicates and orders: relates, support, soft, practice", () => {
    const lines = reasonLines([bl("b1"), ob("o3", "recommended"), ob("o2", "required", true), ob("o1", "required"), ob("o1", "required"), bl("b1")]);
    expect(lines.map(reasonKey)).toEqual(["relates:o1", "support:o2", "soft:o3", "p:b1"]);
    expect(lines[3]).toEqual({ kind: "practice", text: "why b1", key: "b1" });
  });

  it("picks the primary reason per tier", () => {
    const lines = reasonLines([ob("up", "upcoming"), ob("now", "required"), ob("sup", "required", true), bl("b")]);
    expect(reasonKey(primaryReason(lines, "required")!)).toBe("relates:now");
    expect(reasonKey(primaryReason(lines, "recommended")!)).toBe("relates:up");
    expect(reasonKey(primaryReason(lines, "nice_to_have")!)).toBe("p:b");
    expect(reasonKey(primaryReason(reasonLines([ob("sup", "required", true)]), "recommended")!)).toBe("support:sup");
    expect(reasonKey(primaryReason(reasonLines([ob("g", "recommended")]), "nice_to_have")!)).toBe("soft:g");
    expect(primaryReason([], "nice_to_have")).toBeNull();
  });
});
