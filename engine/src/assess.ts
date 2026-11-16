// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 VREINN SAS

// Rules-based reference engine of AI Business Core.
// No AI, no network, no storage: it only matches a profile against the `applies_when` conditions of a
// knowledge base passed in by the caller. Bucket ids are stable machine ids; user-facing labels belong to the data.
// The module has no data imports, so it runs in the browser or on a server with any trimmed knowledge base.

export type Bucket = "required" | "upcoming" | "recommended";

/** One applicability condition: AND between keys, OR within a key. A missing or empty key places no restriction. */
export interface Condition {
  jurisdictions?: string[];
  roles?: string[];
  industries?: string[];
  use_cases?: string[];
  data?: string[];
  sizes?: string[];
}
/** A single condition, or an array meaning OR between conditions (an empty array always matches). */
export type AppliesWhen = Condition | Condition[];

/**
 * Keys a condition can test. `jurisdictions` is meant for baseline rules: obligations are already scoped
 * by the jurisdiction of their regulation.
 */
export const COND_KEYS = ["jurisdictions", "roles", "industries", "use_cases", "data", "sizes"] as const;
const RANK: Record<Bucket, number> = { required: 3, upcoming: 2, recommended: 1 };

export interface EngineObligation {
  id: string;
  citation: string;
  status: string;
  applies_from: string | null;
  phases?: { date: string; applies_when: AppliesWhen }[];
  applies_when: AppliesWhen;
  /** Practice-document ids linked to the obligation: `required` links and `supporting` links. */
  templates: { required: string[]; supporting: string[] };
  title?: unknown;
}
export interface EngineRegulation {
  id: string;
  jurisdiction: string;
  status: string;
  obligations: EngineObligation[];
}
export interface EngineBaselineRule {
  id: string;
  applies_when?: AppliesWhen;
  /** Practice-document ids this good-practice rule recommends. */
  templates: { recommended: string[] };
  reason: unknown;
}
/** Minimal knowledge base the engine needs. A richer, fully typed knowledge base satisfies it structurally. */
export interface EngineKB {
  taxonomy: { jurisdictions: { id: string; parent: string | null }[] };
  regulations: EngineRegulation[];
  baseline: EngineBaselineRule[];
}

export interface ProfileInput {
  jurisdictions?: string[];
  roles?: string[];
  industries?: string[];
  use_cases?: string[];
  data?: string[];
  size?: string;
}
export interface Profile {
  jurisdictions: string[];
  roles: string[];
  industries: string[];
  use_cases: string[];
  data: string[];
  size: string;
  _juris?: string[];
}

export interface ObligationReason {
  obligation: string;
  regulation: string;
  jurisdiction: string;
  citation: string;
  status: string;
  date: string | null;
  bucket: Bucket;
  title?: unknown;
  supporting?: boolean;
}
export interface BaselineReason {
  baseline: string;
  reason: unknown;
  bucket: "recommended";
}
export type Reason = ObligationReason | BaselineReason;
export const isBaselineReason = (r: Reason): r is BaselineReason => "baseline" in r;

/** One practice document in the result: its id, its strongest bucket, the earliest future date and every reason. */
export interface TemplateResult {
  id: string;
  bucket: Bucket;
  due: string | null;
  reasons: Reason[];
}
export interface AssessResult {
  as_of: string;
  profile: Profile;
  jurisdictions: string[];
  obligations: ObligationReason[];
  /** Practice documents the answers relate to, strongest bucket first. */
  templates: TemplateResult[];
}

/** Selected jurisdictions plus their parents (ES -> EU, US-CA -> US) and international standards (INTL). */
export function expandJurisdictions(selected: string[], taxonomy: EngineKB["taxonomy"]): Set<string> {
  const parent = new Map(taxonomy.jurisdictions.map((j) => [j.id, j.parent] as const));
  const out = new Set<string>(["INTL"]);
  for (const start of selected) {
    let j: string | null | undefined = start;
    while (j) {
      out.add(j);
      j = parent.get(j);
    }
  }
  return out;
}

export function matches(profile: Profile, cond: AppliesWhen | null | undefined): boolean {
  if (cond == null) return true;
  if (Array.isArray(cond)) return cond.length === 0 || cond.some((c) => matches(profile, c));
  return COND_KEYS.every((k) => {
    const want = (cond as Condition)[k];
    if (!want || want.length === 0) return true;
    const have: string[] =
      k === "sizes" ? [profile.size] : k === "jurisdictions" ? profile._juris || profile.jurisdictions || [] : (profile[k] as string[] | undefined) || [];
    return want.some((w) => have.includes(w));
  });
}

