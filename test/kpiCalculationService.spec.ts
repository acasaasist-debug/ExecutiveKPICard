import { KpiCalculationService } from "../src/services/kpiCalculationService";
import { StatusType } from "../src/models/enums";

describe("KpiCalculationService", () => {
    let service: KpiCalculationService;

    beforeEach(() => {
        service = new KpiCalculationService();
    });

    // 1. achievement explícito tiene prioridad sobre actualValue / target.
    it("gives priority to explicit achievement over actualValue/target", () => {
        expect(service.calculateAchievement(10, 100, 0.5)).toBe(0.5);
    });

    // 2. Estado Neutral cuando achievement es null.
    it("returns Neutral status when achievement is null", () => {
        const result = service.calculateStatus(null, "auto");
        expect(result.statusType).toBe(StatusType.Neutral);
    });

    // 3. Tendencia up.
    // 4. Tendencia down.
    // 5. Tendencia neutral.
    // 6. Tendencia unavailable.
    // 7. Variación igual a cero.
    it("calculates correct trend", () => {
        expect(service.calculateTrend(0.5)).toBe("up");
        expect(service.calculateTrend(-0.5)).toBe("down");
        expect(service.calculateTrend(0)).toBe("neutral"); // Variation = 0
        expect(service.calculateTrend(null)).toBe("unavailable");
        expect(service.calculateTrend(undefined as any)).toBe("unavailable");
    });

    // 8. Achievement negativo produce progressRatio 0.
    // 9. Achievement mayor que 1 produce progressRatio 1.
    it("clamps progressRatio", () => {
        expect(service.getProgressRatio(-0.5)).toBe(0);
        expect(service.getProgressRatio(1.5)).toBe(1);
    });

    // 10. Estado modo Data con status
    it("uses Data mode when valid status provided", () => {
        const result = service.calculateStatus(0.5, "data", 1.0, 0.9, "My Status");
        // Achievement is 0.5 (Danger in auto). But data mode overrides text.
        // Wait, does data mode override statusType? The logic preserves autoResult.statusType but overrides text/color.
        expect(result.statusType).toBe(StatusType.Danger);
        expect(result.text).toBe("My Status");
        expect(result.autoColor).toBe("#DC2626"); // Danger color
    });

    // 11. Modo Data usa automático como fallback cuando los datos son inválidos.
    it("uses auto fallback in Data mode when data status is invalid/empty", () => {
        const result = service.calculateStatus(0.5, "data", 1.0, 0.9, undefined);
        expect(result.statusType).toBe(StatusType.Danger);
        expect(result.text).toBe("En riesgo");
    });

    // 12. Modo Custom conserva la interfaz preparada.
    it("preserves interface in Custom mode", () => {
        const result = service.calculateStatus(0.5, "custom", 1.0, 0.9, undefined, "CustomText");
        expect(result.statusType).toBe(StatusType.Danger);
        expect(result.text).toBe("CustomText");
        expect(result.autoColor).toBe("#DC2626");
    });

    // 13. Favorabilidad con lógica normal.
    it("is favorable when positive and normal logic", () => {
        expect(service.isVariationFavorable(0.5, false)).toBe(true);
        expect(service.isVariationFavorable(-0.5, false)).toBe(false);
    });

    // 14. Favorabilidad con lógica invertida.
    it("is favorable when negative and inverted logic", () => {
        expect(service.isVariationFavorable(-0.5, true)).toBe(true);
        expect(service.isVariationFavorable(0.5, true)).toBe(false);
        expect(service.isVariationFavorable(0, true)).toBe(false);
        expect(service.isVariationFavorable(null, true)).toBe(false);
    });
});
