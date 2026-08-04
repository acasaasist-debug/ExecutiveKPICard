# Changelog

## [1.0.0.4] - 2026-08-04

### Resolved
- **KI-001**: El valor y el título se ocultaban al agregar el rol Título. Resuelto en el ciclo de vida (Resize sin DataView preserva DataView y actualiza layout adaptativo).

### Changed
- **Fase 5B - Corrección del Layout Vertical**: Implementación de algoritmo de distribución vertical adaptativa con base en pesos y centrado geométrico. La tarjeta ahora se expande equilibradamente al aumentar el height del viewport.
- Incremento de pruebas a 172 afirmaciones exitosas.

## [1.0.0.3] - 2026-08-04

### Added
- **Fase 5B - Componentes Funcionales**: 
  - Tarjeta de Comparación (variación, color por lógica directa/invertida).
  - Tarjeta de Meta (Target) con formateo heredado.
  - Tarjeta de Progreso (barra horizontal con marcas y colores dinámicos).
  - Tarjeta de Estado automático.

## [1.0.0.2] - 2026-08-04

### Fixed
- Detección de estados transitorios (`TransientIncomplete`) durante la actualización de PBI.

## [1.0.0.1] - 2026-08-04

### Added
- **Fase 5A**: Layout base con rol Título y Valor actual.
