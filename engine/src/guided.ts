// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 GROU LLC

// Guided path (which practice documents relate to the answers): the whole pipeline from the user's answers to the three tiers.
// Any front end (a browser wizard, a server, a tool protocol) can call it and get exactly the same result.
// No data imports, so it runs in the browser with a trimmed knowledge base. No AI: plain rules.
import { assess, groupByTier, isBaselineReason, type AssessResult, type EngineKB, type ObligationReason, type ProfileInput, type Reason, type TemplateResult, type Tier } from "./assess";
import { OTHER_COUNTRY, engineInput, profileJurisdictions, suggestLevel, uncoveredCountries, type CompanyProfile, type Level, type LevelReason } from "./profile";

// ---------- steps and validation ----------
export const STEPS = ["who", "hq", "markets", "profiles", "industries", "useCases", "data"] as const;
export type StepId = (typeof STEPS)[number];
/** Steps the user can skip. */
export const OPTIONAL_STEPS: ReadonlySet<StepId> = new Set<StepId>(["industries", "useCases", "data"]);
export type ErrorKey = "needRole" | "needSize" | "needHq" | "needMarket" | "needProfile";

/** Answers before the user has picked anything (roles and data start with the common defaults). */
export const EMPTY_ANSWERS: CompanyProfile = { roles: ["deployer"], size: "", hq: "", markets: [], profiles: [], industries: [], useCases: [], data: ["personal"] };

/** Error of one step, or null when it is complete (the optional steps never fail). */
export function stepError(id: StepId, a: CompanyProfile): ErrorKey | null {
  if (id === "who") return !a.roles.length ? "needRole" : !a.size ? "needSize" : null;
  if (id === "hq") return a.hq ? null : "needHq";
  if (id === "markets") return profileJurisdictions(a).length ? null : "needMarket";
  if (id === "profiles") return a.profiles.length ? null : "needProfile";
  return null;
}
/** Index of the first step with an error, or -1 when the answers are complete. */
export const firstInvalidStep = (a: CompanyProfile): number => STEPS.findIndex((id) => stepError(id, a));
/** First error in step order, or null when the answers are complete. */
export function validateAnswers(a: CompanyProfile): ErrorKey | null {
  for (const id of STEPS) {
    const e = stepError(id, a);
    if (e) return e;
  }
  return null;
}

// ---------- normalization ----------
export interface GuidedJurisdiction {
  id: string;
  parent: string | null;
  /** Selectable in the guided path; selectable children of a selectable parent are its regions (US states). */
  selectable?: boolean;
}
/** Selectable region id → its selectable parent country (US-CA → US). */
export function regionParentMap(taxonomy: { jurisdictions: readonly GuidedJurisdiction[] }): Map<string, string> {
  const selectable = new Set(taxonomy.jurisdictions.filter((j) => j.selectable).map((j) => j.id));
  const out = new Map<string, string>();
  for (const j of taxonomy.jurisdictions) if (j.selectable && j.parent && selectable.has(j.parent)) out.set(j.id, j.parent);
  return out;
}
/** Adds the HQ and the parent country of any selected region to the markets. Idempotent. */
export function normalizeAnswers(a: CompanyProfile, regionParent: ReadonlyMap<string, string>): CompanyProfile {
  const markets = [...a.markets];
  if (a.hq && a.hq !== OTHER_COUNTRY && !markets.includes(a.hq)) markets.unshift(a.hq);
  for (const m of [...markets]) {
    const parent = regionParent.get(m);
    if (parent && !markets.includes(parent)) markets.push(parent);
  }
  return { ...a, markets };
}

// ---------- reasons of one document ----------
export type ReasonLine = { kind: "relates" | "support" | "soft"; r: ObligationReason } | { kind: "practice"; text: string; key: string };
const ORDER: ReasonLine["kind"][] = ["relates", "support", "soft", "practice"];

/** Reasons of a document, de-duplicated and ordered: relates, supports, guidance or bill, good practice. */
export function reasonLines(reasons: Reason[]): ReasonLine[] {
  const seen = new Set<string>();
  const out: ReasonLine[] = [];
  for (const x of reasons) {
    if (isBaselineReason(x)) {
      if (seen.has(`b:${x.baseline}`)) continue;
      seen.add(`b:${x.baseline}`);
      out.push({ kind: "practice", text: String(x.reason), key: x.baseline });
      continue;
    }
    const kind = x.bucket === "recommended" ? "soft" : x.supporting ? "support" : "relates";
    const k = `${kind}:${x.obligation}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ kind, r: x });
  }
  return out.sort((p, q) => ORDER.indexOf(p.kind) - ORDER.indexOf(q.kind));
}

/** The one reason shown by default ("Why"); the rest sit behind "and N more". */
export function primaryReason(lines: ReasonLine[], tier: Tier): ReasonLine | null {
  const ob = (kind: ReasonLine["kind"], bucket?: string) => lines.find((x) => x.kind === kind && (!bucket || (x.kind !== "practice" && x.r.bucket === bucket)));
  if (tier === "required") return ob("relates", "required") ?? ob("relates") ?? lines[0] ?? null;
  if (tier === "recommended") return ob("relates", "upcoming") ?? ob("support") ?? ob("relates") ?? lines[0] ?? null;
  return ob("practice") ?? ob("soft") ?? null;
}
/** Stable key of a reason line (obligation or baseline rule). */
export const reasonKey = (x: ReasonLine): string => (x.kind === "practice" ? `p:${x.key}` : `${x.kind}:${x.r.obligation}`);

// ---------- the pipeline ----------
/** Trimmed knowledge base the guided path needs: the engine's plus `selectable` on the taxonomy's jurisdictions. */
export type GuidedKB = EngineKB & { taxonomy: { jurisdictions: GuidedJurisdiction[] } };

export interface GuidedOutcome {
  /** The answers after normalization (HQ and parents of regions added to the markets). */
  answers: CompanyProfile;
  input: ProfileInput;
  result: AssessResult;
  tiers: Record<Tier, TemplateResult[]>;
  level: { level: Level; reason: LevelReason };
  /** Selected countries the knowledge base has no rules for (EU members count as covered). */
  uncovered: string[];
}

/** Answers → engine → tiers, suggested level and uncovered countries. `today` is the ISO date the engine uses for "upcoming". */
export function runGuidedPath(a: CompanyProfile, kb: GuidedKB, today: string): GuidedOutcome {
  const answers = normalizeAnswers(a, regionParentMap(kb.taxonomy));
  const input = engineInput(answers, kb.taxonomy);
  const result = assess(input, kb, today);
  return {
    answers,
    input,
    result,
    tiers: groupByTier(result),
    level: suggestLevel(answers),
    uncovered: uncoveredCountries(answers, kb.taxonomy),
  };
}
