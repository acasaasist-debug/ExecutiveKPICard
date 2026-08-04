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

    // 2. Trend up.
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
