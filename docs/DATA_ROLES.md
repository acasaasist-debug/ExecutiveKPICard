# Data Roles

El visual `ExecutiveKpiCard` utiliza los siguientes roles de datos definidos en `capabilities.json`.

| Nombre Interno | Nombre Visible | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `title` | Título | GroupingOrMeasure (Text) | No | Título principal del indicador. |
| `actualValue` | Valor actual | Measure (Numeric) | Sí | Resultado principal del KPI. |
| `previousValue` | Valor anterior | Measure (Numeric) | No | Valor del período anterior. Usado para calcular variación si no se da. |
| `variation` | Variación % | Measure (Numeric) | No | Variación decimal frente al período anterior (ej: 0.268 = 26.8%). |
| `target` | Meta | Measure (Numeric) | No | Meta u objetivo del período. |
| `achievement` | Cumplimiento % | Measure (Numeric) | No | Cumplimiento decimal (ej: 0.9 = 90%). Usado para estado automático. |
| `status` | Estado | GroupingOrMeasure (Text) | No | Texto de estado (ej: Cumpliendo, En camino, En riesgo). |
| `comparisonPeriod` | Período comparado | GroupingOrMeasure (Text) | No | Texto descriptivo del período (ej: vs abril 2026). |
| `statusColor` | Color del estado | GroupingOrMeasure (Text) | No | Color hexadecimal proporcionado desde datos (ej: #16A34A). |
| `variationColor`| Color de variación | GroupingOrMeasure (Text) | No | Color hexadecimal proporcionado desde datos para la variación. |
| `trendIcon` | Indicador de tendencia | GroupingOrMeasure (Text) | No | Símbolo opcional (▲, ▼, ■). |

## Reglas
- El visual debe manejar graciosamente los roles omitidos.
- Si solo hay `actualValue`, se muestra un layout minimizado.
- Si falta `actualValue`, se muestra la **Landing Page**.
