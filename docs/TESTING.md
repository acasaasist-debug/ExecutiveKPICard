# Executive KPI Card - Testing Guide

## Pruebas Unitarias (Jest)

El proyecto utiliza Jest y `ts-jest` para ejecutar pruebas unitarias.

### Ejecución
Para correr todas las pruebas unitarias:
```bash
npm test
```

Para correr las pruebas con cobertura:
```bash
npm test -- --coverage
```

### Estructura de pruebas
Las pruebas se ubican en la carpeta `test/` y terminan con la extensión `.spec.ts`.
- `dataViewService.spec.ts`: Verifica la extracción segura de datos, roles, formatos y manejo de DataViews ausentes o corruptos.
- `kpiCalculationService.spec.ts`: Verifica la matemática detrás del cálculo de variaciones, cumplimientos, progresos limitados (clamp) y estados.
- `colorService.spec.ts`: Verifica que los colores cambian correctamente de acuerdo con lógicas normales e invertidas.
- `numberFormattingService.spec.ts`: Prueba que la librería de formato numérico base asigne texto correctamente a nulos y porcentajes.

## Pruebas de Calidad de Código (Lint)

Para verificar que el código sigue los estándares (ESLint):
```bash
npm run lint
```

## Verificación de empaquetado

Para validar la correcta construcción del visual `.pbiviz`:
```bash
npm run package
npm run verify
```

## Estado de Fases de Desarrollo

- **FASE 1 a FASE 4:** APROBADAS
- **FASE 5A:** APROBADA (Layout funcional, parseo y formato numérico)
- **FASE 5B:** APROBADA (Layout vertical adaptativo, barras de progreso, metas y comparación). Alcanzó 172 pruebas exitosas en Jest.
- **FASE 5C:** PENDIENTE
