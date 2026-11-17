// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 GROU LLC
import { describe, expect, it } from "vitest";
import { AS_OF, VALID, fixtureKB } from "./__fixtures__/kb";
import {
  assess,
  COUNTRY_REGIONS,
  decodeMarkets,
  encodeMarkets,
  engineInput,
  engineJurisdictions,
  groupByTier,
  isBaselineReason,
  ISO_COUNTRIES,
  profileFromQuery,
  profileToQuery,
  selectedRegions,
  suggestLevel,
  uncoveredCountries,
  type CompanyProfile,
  type GuidedJurisdiction,
  type ObligationReason,
} from "./index";

const TAX = fixtureKB.taxonomy;
const run = (p: CompanyProfile) => {
  const r = assess(engineInput(p, TAX), fixtureKB, AS_OF);
  return { r, tiers: groupByTier(r) };
};

const spanishSme: CompanyProfile = {
  roles: ["deployer"],
  size: "small",
  hq: "ES",
  markets: ["ES"],
  profiles: ["P1"],
  industries: ["professional_services"],
  useCases: [],
  data: ["personal"],
};
const usFintech: CompanyProfile = {
  roles: ["deployer", "provider"],
  size: "medium",
  hq: "US",
  markets: ["US", "US-CA"],
  profiles: ["P1", "P2"],
  industries: ["financial_services"],
  useCases: ["credit_scoring", "customer_chatbot"],
  data: ["personal", "financial"],
};
const mexicanPublicSupplier: CompanyProfile = {
  roles: ["deployer", "public_supplier"],
  size: "medium",
  hq: "MX",
  markets: ["MX", "ES"],
  profiles: ["P1", "P5"],
  industries: ["public_sector"],
  useCases: ["public_benefits"],
  data: ["personal"],
};

describe("guided path: tier mapping", () => {
  it("puts every template in exactly one tier, following the engine buckets and reasons", () => {
    for (const p of [spanishSme, usFintech, mexicanPublicSupplier]) {
      const { r, tiers } = run(p);
      expect(r.templates.length).toBeGreaterThan(0);
      expect(tiers.required.length + tiers.recommended.length + tiers.nice_to_have.length).toBe(r.templates.length);
      for (const t of tiers.required) {
        expect(t.bucket).toBe("required");
        expect(t.reasons.some((x) => !isBaselineReason(x) && x.bucket === "required" && !x.supporting)).toBe(true);
      }
      for (const t of tiers.recommended) {
        expect(t.bucket).not.toBe("required");
        expect(t.bucket === "upcoming" || t.reasons.some((x) => !isBaselineReason(x) && x.supporting && x.bucket !== "recommended")).toBe(true);
      }
      for (const t of tiers.nice_to_have) {
        expect(t.bucket).toBe("recommended");
        expect(t.reasons.every((x) => isBaselineReason(x) || x.bucket === "recommended")).toBe(true);
      }
    }
  });

  it("Spanish SME using assistants: EU literacy relates, basic level", () => {
    const { r, tiers } = run(spanishSme);
    expect(r.profile.use_cases).toContain("genai_internal");
    expect(r.jurisdictions).toEqual(expect.arrayContaining(["ES", "EU", "INTL"]));
    expect(tiers.required.map((t) => t.id)).toEqual(["ai_literacy_plan"]);
    expect(suggestLevel(spanishSme).level).toBe("basic");
  });

  it("US fintech scoring credit in CA: state rule relates, reinforced level", () => {
    const { r, tiers } = run(usFintech);
    const regs = new Set(r.obligations.map((o: ObligationReason) => o.jurisdiction));
    expect([...regs]).toEqual(["US-CA"]);
    expect(tiers.recommended.map((t) => t.id)).toContain("impact_assessment");
    expect(suggestLevel(usFintech)).toEqual({ level: "reinforced", reason: "regulated_sector" });
  });

  it("Mexican public supplier with agents: implied use cases, EU baseline through Spain, reinforced level", () => {
    const { r } = run(mexicanPublicSupplier);
    expect(r.profile.use_cases).toEqual(expect.arrayContaining(["public_benefits", "genai_internal", "ai_agents"]));
    expect(r.jurisdictions).toEqual(expect.arrayContaining(["MX", "ES", "EU"]));
    expect(r.templates.map((t) => t.id)).toContain("agent_register");
    expect(suggestLevel(mexicanPublicSupplier)).toEqual({ level: "reinforced", reason: "advanced_profile" });
  });

  it("suggests the other levels", () => {
    expect(suggestLevel({ ...spanishSme, useCases: ["recruitment"] })).toEqual({ level: "reinforced", reason: "high_impact_use" });
    expect(suggestLevel({ ...spanishSme, data: ["biometric"] })).toEqual({ level: "standard", reason: "default" });
    expect(suggestLevel({ ...spanishSme, size: "large" })).toEqual({ level: "standard", reason: "default" });
    expect(suggestLevel({ ...spanishSme, profiles: [] })).toEqual({ level: "standard", reason: "default" });
  });
});

