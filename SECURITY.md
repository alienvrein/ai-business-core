# Security policy · Política de seguridad

[English](#english) · [Español](#español)

---

## English

### Scope

This policy covers the engine code (`engine/`), the example (`examples/`) and the repository's build and CI configuration.

The engine runs without network access or storage, so the main concerns are issues such as code that could execute unintended actions, unsafe handling of input passed to the engine, and problems in the build or test tooling or its dependencies.

**Out of scope:** the content of any knowledge base (a wrong date, citation or source link in data you pass to the engine) is not a security issue. Websites and commercial products built on this project are not covered by this policy.

### Reporting a vulnerability

Report it **privately**. Do not open a public issue.

- **Preferred:** GitHub private vulnerability reporting, from the **Security** tab of this repository ("Report a vulnerability").
- **Alternative:** email **legal@vreinn.com**.

Please include a description of the issue, the affected files or versions, steps to reproduce, and its possible impact.

### Response

On a best-effort basis, VREINN SAS aims to acknowledge a report within 5 business days and to send a status update within 30 days, and will keep you informed while the issue is handled.

Please give us reasonable time to fix the issue before disclosing it publicly.

---

## Español

### Alcance

Esta política cubre el código del motor (`engine/`), el ejemplo (`examples/`) y la configuración de compilación e integración continua del repositorio.

El motor funciona sin acceso a red ni almacenamiento, así que lo principal son problemas como código que pueda ejecutar acciones no previstas, manejo inseguro de la entrada que recibe el motor, y fallos en las herramientas de compilación o de pruebas o en sus dependencias.

**Fuera de alcance:** el contenido de una base de conocimiento (una fecha, una cita o un enlace a la fuente equivocados en los datos que pasas al motor) no es un problema de seguridad. Los sitios web y productos comerciales construidos sobre este proyecto no están cubiertos por esta política.

### Cómo informar una vulnerabilidad

Infórmala **en privado**. No abras un issue público.

- **Canal preferente:** el reporte privado de vulnerabilidades de GitHub, desde la pestaña **Security** de este repositorio («Report a vulnerability»).
- **Alternativa:** correo a **legal@vreinn.com**.

Incluye una descripción del problema, los archivos o versiones afectados, los pasos para reproducirlo y su posible impacto.

### Respuesta

En la medida de lo posible (best effort), VREINN SAS procura acusar recibo de un informe en un plazo de 5 días hábiles y enviar una actualización de estado en 30 días, y te mantendrá al tanto mientras se resuelve el problema.

Danos un tiempo razonable para corregir el problema antes de divulgarlo públicamente.