/** Date from which an obligation's conditions match this profile in the data: null if they match and the data gives no date, undefined if they do not match. */
function effectiveDate(profile: Profile, ob: EngineObligation): string | null | undefined {
  if (ob.phases && ob.phases.length) {
    const hit = ob.phases
      .filter((p) => matches(profile, p.applies_when))
      .map((p) => p.date)
      .sort();
    if (hit.length) return hit[0];
  }
  return matches(profile, ob.applies_when) ? ob.applies_from || null : undefined;
}

function bucketFor(status: string, date: string | null, asOf: string): Bucket | null {
  if (status === "lapsed") return null;
  if (status === "in_force" || status === "deferred") return date && date > asOf ? "upcoming" : "required";
  return "recommended"; // guidance, standard, bill
}

export const todayIso = () => new Date().toISOString().slice(0, 10);

export function assess(rawProfile: ProfileInput, kb: EngineKB, asOf: string = todayIso()): AssessResult {
  const profile: Profile = {
    roles: ["deployer"],
    data: ["personal"],
    size: "medium",
    industries: [],
    use_cases: [],
    ...rawProfile,
  } as Profile;
  const juris = expandJurisdictions(profile.jurisdictions || [], kb.taxonomy);
  profile._juris = [...juris];
  const result = new Map<string, TemplateResult>();
  const add = (id: string, bucket: Bucket, reason: Reason, due?: string | null) => {
    const cur = result.get(id) || { id, bucket, due: null, reasons: [] };
    if (RANK[bucket] > RANK[cur.bucket]) cur.bucket = bucket;
    if (bucket === "upcoming" && due && (!cur.due || due < cur.due)) cur.due = due;
    cur.reasons.push(reason);
    result.set(id, cur);
  };
  const obligations: ObligationReason[] = [];
  for (const reg of kb.regulations) {
    if (!juris.has(reg.jurisdiction)) continue;
    for (const ob of reg.obligations || []) {
      const date = effectiveDate(profile, ob);
      if (date === undefined) continue;
      const bucket = bucketFor(ob.status || reg.status, date, asOf);
      if (!bucket) continue;
      const reason: ObligationReason = {
        obligation: ob.id,
        regulation: reg.id,
        jurisdiction: reg.jurisdiction,
        citation: ob.citation,
        status: ob.status,
        date,
        bucket,
        title: ob.title,
      };
      obligations.push(reason);
      for (const t of ob.templates?.required || []) add(t, bucket, reason, date);
      for (const t of ob.templates?.supporting || []) add(t, "recommended", { ...reason, supporting: true }, date);
    }
  }
  for (const rule of kb.baseline) {
    if (!matches(profile, rule.applies_when)) continue;
    for (const t of rule.templates?.recommended || []) add(t, "recommended", { baseline: rule.id, reason: rule.reason, bucket: "recommended" });
  }
  const templates = [...result.values()].sort(
    (a, b) => RANK[b.bucket] - RANK[a.bucket] || (a.due || "").localeCompare(b.due || "") || a.id.localeCompare(b.id),
  );
  return { as_of: asOf, profile, jurisdictions: [...juris], obligations, templates };
}

/**
 * Three-tier reading of a template result (display labels belong to the caller):
 * - "required": a required link of an in-force obligation whose conditions and date match the answers in the data;
 * - "recommended": a required link of an obligation with a future date, or a supporting link of an
 *   in-force or adopted obligation;
 * - "nice_to_have": only baseline good practice or guidance, voluntary standards and bills.
 */
export type Tier = "required" | "recommended" | "nice_to_have";
export const TIERS: readonly Tier[] = ["required", "recommended", "nice_to_have"];

export function tierOf(t: TemplateResult): Tier {
  if (t.bucket === "required") return "required";
  if (t.bucket === "upcoming") return "recommended";
  return t.reasons.some((r) => !isBaselineReason(r) && r.bucket !== "recommended") ? "recommended" : "nice_to_have";
}

export function groupByTier(result: AssessResult): Record<Tier, TemplateResult[]> {
  const out: Record<Tier, TemplateResult[]> = { required: [], recommended: [], nice_to_have: [] };
  for (const t of result.templates) out[tierOf(t)].push(t);
  return out;
}