describe("guided path: profile helpers", () => {
  const valid = {
    ...VALID,
    // Same set the guided path accepts: every ISO country plus selectable taxonomy ids (US states).
    jurisdictions: new Set([...ISO_COUNTRIES, ...(TAX.jurisdictions as GuidedJurisdiction[]).filter((j) => j.selectable).map((x) => x.id)]),
  };

  it("round-trips through the shareable query string and drops unknown ids", () => {
    expect(profileFromQuery(profileToQuery(usFintech), valid)).toEqual(usFintech);
    const q = profileToQuery({ ...spanishSme, markets: ["ES", "XX"] });
    expect(profileFromQuery(q, valid)?.markets).toEqual(["ES"]);
    expect(profileFromQuery(new URLSearchParams(""), valid)).toBeNull();
  });

  it("reads links from the previous one-form map", () => {
    const p = profileFromQuery(new URLSearchParams("j=ES,US-CA&u=recruitment&r=deployer&d=personal&s=small"), valid);
    expect(p).toMatchObject({ hq: "", markets: ["ES", "US-CA"], useCases: ["recruitment"], size: "small", profiles: [] });
  });

  it("includes the HQ in the engine jurisdictions and implied inputs from P1-P5", () => {
    const input = engineInput({ ...spanishSme, markets: ["MX"], profiles: ["P4", "P5"] }, TAX);
    expect(input.jurisdictions).toEqual(["ES", "EU", "MX"]);
    expect(input.use_cases).toEqual(expect.arrayContaining(["model_training", "ai_agents"]));
    expect(engineInput({ ...spanishSme, hq: "other", markets: ["MX"] }, TAX).jurisdictions).toEqual(["MX"]);
  });

  it("only uses known ids for implied inputs", () => {
    for (const p of ["P1", "P2", "P3", "P4", "P5"] as const) for (const u of engineInput({ ...spanishSme, profiles: [p] }, TAX).use_cases ?? []) expect(VALID.useCases.has(u)).toBe(true);
  });

  it("keeps every ISO country in the link, folding full regions into short tokens", () => {
    const world: CompanyProfile = { ...spanishSme, hq: "JP", markets: [...ISO_COUNTRIES, "US-CA"] };
    const q = profileToQuery(world);
    expect(q.get("m")).toBe("*all,US-CA");
    const back = profileFromQuery(q, valid)!;
    expect(back.hq).toBe("JP");
    expect(new Set(back.markets)).toEqual(new Set(world.markets));

    const mixed: CompanyProfile = { ...spanishSme, hq: "MX", markets: ["MX", ...COUNTRY_REGIONS.eu, "JP", "KE", "CA"] };
    const enc = profileToQuery(mixed).get("m")!;
    expect(enc.split(",")).toEqual(["*eu", "MX", "JP", "KE", "CA"]);
    expect(enc.length).toBeLessThan(30);
    expect(new Set(profileFromQuery(profileToQuery(mixed), valid)!.markets)).toEqual(new Set(mixed.markets));

    // Every single code survives a round trip, and unknown tokens are dropped.
    for (const c of ISO_COUNTRIES) expect(profileFromQuery(profileToQuery({ ...spanishSme, hq: c, markets: [c] }), valid)).toMatchObject({ hq: c, markets: [c] });
    expect(decodeMarkets(["*nowhere", "*constructor", "FR"])).toEqual(["FR"]);
    expect(encodeMarkets([])).toEqual([]);
    expect(selectedRegions(["US", "CA", "BM", "GL", "PM", "FR"])).toEqual(["north_america"]);
  });

  it("keeps old links working, including the former 'other country' HQ", () => {
    expect(profileFromQuery(new URLSearchParams("h=other&m=MX,US,US-CA&r=deployer&s=small&p=P1"), valid)).toMatchObject({ hq: "other", markets: ["MX", "US", "US-CA"] });
  });

  it("maps EU member states to EU and ignores countries without coverage", () => {
    const p = { hq: "FR", markets: ["FR", "DE", "ES", "JP", "CA", "MX", "US-CA"] };
    expect(engineJurisdictions(p, TAX)).toEqual(["EU", "ES", "MX", "US-CA"]);
    expect(uncoveredCountries(p, TAX)).toEqual(["JP", "CA"]);
    expect(engineJurisdictions({ hq: "JP", markets: ["JP", "KR"] }, TAX)).toEqual([]);

    // Uncovered countries change nothing in the assessment.
    const base: CompanyProfile = { ...spanishSme, hq: "MX", markets: ["MX"] };
    const withMore: CompanyProfile = { ...base, markets: ["MX", "JP", "CA", "NG", "AU"] };
    expect(engineInput(withMore, TAX)).toEqual(engineInput(base, TAX));
    expect(run(withMore).r.templates).toEqual(run(base).r.templates);

    // A non-Spanish EU member brings in the EU rules.
    const fr = run({ ...spanishSme, hq: "FR", markets: ["FR"] }).r;
    expect(fr.jurisdictions).toEqual(expect.arrayContaining(["EU", "INTL"]));
    expect(fr.jurisdictions).not.toContain("FR");
    expect(fr.obligations.some((o) => o.jurisdiction === "EU")).toBe(true);
  });
});
