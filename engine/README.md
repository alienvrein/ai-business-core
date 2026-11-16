# @vreinn/aibc-engine

The rules engine of **AI Business Core**, the AI adoption and governance framework by VREINN SAS.

You give it an organization profile and a knowledge base of regulations. It returns the obligations whose conditions match the profile and the practice documents linked to them, sorted into buckets.

- **Deterministic and rules-based.** The same input and the same `asOf` date always give the same output. It does not use AI or language models.
- **No network, no storage, no data of its own.** You pass in the knowledge base. The engine never fetches, caches or persists anything.
- **Zero runtime dependencies, browser-safe.** It is plain TypeScript and uses no Node APIs, so it runs in a browser, a worker or a server.

> **Not legal advice.** The results are references based on the answers given. They do not say that an organization is or is not compliant with any law. Check with qualified counsel before relying on them.

## Install

The package ships as TypeScript source (`src/*.ts`). Use it from a bundler or a TypeScript-aware runtime (Vite, Next.js, esbuild, tsx, Vitest, etc.).

The package is not on npm yet; use it from this repository (for example as a workspace package, or by copying `engine/`). A runnable example is in [`../examples/basic.ts`](../examples/basic.ts): run `npm install` and then `npm run example` in this folder.

## Usage

### Low level: `assess`

```ts
import { assess, groupByTier, type EngineKB } from "@vreinn/aibc-engine";

const kb: EngineKB = {
  taxonomy: { jurisdictions: [{ id: "EU", parent: null }, { id: "ES", parent: "EU" }] },
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
        },
      ],
    },
  ],
  baseline: [{ id: "bl_policy", templates: { recommended: ["ai_use_policy"] }, reason: "A usage policy is good practice." }],
};

const result = assess({ jurisdictions: ["ES"], roles: ["deployer"], size: "small" }, kb, "2026-06-01");
// result.templates -> [{ id: "ai_literacy_plan", bucket: "required", ... }, { id: "ai_use_policy", bucket: "recommended", ... }]
const tiers = groupByTier(result); // { required, recommended, nice_to_have }
```

Signature:

```ts
function assess(profile: ProfileInput, kb: EngineKB, asOf?: string /* YYYY-MM-DD, defaults to today (UTC) */): AssessResult;
```

### High level: the guided path

The guided path (which practice documents relate to a set of answers) turns a questionnaire's answers into engine input, runs `assess`, and adds a suggested level and the list of countries the knowledge base does not cover yet.

```ts
import { runGuidedPath, validateAnswers, EMPTY_ANSWERS, type CompanyProfile, type GuidedKB } from "@vreinn/aibc-engine";

const answers: CompanyProfile = { ...EMPTY_ANSWERS, size: "small", hq: "ES", markets: ["ES", "MX"], profiles: ["P1"] };
if (validateAnswers(answers) === null) {
  const outcome = runGuidedPath(answers, kb as GuidedKB, "2026-06-01");
  // outcome: { answers, input, result, tiers, level, uncovered }
}
```

```ts
function runGuidedPath(a: CompanyProfile, kb: GuidedKB, today: string): GuidedOutcome;
```

## Input

`ProfileInput` (all fields optional; missing ones get defaults):

| Field | Type | Default |
|---|---|---|
| `jurisdictions` | `string[]` | `[]` |
| `roles` | `string[]` | `["deployer"]` |
| `industries` | `string[]` | `[]` |
| `use_cases` | `string[]` | `[]` |
| `data` | `string[]` | `["personal"]` |
| `size` | `string` | `"medium"` |

`EngineKB`, the minimal knowledge base. A richer object with extra fields also works.

```ts
interface EngineKB {
  taxonomy: { jurisdictions: { id: string; parent: string | null }[] };
  regulations: {
    id: string;
    jurisdiction: string;
    status: string; // in_force | deferred | guidance | standard | bill | lapsed
    obligations: {
      id: string;
      citation: string;
      status: string;
      applies_from: string | null; // YYYY-MM-DD
      applies_when: AppliesWhen;
      phases?: { date: string; applies_when: AppliesWhen }[];
      templates: { required: string[]; supporting: string[] }; // practice-document ids
      title?: unknown;
    }[];
  }[];
  baseline: { id: string; applies_when?: AppliesWhen; templates: { recommended: string[] }; reason: unknown }[];
}
```

`GuidedKB` is the same, except that each taxonomy jurisdiction can also carry `selectable?: boolean`.

`CompanyProfile`, the guided-path answers: `roles`, `size`, `hq` (ISO 3166-1 alpha-2), `markets` (ISO codes and sub-national ids such as `US-CA`), `profiles` (`P1`–`P5`), `industries`, `useCases`, `data`, and optionally `level` and `regions`.

Deployment profiles are cumulative, so one organization can be P1 + P2 + P5:

- **P1**: uses AI inside software it buys (assistants, AI features in SaaS).
- **P2**: connects models to its own processes or products through APIs or retrieval (RAG).
- **P3**: hosts models on its own or rented infrastructure, including open-weight models.
- **P4**: trains or fine-tunes models.
- **P5**: uses agents that act in systems (send, buy, change records, run code).

Levels: `basic` (under about 50 people, only P1, no special-category data, no decisions about people), `standard` (the default) and `reinforced` (high-risk systems, regulated sectors, or P3–P5 in production). `suggestLevel()` is a rules-based approximation of this.

## Output

```ts
interface AssessResult {
  as_of: string;
  profile: Profile;             // the input with defaults applied, plus _juris (the expanded jurisdictions)
  jurisdictions: string[];      // "INTL" + selected jurisdictions + their parents
  obligations: ObligationReason[]; // every obligation that matched
  templates: TemplateResult[];  // practice documents, strongest bucket first
}

interface TemplateResult {
  id: string;                   // practice-document id
  bucket: "required" | "upcoming" | "recommended";
  due: string | null;           // earliest future date, set only for "upcoming"
  reasons: (ObligationReason | BaselineReason)[];
}
```

