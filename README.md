# AI Business Core™ (AIBC)

[English](#english) · [Español](#español)

---

## English

**AI Business Core (AIBC)** is the AI adoption and governance framework created and maintained by VREINN (framework lead: Alien Martínez). GROU LLC holds the copyright and the trademarks. This repository explains the framework and opens its deterministic rules engine, `@vreinn/aibc-engine`, under Apache-2.0.

Website: https://aibusinesscore.com/en · Repository: https://github.com/alienvrein/ai-business-core

> **Not legal advice.** The engine provides reference information. Its results are references based on the answers given: they do not state that any organization is or is not compliant with any law. Only the text published in official gazettes and sources is legally authoritative. Check with qualified counsel before relying on them.

### What is in this repository, and what is not

| Piece | What it is | Where |
|---|---|---|
| **Framework explanation** | What AIBC is, who it serves, its phases, areas, profiles and levels, and how the engine fits in. | This README |
| **Rules engine** | `@vreinn/aibc-engine`: matches an organization profile against the applicability conditions of a knowledge base and returns the matching obligations and the practice-document ids linked to them. Deterministic, rules-based, no AI, no network, no storage. Apache-2.0. | [`engine/`](engine/) |
| **Runnable example** | A made-up knowledge base and a script that runs the engine on it. | [`examples/`](examples/) |
| **Obligations registry** | Regulations and obligations per country, with citation and official source. | **Not in this repository.** It can be consulted at https://aibusinesscore.com/en/registry |
| **Practice documents** | The editable documents that help an organization put the framework into practice. | **Not in this repository.** They are a commercial product, AI Policy Generator, sold by GROU LLC. |

The obligations registry is published as a dataset (CC BY 4.0): Zenodo DOI [10.5281/zenodo.24349774](https://doi.org/10.5281/zenodo.24349774) · Hugging Face [vreinn/ai-obligations-registry](https://huggingface.co/datasets/vreinn/ai-obligations-registry).

The engine does not depend on either of the last two: it works with any knowledge base that matches its types (see [Build your own knowledge base](#build-your-own-knowledge-base)).

### What AI Business Core is

AI usage in organizations often grows by improvisation: teams try tools on their own (shadow AI), data is used without clear rules, nobody knows which systems exist or who answers for them, and it is unclear which rules relate to each use. AIBC is a structured way to adopt AI so that it stays visible, governed and aligned with the business.

It is not a certification, a software product or a loose collection of templates. It turns AI adoption into **decisions, controls, evidence, owners and review routines**, and aims at five outcomes:

| Outcome | What it means |
|---|---|
| Visibility | An inventory of the AI tools, systems, agents, models, vendors, data and use cases in use. |
| Value | Use cases prioritized by impact, feasibility, cost and risk. |
| Control | Policies, roles, approvals, limits, vendor due diligence and human oversight. |
| Evidence | Registers, assessments, reports, minutes and traceable decisions. |
| Continuous improvement | Monitoring, incidents, periodic review and corrective actions. |

### Who it serves

- **Organizations**: management, legal and data protection, operations, IT and data teams that need to know which AI they use, which rules relate to it and how to keep it under control. It scales from small organizations (Basic level) to regulated sectors (Reinforced level).
- **Consultants and implementers**: a shared method, with common roles, registers and a single risk scale, to work with clients.
- **Developers and integrators**: an open, deterministic engine that runs in a browser, a worker or a server.
- **Research, teaching and journalism**: a documented, inspectable way to relate an organization profile to rules.

### The adoption cycle

AIBC is used as a cycle, not as a list of documents to fill in at once. Each phase answers a question, leaves evidence and sets up the next one. You start small, contain first, and expand when a use case, a country or a sector calls for it.

| Phase | Question it answers |
|---|---|
| 1. Diagnose | Where does the organization stand, and which AI does it use today, authorized or not? |
| 2. Govern | Who decides, with which limits, and which rules hold for everyone? |
| 3. Assess risk | What risk level does each system have, and which assessment does it need? |
| 4. Implement controls | Which controls does each case need for its level and profile (transparency, human oversight, vendors, security, training)? |
| 5. Operate and monitor | How is it piloted, deployed, monitored and corrected, with a safe way back? |
| 6. Review and improve | How is control shown, and what is corrected, scaled or retired? Then back to diagnosis. |

A typical roadmap covers the first 90 days: contain and lay the foundation (days 1–30), classify and open the use-case intake (days 31–60), then assess, pilot and measure (days 61–90). The phases can be read alongside the functions of the NIST AI Risk Management Framework (Govern, Map, Measure, Manage); that mapping is indicative.

### Areas and shared components

The practice documents are grouped in eight areas:

1. **Governance**: principles, usage policy, AI committee, operating model, strategy, use-case portfolio and human oversight.
2. **Risk**: classification, impact assessment, prioritization, treatment and independent review of algorithms.
3. **Security**: controls specific to AI systems (access, data, integrations, models and agents).
4. **Legal and data**: personal data, people's rights, notices, vendor contracts, transfers and obligations by country.
5. **Operations**: tool selection, pilots, monitoring, incidents, rollback, transparency and explainability.
6. **Adoption and culture**: AI literacy, ambassadors, change management and communication.
7. **Inventory**: the single registers of AI systems, vendors, models and datasets, automated decisions and impact assessments.
8. **Instruments**: checklists, questionnaires, service agreements and technical files.

Every document shares the same building blocks, defined once and never redefined:

- **One risk scale**: Low, Medium, High and Unacceptable, each with its own approval lane and review frequency (yearly, every six months, every three months; Unacceptable is redesigned or dropped). Transparency is a flag, not a level.
- **Common roles**: AI lead, AI committee, system owner, data protection officer (or equivalent), information security, legal, HR and management. Small organizations can combine roles.
- **Single registers**: each piece of information lives in one register; other documents point to it.
- **One lifecycle**: Proposed, Under assessment, Pilot, In production, Under review and Retired, with the decisions Approve, Approve with conditions, Reject and Escalate.

### Deployment profiles (P1–P5)

How the organization uses AI. Profiles are cumulative: one organization can be P1 + P2 + P5.

- **P1**: uses AI inside software it buys (assistants, AI features in SaaS).
- **P2**: connects models to its own processes or products through APIs or retrieval (RAG).
- **P3**: hosts models on its own or rented infrastructure, including open-weight models.
- **P4**: trains or fine-tunes models.
- **P5**: uses agents that act in systems (send messages, place orders, change records, run code).

### Levels

How deep each document goes, by size and risk:

- **Basic**: under about 50 people, only P1, no special-category data and no decisions about people.
- **Standard**: the default for everyone else.
- **Reinforced**: any High-risk system, a regulated sector, or P3–P5 in production.

The engine's `suggestLevel()` is a rules-based approximation of these criteria; the organization makes the final choice.

### Design principles

- **Referential, not prescriptive.** AIBC shows which rules a practice relates to and helps document it. It does not settle which rules govern a specific organization or replace the legal analysis of its case.
- **Proportionate to risk.** A low-impact internal use does not carry the paperwork of a system that makes decisions about people.
- **Public references only.** The framework relies on published rules and open references (such as OECD, UNESCO, NIST and the Council of Europe), not on paid standards or private accreditation schemes.

### How the engine fits in

The engine answers one question of the diagnosis and controls phases: which rules relate to this organization, and why.

1. **The knowledge base describes each obligation** with its citation, its status (in force, with a future date, guidance or bill), its date and its applicability condition: the roles, industries, use cases, data types, sizes or jurisdictions it refers to.
2. **The organization describes its profile** with the same fields, plus its deployment profiles (P1–P5).
3. **The engine matches the two**, with no AI and always with the same output for the same input and date. It returns the matching obligations, the reason for each one and the ids of the linked practice documents.
4. **The organization turns the result into practice**: it decides which controls to put in place and which evidence to keep.

**About the labels.** The engine sorts documents into `required`, `upcoming` and `recommended`, and `groupByTier()` into `required`, `recommended` and `nice_to_have`. These are labels of the link recorded in the knowledge base (the kind of link, the obligation's status and its date), applied to the answers given. They are not a legal determination: they do not say that a rule governs an organization or that a document is legally mandatory for it.

### Where the framework is heading

AIBC will keep growing toward a complete AI adoption framework. Directions under consideration include a structured maturity assessment and tools to discover and manage shadow AI. There are no dates for these; changes will be announced in the [changelog](CHANGELOG.md).

### Quick start

You need Node.js 20.19 or later (or 22.12 or later) and git. The engine is not on npm yet; use it from this repository.

```sh
git clone https://github.com/alienvrein/ai-business-core aibc
cd aibc/engine
npm install
npm test           # run the test suite
npm run typecheck  # type-check the engine and the example
npm run example    # run examples/basic.ts against a made-up knowledge base
```

The engine ships as TypeScript source with extension-less imports, so use it from a bundler or a TypeScript-aware runtime (Vite, Next.js, esbuild, tsx, Vitest, etc.). The example runs with [tsx](https://tsx.is/).

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
const tiers = groupByTier(result); // { required, recommended, nice_to_have }
```

All ids above are made up for the example. Signatures:

```ts
function assess(profile: ProfileInput, kb: EngineKB, asOf?: string /* YYYY-MM-DD, defaults to today (UTC) */): AssessResult;
function runGuidedPath(a: CompanyProfile, kb: GuidedKB, today: string): GuidedOutcome;
```

The same input and the same `asOf` date always give the same output. See [`engine/README.md`](engine/README.md) for the input and output types, how applicability conditions are evaluated, and the full public API.

### Build your own knowledge base

The engine has no data of its own. It works with any knowledge base that matches the `EngineKB` type (or `GuidedKB` for the guided path):

1. **Jurisdictions**: list them in `taxonomy.jurisdictions`, each with its `parent` (for example, a country whose parent is a regional bloc). The engine always adds `INTL`.
2. **Regulations and obligations**: give each obligation a `status`, an `applies_from` date (or `null`), optional `phases`, and an `applies_when` condition built from roles, industries, use cases, data types, sizes and jurisdictions (OR within a key, AND between keys, OR between conditions in a list).
3. **Links to your documents**: put your own document ids in `templates.required` and `templates.supporting`. The engine never interprets them; you map them to titles, files or links.
4. **Baseline rules**: add good-practice recommendations that are not tied to a specific regulation.
5. **Test it**: write tests with fixed `asOf` dates, as in [`engine/src/__fixtures__/kb.ts`](engine/src/__fixtures__/kb.ts) and [`examples/basic.ts`](examples/basic.ts).

Use the vocabulary you need: the engine compares strings and does not require a fixed list of roles, industries or use cases. The guided-path helpers (`suggestLevel()`, `impliedRoles()` and related ones) assume a few ids, exported as `PROFILE_INPUTS`, `REGULATED_INDUSTRIES`, `HIGH_IMPACT_USE_CASES` and `SPECIAL_DATA` (see [`engine/README.md`](engine/README.md)).

### Licenses

| Path | License | Copyright |
|---|---|---|
| Everything in this repository, unless stated otherwise | Apache-2.0 | 2026 GROU LLC (created by VREINN) |

The full license texts are in [`LICENSES/`](LICENSES/). [`REUSE.toml`](REUSE.toml) states the license of each path in machine-readable form, following the [REUSE specification](https://reuse.software/spec-3.3/). See also [`NOTICE`](NOTICE).

### Trademarks

"AI Business Core", "AIBC", the AI Business Core logo and "AI Policy Generator" are trademarks of GROU LLC. "VREINN" is a trademark of its owner. The Apache-2.0 license grants no trademark rights. See [`TRADEMARKS.md`](TRADEMARKS.md).

### How to cite

Use the metadata in [`CITATION.cff`](CITATION.cff).

To cite the obligations registry data, cite the dataset version you used by its DOI: version 1.0.0 is [10.5281/zenodo.24349775](https://doi.org/10.5281/zenodo.24349775). The concept DOI [10.5281/zenodo.24349774](https://doi.org/10.5281/zenodo.24349774) covers every version and always resolves to the latest.

### How to contribute

Issues with bug reports, questions and proposals are welcome. External code contributions (pull requests) are not accepted for now; see [`CONTRIBUTING.md`](CONTRIBUTING.md). Report security problems privately, as described in [`SECURITY.md`](SECURITY.md).


---

## Español

**AI Business Core (AIBC)** es el marco de adopción y gobierno de la IA creado y mantenido por VREINN (responsable del framework: Alien Martínez). GROU LLC es el titular de los derechos de autor y de las marcas. Este repositorio explica el framework y abre su motor de reglas determinista, `@vreinn/aibc-engine`, con licencia Apache-2.0.

Sitio web: https://aibusinesscore.com/es · Repositorio: https://github.com/alienvrein/ai-business-core

> **No es asesoría legal.** El motor ofrece información de referencia. Sus resultados son referencias basadas en las respuestas dadas: no afirman que una organización cumpla o deje de cumplir una norma. Solo el texto publicado en los diarios y fuentes oficiales tiene validez legal. Consulta con un profesional habilitado antes de basarte en ellos.

### Qué hay en este repositorio y qué no

| Pieza | Qué es | Dónde |
|---|---|---|
| **Explicación del framework** | Qué es AIBC, a quién sirve, sus fases, áreas, perfiles y niveles, y cómo encaja el motor. | Este README |
| **Motor de reglas** | `@vreinn/aibc-engine`: compara el perfil de una organización con las condiciones de aplicación de una base de conocimiento y devuelve las obligaciones que encajan y los ids de los documentos de práctica vinculados. Determinista, basado en reglas, sin IA, sin red y sin almacenamiento. Apache-2.0. | [`engine/`](engine/) |
| **Ejemplo ejecutable** | Una base de conocimiento inventada y un script que ejecuta el motor sobre ella. | [`examples/`](examples/) |
| **Registro de obligaciones** | Normas y obligaciones por país, con su cita y su fuente oficial. | **No está en este repositorio.** Se puede consultar en https://aibusinesscore.com/es/registro |
| **Documentos de práctica** | Los documentos editables que ayudan a una organización a llevar el framework a la práctica. | **No están en este repositorio.** Son un producto comercial, AI Policy Generator, que vende GROU LLC. |

El registro de obligaciones se publica como conjunto de datos (CC BY 4.0): DOI de Zenodo [10.5281/zenodo.24349774](https://doi.org/10.5281/zenodo.24349774) · Hugging Face [vreinn/ai-obligations-registry](https://huggingface.co/datasets/vreinn/ai-obligations-registry).

El motor no depende de ninguna de las dos últimas piezas: funciona con cualquier base de conocimiento que se ajuste a sus tipos (ver [Construye tu propia base de conocimiento](#construye-tu-propia-base-de-conocimiento)).

### Qué es AI Business Core

El uso de IA en las organizaciones suele crecer por improvisación: los equipos prueban herramientas por su cuenta (IA en la sombra), los datos se usan sin reglas claras, nadie sabe qué sistemas existen ni quién responde por ellos, y no está claro qué normas se relacionan con cada uso. AIBC es una forma estructurada de adoptar la IA para que siga siendo visible, gobernada y alineada con el negocio.

No es una certificación, un producto de software ni una colección suelta de plantillas. Convierte la adopción de IA en **decisiones, controles, evidencias, responsables y rutinas de revisión**, y busca cinco resultados:

| Resultado | Qué significa |
|---|---|
| Visibilidad | Un inventario de las herramientas, sistemas, agentes, modelos, proveedores, datos y casos de uso de IA. |
| Valor | Casos de uso priorizados por impacto, factibilidad, costo y riesgo. |
| Control | Políticas, roles, aprobaciones, límites, debida diligencia de proveedores y supervisión humana. |
| Evidencia | Registros, evaluaciones, reportes, actas y decisiones trazables. |
| Mejora continua | Monitoreo, incidentes, revisión periódica y acciones correctivas. |

### A quién sirve

- **Organizaciones**: dirección, legal y protección de datos, operaciones, TI y datos, que necesitan saber qué IA usan, qué normas se relacionan con ella y cómo mantenerla bajo control. Escala desde organizaciones pequeñas (nivel Básico) hasta sectores regulados (nivel Reforzado).
- **Consultores e implementadores**: un método común, con roles, registros y una escala de riesgo únicos, para trabajar con sus clientes.
- **Desarrolladores e integradores**: un motor abierto y determinista que se ejecuta en un navegador, un worker o un servidor.
- **Investigación, docencia y periodismo**: una forma documentada e inspeccionable de relacionar el perfil de una organización con las normas.

### El ciclo de adopción

AIBC se usa como un ciclo, no como una lista de documentos que se completan de una vez. Cada fase responde una pregunta, deja evidencia y prepara la siguiente. Se empieza en pequeño, primero se contiene y se amplía cuando un caso de uso, un país o un sector lo pide.

| Fase | Pregunta que responde |
|---|---|
| 1. Diagnosticar | ¿Dónde está la organización y qué IA usa hoy, autorizada o no? |
| 2. Gobernar | ¿Quién decide, con qué límites y qué reglas valen para todos? |
| 3. Evaluar el riesgo | ¿Qué nivel de riesgo tiene cada sistema y qué evaluación necesita? |
| 4. Implementar controles | ¿Qué controles necesita cada caso según su nivel y su perfil (transparencia, supervisión humana, proveedores, seguridad, formación)? |
| 5. Operar y monitorear | ¿Cómo se pilota, se despliega, se monitorea y se corrige, con una vuelta atrás segura? |
| 6. Revisar y mejorar | ¿Cómo se demuestra el control y qué se corrige, se escala o se retira? Y de vuelta al diagnóstico. |

Una hoja de ruta típica cubre los primeros 90 días: contener y sentar la base (días 1–30), clasificar y abrir la entrada de casos de uso (días 31–60), y después evaluar, pilotar y medir (días 61–90). Las fases se pueden leer junto a las funciones del Marco de gestión de riesgos de IA del NIST (Govern, Map, Measure, Manage); esa correspondencia es orientativa.

### Áreas y componentes comunes

Los documentos de práctica se agrupan en ocho áreas:

1. **Gobernanza**: principios, política de uso, comité de IA, modelo operativo, estrategia, portafolio de casos de uso y supervisión humana.
2. **Riesgos**: clasificación, evaluación de impacto, priorización, tratamiento y revisión independiente de algoritmos.
3. **Seguridad**: controles propios de los sistemas de IA (accesos, datos, integraciones, modelos y agentes).
4. **Legal y datos**: datos personales, derechos de las personas, avisos, contratos con proveedores, transferencias y obligaciones por país.
5. **Operaciones**: selección de herramientas, pilotos, monitoreo, incidentes, vuelta atrás, transparencia y explicabilidad.
6. **Adopción y cultura**: alfabetización en IA, embajadores, gestión del cambio y comunicación.
7. **Inventario**: los registros únicos de sistemas de IA, proveedores, modelos y conjuntos de datos, decisiones automatizadas y evaluaciones de impacto.
8. **Instrumentos**: listas de verificación, cuestionarios, acuerdos de servicio y expedientes técnicos.

Todos los documentos comparten las mismas piezas, definidas una sola vez y nunca redefinidas:

- **Una sola escala de riesgo**: Bajo, Medio, Alto e Inaceptable, cada nivel con su carril de aprobación y su frecuencia de revisión (anual, cada seis meses, cada tres meses; lo Inaceptable se rediseña o se descarta). La transparencia es una marca, no un nivel.
- **Roles comunes**: responsable de IA, comité de IA, dueño del sistema, delegado de protección de datos (o rol equivalente), seguridad de la información, legal, recursos humanos y dirección. Una organización pequeña puede acumular roles.
- **Registros únicos**: cada dato vive en un solo registro; los demás documentos apuntan a él.
- **Un solo ciclo de vida**: Propuesto, En evaluación, Piloto, En producción, En revisión y Retirado, con las decisiones Aprobar, Aprobar con condiciones, Rechazar y Escalar.

### Perfiles de despliegue (P1–P5)

Cómo usa la IA la organización. Son acumulativos: una organización puede ser P1 + P2 + P5.

- **P1**: usa IA dentro del software que contrata (asistentes, funciones de IA en aplicaciones SaaS).
- **P2**: integra modelos en sus procesos o productos por API o recuperación de información (RAG).
- **P3**: aloja modelos en infraestructura propia o alquilada, incluidos modelos de pesos abiertos.
- **P4**: entrena o ajusta (fine-tuning) modelos.
- **P5**: usa agentes que actúan en sistemas (envían mensajes, hacen pedidos, cambian registros o ejecutan código).

### Niveles

La profundidad con que se aplica cada documento, según el tamaño y el riesgo:

- **Básico**: menos de unas 50 personas, solo P1, sin datos de categorías especiales ni decisiones sobre personas.
- **Estándar**: el nivel por defecto para el resto.
- **Reforzado**: cualquier sistema de riesgo Alto, un sector regulado, o P3–P5 en producción.

`suggestLevel()` del motor es una aproximación basada en reglas a estos criterios; la elección final es de la organización.

### Principios de diseño

- **Referencial, no prescriptivo.** AIBC muestra con qué normas se relaciona cada práctica y ayuda a documentarla. No decide qué normas rigen a una organización concreta ni sustituye el análisis legal de su caso.
- **Proporcional al riesgo.** Un uso interno de bajo impacto no carga con el papeleo de un sistema que toma decisiones sobre personas.
- **Solo referencias públicas.** El framework se apoya en normas publicadas y referencias abiertas (como OCDE, UNESCO, NIST y el Consejo de Europa), no en normas técnicas de pago ni en esquemas privados de acreditación.

### Cómo encaja el motor

El motor responde una pregunta de las fases de diagnóstico y de controles: qué normas se relacionan con esta organización, y por qué.

1. **La base de conocimiento describe cada obligación** con su cita, su estado (en vigor, con fecha futura, guía o proyecto de ley), su fecha y su condición de aplicación: los roles, sectores, casos de uso, tipos de datos, tamaños o jurisdicciones a los que se refiere.
2. **La organización describe su perfil** con los mismos campos, más sus perfiles de despliegue (P1–P5).
3. **El motor cruza ambos**, sin IA y siempre con el mismo resultado para la misma entrada y fecha. Devuelve las obligaciones que encajan, el motivo de cada una y los ids de los documentos de práctica vinculados.
4. **La organización lleva el resultado a la práctica**: decide qué controles pone en marcha y qué evidencias conserva.

**Sobre las etiquetas.** El motor clasifica los documentos en `required`, `upcoming` y `recommended`, y `groupByTier()` en `required`, `recommended` y `nice_to_have`. Son etiquetas del vínculo registrado en la base de conocimiento (el tipo de vínculo, el estado de la obligación y su fecha), aplicadas a las respuestas dadas. No son una determinación legal: no afirman que una norma rija a una organización ni que un documento sea legalmente obligatorio para ella.

### Hacia dónde va el framework

AIBC seguirá creciendo hacia un marco de adopción de IA completo. Entre las líneas que se estudian están una evaluación de madurez estructurada y herramientas para descubrir y gestionar la IA en la sombra. No hay fechas para ellas; los cambios se anunciarán en el [registro de cambios](CHANGELOG.md).

### Inicio rápido

Necesitas Node.js 20.19 o superior (o 22.12 o superior) y git. El motor aún no está en npm; úsalo desde este repositorio.

```sh
git clone https://github.com/alienvrein/ai-business-core aibc
cd aibc/engine
npm install
npm test           # ejecuta las pruebas
npm run typecheck  # comprueba los tipos del motor y del ejemplo
npm run example    # ejecuta examples/basic.ts con una base de conocimiento inventada
```

El motor se distribuye como código fuente TypeScript con imports sin extensión: úsalo con un empaquetador o un entorno que entienda TypeScript (Vite, Next.js, esbuild, tsx, Vitest, etc.). El ejemplo se ejecuta con [tsx](https://tsx.is/).

```ts
import { assess, groupByTier } from "@vreinn/aibc-engine";

const result = assess({ jurisdictions: ["ES"], roles: ["deployer"], size: "small" }, kb, "2026-06-01");
const tiers = groupByTier(result); // { required, recommended, nice_to_have }
```

`kb` es la base de conocimiento (ver el ejemplo completo en la sección en inglés o en [`examples/basic.ts`](examples/basic.ts); todos sus ids son inventados). Firmas:

```ts
function assess(profile: ProfileInput, kb: EngineKB, asOf?: string /* AAAA-MM-DD; por defecto, hoy (UTC) */): AssessResult;
function runGuidedPath(a: CompanyProfile, kb: GuidedKB, today: string): GuidedOutcome;
```

La misma entrada con la misma fecha `asOf` da siempre el mismo resultado. Los tipos de entrada y salida, la evaluación de las condiciones y la API completa están en [`engine/README.md`](engine/README.md).

### Construye tu propia base de conocimiento

El motor no trae datos propios. Funciona con cualquier base de conocimiento que cumpla el tipo `EngineKB` (o `GuidedKB` para la ruta guiada):

1. **Jurisdicciones**: lístalas en `taxonomy.jurisdictions`, cada una con su `parent` (por ejemplo, un país cuyo padre es un bloque regional). El motor añade siempre `INTL`.
2. **Normas y obligaciones**: da a cada obligación un `status`, una fecha `applies_from` (o `null`), `phases` opcionales y una condición `applies_when` formada por roles, sectores, casos de uso, tipos de datos, tamaños y jurisdicciones (O dentro de una clave, Y entre claves, O entre las condiciones de una lista).
3. **Vínculos con tus documentos**: pon los ids de tus propios documentos en `templates.required` y `templates.supporting`. El motor nunca los interpreta; tú los asocias a títulos, archivos o enlaces.
4. **Reglas base**: añade recomendaciones de buena práctica que no dependan de una norma concreta.
5. **Pruébala**: escribe pruebas con fechas `asOf` fijas, como en [`engine/src/__fixtures__/kb.ts`](engine/src/__fixtures__/kb.ts) y [`examples/basic.ts`](examples/basic.ts).

Usa el vocabulario que necesites: el motor compara cadenas y no exige una lista fija de roles, sectores o casos de uso. Las funciones de la ruta guiada (`suggestLevel()`, `impliedRoles()` y relacionadas) suponen algunos ids, exportados como `PROFILE_INPUTS`, `REGULATED_INDUSTRIES`, `HIGH_IMPACT_USE_CASES` y `SPECIAL_DATA` (ver [`engine/README.md`](engine/README.md)).

### Licencias

| Ruta | Licencia | Derechos de autor |
|---|---|---|
| Todo el repositorio, salvo que se indique otra cosa | Apache-2.0 | 2026 GROU LLC (creado por VREINN) |

Los textos completos de las licencias están en [`LICENSES/`](LICENSES/). [`REUSE.toml`](REUSE.toml) indica la licencia de cada ruta en formato legible por máquina, según la [especificación REUSE](https://reuse.software/spec-3.3/). Ver también [`NOTICE`](NOTICE).

### Marcas

«AI Business Core», «AIBC», el logotipo de AI Business Core y «AI Policy Generator» son marcas de GROU LLC. «VREINN» es una marca de su titular. La licencia Apache-2.0 no concede derechos sobre marcas. Ver [`TRADEMARKS.md`](TRADEMARKS.md).

### Cómo citar

Usa los metadatos de [`CITATION.cff`](CITATION.cff).

Para citar los datos del registro de obligaciones, cita la versión del conjunto de datos que usaste por su DOI: la versión 1.0.0 es [10.5281/zenodo.24349775](https://doi.org/10.5281/zenodo.24349775). El DOI de concepto [10.5281/zenodo.24349774](https://doi.org/10.5281/zenodo.24349774) reúne todas las versiones y siempre lleva a la última.

### Cómo contribuir

Son bienvenidos los issues con errores, preguntas y propuestas. Por ahora no se aceptan contribuciones de código externas (pull requests); ver [`CONTRIBUTING.md`](CONTRIBUTING.md). Los problemas de seguridad se informan en privado, como explica [`SECURITY.md`](SECURITY.md).

