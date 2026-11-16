// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 VREINN SAS

// Organization profile collected by the guided path (which practice documents relate to the answers) and its translation
// into engine input. No data imports, so it runs in the browser. No AI: plain rules.
//
// Deployment profiles (cumulative: an organization can be P1 + P2 + P5):
// - P1: uses AI inside software it buys (assistants, AI features in SaaS);
// - P2: integrates models through APIs or retrieval (RAG) into its own processes or products;
// - P3: hosts models on its own or rented infrastructure, including open-weight models;
// - P4: trains or fine-tunes models;
// - P5: uses agents that act in systems (send, buy, change records, run code).
// Levels:
// - basic: under ~50 people, only P1, no special-category data, no decisions about people;
// - standard: the default for everyone else;
// - reinforced: any high-risk system, a regulated sector, or P3-P5 in production.
// suggestLevel() below is the rules-based approximation of these levels from the guided-path answers.
import type { EngineKB, ProfileInput } from "./assess";
import { COUNTRY_REGION_IDS, COUNTRY_REGIONS, ISO_COUNTRIES, isEuMember, type CountryRegionId } from "./countries";

export const DEPLOYMENT_PROFILES = ["P1", "P2", "P3", "P4", "P5"] as const;
export type DeploymentProfile = (typeof DEPLOYMENT_PROFILES)[number];
export type Level = "basic" | "standard" | "reinforced";

/** "Another country": the HQ option before every country was listed. Still read from old links and saved answers. */
export const OTHER_COUNTRY = "other";

/** The guided-path answers. Callers may persist this shape as they see fit; the engine never stores it. */
export interface CompanyProfile {
  roles: string[];
  size: string;
  /** ISO 3166-1 alpha-2 code (any country, covered by the knowledge base or not). */
  hq: string;
  /**
   * Every place where people affected by the AI are: ISO country codes (covered or not), sub-national ids
   * from the taxonomy (e.g. US states), and the HQ. Uncovered countries are kept as market data; the engine ignores them.
   */
  markets: string[];
  profiles: DeploymentProfile[];
  industries: string[];
  useCases: string[];
  data: string[];
  level?: Level;
  /** Optional: country regions fully selected in markets (see selectedRegions). */
  regions?: CountryRegionId[];
}

/**
 * Engine inputs implied by each deployment profile, limited to ids that exist in the taxonomy.
 * P2 and P3 have no matching use case in the knowledge base; they only imply the deployer role
 * (and raise the suggested level for P3).
 */
export const PROFILE_INPUTS: Record<DeploymentProfile, { roles: string[]; use_cases: string[] }> = {
  P1: { roles: ["deployer"], use_cases: ["genai_internal"] },
  P2: { roles: ["deployer"], use_cases: [] },
  P3: { roles: ["deployer"], use_cases: [] },
  P4: { roles: [], use_cases: ["model_training"] },
  P5: { roles: ["deployer"], use_cases: ["ai_agents"] },
};

const uniq = (xs: string[]) => [...new Set(xs)];

export function impliedUseCases(profiles: readonly string[]): string[] {
  return uniq(profiles.flatMap((p) => PROFILE_INPUTS[p as DeploymentProfile]?.use_cases ?? []));
}
export function impliedRoles(profiles: readonly string[]): string[] {
  return uniq(profiles.flatMap((p) => PROFILE_INPUTS[p as DeploymentProfile]?.roles ?? []));
}

/** Every country and sub-jurisdiction in the profile: the HQ plus every market, covered or not. */
export function profileJurisdictions(p: Pick<CompanyProfile, "hq" | "markets">): string[] {
  return uniq([...(p.hq && p.hq !== OTHER_COUNTRY ? [p.hq] : []), ...p.markets]);
}

type Taxonomy = EngineKB["taxonomy"];
const knownIds = (t: Taxonomy) => new Set(t.jurisdictions.map((j) => j.id));

/**
 * Jurisdictions the engine looks at: only those in the knowledge base. Any EU member state brings in
 * "EU" (plus the state itself when it has its own entry, e.g. ES); other uncovered countries are dropped.
 */
export function engineJurisdictions(p: Pick<CompanyProfile, "hq" | "markets">, taxonomy: Taxonomy): string[] {
  const known = knownIds(taxonomy);
  return uniq(profileJurisdictions(p).flatMap((j) => [...(known.has(j) ? [j] : []), ...(isEuMember(j) && known.has("EU") ? ["EU"] : [])]));
}

/** Selected countries the knowledge base has no rules for yet (EU members count as covered through the EU). */
export function uncoveredCountries(p: Pick<CompanyProfile, "hq" | "markets">, taxonomy: Taxonomy): string[] {
  const known = knownIds(taxonomy);
  return profileJurisdictions(p).filter((j) => !known.has(j) && !(isEuMember(j) && known.has("EU")));
}

export function engineInput(p: CompanyProfile, taxonomy: Taxonomy): ProfileInput {
  return {
    jurisdictions: engineJurisdictions(p, taxonomy),
    roles: uniq([...p.roles, ...impliedRoles(p.profiles)]),
    industries: p.industries,
    use_cases: uniq([...p.useCases, ...impliedUseCases(p.profiles)]),
    data: p.data,
    ...(p.size ? { size: p.size } : {}),
  };
}

