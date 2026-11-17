# Changelog

All notable changes to this project are documented in this file. The engine follows [Semantic Versioning](https://semver.org/).

## Rights holder — 2026-11-17

- GROU LLC is now the copyright holder, trademark owner and licensor of AI Business Core and of `@vreinn/aibc-engine` (NOTICE, REUSE.toml, SPDX headers, CITATION.cff, TRADEMARKS.md, SECURITY.md). VREINN remains the author and maintainer (framework lead: Alien Martínez). No code change; the license stays Apache-2.0 and the package name does not change.
- Legal, security and trademark contact: legal@aibusinesscore.com.

## Engine 1.0.0 — 2026-11-16

- First public release of `@vreinn/aibc-engine`, under Apache-2.0.
- `assess(profile, kb, asOf?)`: matches an organization profile against the applicability conditions of a knowledge base and returns the matching obligations and linked practice-document ids, in the buckets `required`, `upcoming` and `recommended`.
- `groupByTier()`: maps results to the display tiers `required`, `recommended` and `nice_to_have`.
- Guided path (`runGuidedPath`, `validateAnswers` and related helpers): turns questionnaire answers into engine input, suggests a level and lists countries the knowledge base does not cover yet.
- A runnable example (`examples/basic.ts`, `npm run example` in `engine/`) with a made-up knowledge base.
- Deterministic and rules-based: no AI, no network, no storage, no runtime dependencies.

---

# Registro de cambios

En este archivo se documentan los cambios relevantes del proyecto. El motor sigue el [Versionado Semántico](https://semver.org/lang/es/).

## Titular de los derechos — 2026-11-17

- GROU LLC pasa a ser el titular de los derechos de autor y de las marcas y el licenciante de AI Business Core y de `@vreinn/aibc-engine` (NOTICE, REUSE.toml, cabeceras SPDX, CITATION.cff, TRADEMARKS.md, SECURITY.md). VREINN sigue siendo la autora y mantenedora (responsable del framework: Alien Martínez). Sin cambios de código; la licencia sigue siendo Apache-2.0 y el nombre del paquete no cambia.
- Contacto legal, de seguridad y de marcas: legal@aibusinesscore.com.

## Motor 1.0.0 — 2026-11-16

- Primera versión pública de `@vreinn/aibc-engine`, con licencia Apache-2.0.
- `assess(profile, kb, asOf?)`: compara el perfil de una organización con las condiciones de aplicación de una base de conocimiento y devuelve las obligaciones que encajan y los ids de los documentos de práctica vinculados, en los grupos `required`, `upcoming` y `recommended`.
- `groupByTier()`: agrupa los resultados en los niveles de presentación `required`, `recommended` y `nice_to_have`.
- Ruta guiada (`runGuidedPath`, `validateAnswers` y funciones relacionadas): convierte las respuestas de un cuestionario en la entrada del motor, sugiere un nivel y lista los países que la base de conocimiento aún no cubre.
- Un ejemplo ejecutable (`examples/basic.ts`, `npm run example` dentro de `engine/`) con una base de conocimiento inventada.
- Determinista y basado en reglas: sin IA, sin red, sin almacenamiento y sin dependencias en tiempo de ejecución.
