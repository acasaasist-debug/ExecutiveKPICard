# Known Issues — Executive KPI Card

## KI-001 — Título y valor ocultos al asignar el rol Título en instancia nueva

| Campo | Detalle |
|-------|---------|
| **ID** | KI-001 |
| **Fase** | 5A (aceptada provisionalmente) |
| **Versión detectada** | 1.0.0.1 |
| **Versión en la que persiste** | 1.0.0.2 |
| **Estado** | Abierto — no bloquea la Fase 5B |
| **Severidad** | Media |

### Síntomas

En una instancia nueva del visual:

1. Se asigna una medida al rol **Valor actual** → el valor aparece correctamente.
2. Se asigna una medida al rol **Título**.
3. El título y el valor pueden quedar **ocultos** sin interacción adicional.
4. Al desplegar la tarjeta **Título** en el panel de formato, ambos elementos vuelven a aparecer.

### Causa raíz (parcialmente identificada)

Power BI emite un `update()` transitorio cuando se añade un nuevo rol (`title`). Durante ese update:

- `metadata.columns` ya incluye el rol `actualValue` y el nuevo `title`.
- `table.rows` está todavía vacío `[]`.

La clasificación `TransientIncomplete` implementada en la v1.0.0.2 detecta correctamente este estado y hace un `early-return` sin limpiar el SVG.

Sin embargo, el defecto **persiste en Power BI Desktop** a pesar de la corrección, lo que sugiere que el mecanismo de activación involucra un aspecto del ciclo de vida del host (posiblemente relacionado con `VisualUpdateType` o con el refresco del panel de formato) que aún no ha sido aislado y reproducido de forma determinista en las pruebas de integración.

### Correcciones aplicadas (no revertir)

- `DataViewReadStatus` enum en `src/models/dataViewStatus.ts`.
- Clasificación explícita en `DataViewService.parse()`.
- `lastStableState` / `lastStableData` / `lastStableLayout` en `Visual`.
- `TransientIncomplete` → early-return sin tocar SVG.
- Log diagnóstico estructurado en `update()` (pendiente de eliminar antes de producción).

### Workaround conocido

Desplegar cualquier tarjeta del panel de formato después de asignar el rol **Título** hace aparecer el visual correctamente.

### Condiciones para reabrirlo

Este defecto debe ser revisado si un cambio de la **Fase 5B** agrava el síntoma o introduce una nueva vía de ocultación de elementos.

---

*Última actualización: 2026-08-04*
