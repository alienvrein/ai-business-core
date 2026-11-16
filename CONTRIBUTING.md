# Contributing · Cómo contribuir

[English](#english) · [Español](#español)

---

## English

Thank you for your interest in AI Business Core. This repository holds the rules engine (`engine/`), a runnable example (`examples/`) and the documentation that explains the framework.

### What we accept for now

- **Issues are welcome**: bug reports, questions, and proposals for the engine or the documentation. Use the issue templates.
- **External code contributions (pull requests) are not accepted for now.** Pull requests from outside the maintainer team will be closed without review. If you found a bug or have an improvement in mind, open an issue describing it instead. This may change in the future; any change will be announced in this file.

### Good issues

- **Bugs**: the engine version or commit, a minimal knowledge base and profile that reproduce the problem (use made-up ids), the `asOf` date, the output you got and the output you expected.
- **Questions and proposals**: what you want to do and why. Proposals that change the public API or the output of the engine are discussed in an issue before any work starts.
- **Security issues** must be reported privately (see [SECURITY.md](SECURITY.md)), never in a public issue.
- **Errors in regulation data** are not part of this repository: the obligations registry is published at https://aibusinesscore.com, where corrections can also be reported.

### Working with the code locally

You are free to use, modify and fork the code under the [Apache-2.0 license](LICENSE). Inside `engine/`:

```sh
npm install
npm test
npm run typecheck
npm run example
```

The engine is deterministic by design: no AI or language-model calls, no network, no storage, no runtime dependencies. Its documentation uses referential wording ("relates to", "matches the conditions in the data") and never states that an organization is or is not compliant.

---

## Español

Gracias por tu interés en AI Business Core. Este repositorio contiene el motor de reglas (`engine/`), un ejemplo ejecutable (`examples/`) y la documentación que explica el framework.

### Qué aceptamos por ahora

- **Los issues son bienvenidos**: informes de errores, preguntas y propuestas sobre el motor o la documentación. Usa las plantillas de issue.
- **Por ahora no se aceptan contribuciones de código externas (pull requests).** Los pull requests de fuera del equipo mantenedor se cerrarán sin revisión. Si encontraste un error o tienes una mejora en mente, abre un issue que la describa. Esto puede cambiar en el futuro; cualquier cambio se anunciará en este archivo.

### Buenos issues

- **Errores**: la versión o el commit del motor, una base de conocimiento y un perfil mínimos que reproduzcan el problema (con ids inventados), la fecha `asOf`, el resultado que obtuviste y el que esperabas.
- **Preguntas y propuestas**: qué quieres hacer y por qué. Las propuestas que cambian la API pública o la salida del motor se discuten en un issue antes de empezar cualquier trabajo.
- **Los problemas de seguridad** se informan en privado (ver [SECURITY.md](SECURITY.md)), nunca en un issue público.
- **Los errores en datos de normas** no forman parte de este repositorio: el registro de obligaciones se publica en https://aibusinesscore.com, donde también se pueden enviar correcciones.

### Trabajar con el código en local

Puedes usar, modificar y hacer forks del código bajo la [licencia Apache-2.0](LICENSE). Dentro de `engine/`:

```sh
npm install
npm test
npm run typecheck
npm run example
```

El motor es determinista por diseño: sin llamadas a IA o modelos de lenguaje, sin red, sin almacenamiento y sin dependencias en tiempo de ejecución. Su documentación usa redacción referencial («se relaciona con», «encaja con las condiciones de los datos») y nunca afirma que una organización cumpla o deje de cumplir.