// ---------- suggested level ----------
/** Sectors treated as regulated for the level suggestion. */
export const REGULATED_INDUSTRIES = ["financial_services", "insurance", "healthcare", "public_sector"];
/** Use cases that usually mean a high-risk system or decisions about people. */
export const HIGH_IMPACT_USE_CASES = [
  "recruitment",
  "worker_management",
  "credit_scoring",
  "insurance_pricing",
  "clinical",
  "education_assessment",
  "biometrics",
  "public_benefits",
  "consequential_decisions",
];
/** Special-category data that rules out the basic level. */
export const SPECIAL_DATA = ["sensitive", "biometric", "minors"];

export type LevelReason = "advanced_profile" | "regulated_sector" | "high_impact_use" | "small_and_simple" | "default";

export function suggestLevel(p: CompanyProfile): { level: Level; reason: LevelReason } {
  const useCases = uniq([...p.useCases, ...impliedUseCases(p.profiles)]);
  if (p.profiles.some((x) => x === "P3" || x === "P4" || x === "P5")) return { level: "reinforced", reason: "advanced_profile" };
  if (p.industries.some((i) => REGULATED_INDUSTRIES.includes(i))) return { level: "reinforced", reason: "regulated_sector" };
  if (useCases.some((u) => HIGH_IMPACT_USE_CASES.includes(u))) return { level: "reinforced", reason: "high_impact_use" };
  const small = p.size === "micro" || p.size === "small";
  const onlyP1 = p.profiles.length > 0 && p.profiles.every((x) => x === "P1");
  if (small && onlyP1 && !p.data.some((d) => SPECIAL_DATA.includes(d))) return { level: "basic", reason: "small_and_simple" };
  return { level: "standard", reason: "default" };
}

// ---------- shareable URL ----------
const QUERY_KEYS = { roles: "r", size: "s", hq: "h", markets: "m", profiles: "p", industries: "i", useCases: "u", data: "d" } as const;

/**
 * Region shortcuts in the markets list: "*latam" stands for every country in that region and "*all"
 * for every country, so "whole world" stays a short link. "*" is not escaped in query strings, and
 * plain codes (old links) keep working.
 */
const REGION_TOKEN = "*";
const ALL_TOKEN = `${REGION_TOKEN}all`;

/** Country regions whose every country is in the list. */
export function selectedRegions(codes: readonly string[]): CountryRegionId[] {
  const has = new Set(codes);
  return COUNTRY_REGION_IDS.filter((r) => COUNTRY_REGIONS[r].every((c) => has.has(c)));
}

export function encodeMarkets(codes: readonly string[]): string[] {
  const full = selectedRegions(codes);
  if (full.length === COUNTRY_REGION_IDS.length) return [ALL_TOKEN, ...codes.filter((c) => !ISO_COUNTRIES.includes(c))];
  const folded = new Set(full.flatMap((r) => COUNTRY_REGIONS[r]));
  return [...full.map((r) => REGION_TOKEN + r), ...codes.filter((c) => !folded.has(c))];
}

export function decodeMarkets(tokens: readonly string[]): string[] {
  return uniq(
    tokens.flatMap((t) => {
      if (t === ALL_TOKEN) return [...ISO_COUNTRIES];
      if (t.startsWith(REGION_TOKEN)) {
        const r = t.slice(1) as CountryRegionId;
        return COUNTRY_REGION_IDS.includes(r) ? [...COUNTRY_REGIONS[r]] : [];
      }
      return [t];
    }),
  );
}

export function profileToQuery(p: CompanyProfile): URLSearchParams {
  const q = new URLSearchParams();
  for (const [k, short] of Object.entries(QUERY_KEYS) as [keyof typeof QUERY_KEYS, string][]) {
    const v = k === "markets" ? encodeMarkets(p.markets) : p[k];
    q.set(short, Array.isArray(v) ? v.join(",") : v);
  }
  return q;
}

export interface ProfileOptions {
  roles: Set<string>;
  sizes: Set<string>;
  jurisdictions: Set<string>;
  industries: Set<string>;
  useCases: Set<string>;
  data: Set<string>;
}

/** Reads a profile from a query string, dropping unknown ids. Returns null when the query holds no answers. */
export function profileFromQuery(q: URLSearchParams, valid: ProfileOptions): CompanyProfile | null {
  const raw = (key: string) => (q.get(key) ?? "").split(",");
  const list = (key: string, ok: Set<string>) => uniq(raw(key).filter((x) => ok.has(x)));
  const places = (key: string) => decodeMarkets(raw(key)).filter((x) => valid.jurisdictions.has(x));
  if (q.has(QUERY_KEYS.hq)) {
    const hq = q.get(QUERY_KEYS.hq) ?? "";
    const size = q.get(QUERY_KEYS.size) ?? "";
    return {
      roles: list(QUERY_KEYS.roles, valid.roles),
      size: valid.sizes.has(size) ? size : "",
      hq: hq === OTHER_COUNTRY || valid.jurisdictions.has(hq) ? hq : "",
      markets: places(QUERY_KEYS.markets),
      profiles: list(QUERY_KEYS.profiles, new Set(DEPLOYMENT_PROFILES)) as DeploymentProfile[],
      industries: list(QUERY_KEYS.industries, valid.industries),
      useCases: list(QUERY_KEYS.useCases, valid.useCases),
      data: list(QUERY_KEYS.data, valid.data),
    };
  }
  // Links shared from the previous one-form map: j=jurisdictions, i, u, r, d, s.
  if (q.has("j")) {
    const size = q.get("s") ?? "";
    return {
      roles: list("r", valid.roles),
      size: valid.sizes.has(size) ? size : "",
      hq: "",
      markets: places("j"),
      profiles: [],
      industries: list("i", valid.industries),
      useCases: list("u", valid.useCases),
      data: list("d", valid.data),
    };
  }
  return null;
}