**What "templates" means.** `templates` (in the output) and `obligations[].templates` (in the data) hold **practice-document ids**: opaque identifiers of the internal documents (policies, registers, assessments, notices) that help an organization put an obligation into practice. The engine never interprets them. The caller maps them to titles, files or links. The names are kept for compatibility with existing data.

Buckets:

- `required`: an obligation with status `in_force` or `deferred` whose conditions match the profile and whose date in the data is on or before `asOf`, linked through `templates.required`.
- `upcoming`: the same kind of obligation, but with a future date. `due` holds the earliest such date.
- `recommended`: any `supporting` link, any obligation with status `guidance`, `standard` or `bill`, and any baseline good-practice rule.
- Obligations with status `lapsed` are ignored.

When several reasons point to the same document, it keeps the strongest bucket (`required` > `upcoming` > `recommended`) and lists every reason. Results are sorted by bucket, then due date, then id.

`groupByTier()` maps results to three tiers for display: `required`, `recommended` (upcoming dates, or supporting links of in-force or adopted obligations) and `nice_to_have` (good practice, guidance, standards and bills only).

**What the labels mean.** `required`, `upcoming`, `recommended` and `nice_to_have` are labels of the link recorded in the knowledge base (which kind of link, which status and date), applied to the answers given. They are not a legal determination: they do not say that a rule governs an organization or that a document is legally mandatory for it.

## How applicability conditions are evaluated

An `AppliesWhen` is either a single `Condition` or an array of them:

```ts
interface Condition { jurisdictions?: string[]; roles?: string[]; industries?: string[]; use_cases?: string[]; data?: string[]; sizes?: string[] }
type AppliesWhen = Condition | Condition[];
```

- **OR within a key:** `{ roles: ["deployer", "provider"] }` matches if the profile has either role.
- **AND between keys:** `{ use_cases: ["credit_scoring"], industries: ["financial_services"] }` needs both.
- **OR between conditions:** an array matches if any of its conditions matches.
- **Always applies:** a missing condition, `{}`, `[]`, or a key holding an empty list places no restriction.
- **No negation:** there is no "not" operator. Write exclusions as positive lists.
- `sizes` is compared with the single `profile.size`. `jurisdictions` is compared with the expanded set (selected ids, their parents through `taxonomy.jurisdictions[].parent`, and `INTL`). Obligations are already scoped by their regulation's `jurisdiction`, which must be in that expanded set. A `jurisdictions` key inside a condition is mainly useful in baseline rules.
- **Phases:** if an obligation has `phases`, the earliest phase date whose condition matches wins. If no phase matches, the engine falls back to `applies_when` and `applies_from`.

## Public API

- `assess`: `assess(profile, kb, asOf?)`, plus `matches`, `expandJurisdictions`, `groupByTier`, `tierOf`, `isBaselineReason`, `todayIso`, `COND_KEYS` and `TIERS`.
- `profile`: `engineInput`, `engineJurisdictions`, `uncoveredCountries`, `profileJurisdictions`, `impliedRoles`, `impliedUseCases`, `suggestLevel`, `profileToQuery`, `profileFromQuery`, `encodeMarkets`, `decodeMarkets`, `selectedRegions`, `DEPLOYMENT_PROFILES`, `PROFILE_INPUTS`, `OTHER_COUNTRY`, `REGULATED_INDUSTRIES`, `HIGH_IMPACT_USE_CASES` and `SPECIAL_DATA`.
- `countries`: `ISO_COUNTRIES`, `EU_MEMBERS`, `COUNTRY_REGION_IDS`, `COUNTRY_REGIONS`, `regionOfCountry` and `isEuMember`.
- `guided`: `runGuidedPath`, `validateAnswers`, `stepError`, `firstInvalidStep`, `normalizeAnswers`, `regionParentMap`, `reasonLines`, `primaryReason`, `reasonKey`, `STEPS`, `OPTIONAL_STEPS` and `EMPTY_ANSWERS`.

Each module is also exported on its own path: `@vreinn/aibc-engine/assess`, `/profile`, `/countries` and `/guided`.

## Development

```sh
npm test          # vitest
npm run typecheck # tsc --noEmit
npm run example   # runs ../examples/basic.ts with tsx
```

## Español

`@vreinn/aibc-engine` es el motor de reglas de **AI Business Core**, el marco de adopción y gobierno de la IA de VREINN SAS. Recibe el perfil de una organización y una base de conocimiento de normas. Devuelve las obligaciones cuyas condiciones encajan y los documentos de práctica vinculados a ellas (ids en `templates`), clasificados en `required`, `upcoming` y `recommended`.

- Es determinista y basado en reglas: no usa IA, no hace llamadas de red y no guarda nada. La base de conocimiento la pasa quien lo llama.
- Las condiciones funcionan así: O dentro de una clave, Y entre claves, O entre las condiciones de una lista. No hay negación.
- `required`, `upcoming`, `recommended` y `nice_to_have` son etiquetas del vínculo registrado en la base de conocimiento, aplicadas a las respuestas dadas; no son una determinación legal.
- Hay un ejemplo ejecutable en [`../examples/basic.ts`](../examples/basic.ts): `npm install` y `npm run example` dentro de esta carpeta.
- **No es asesoría legal.** Los resultados son referencias basadas en las respuestas dadas. No afirman que una organización cumpla o deje de cumplir una norma.

## License

Apache-2.0. © 2026 VREINN SAS.

"AI Business Core" is a trademark of VREINN SAS. The license does not grant any right to use it.
