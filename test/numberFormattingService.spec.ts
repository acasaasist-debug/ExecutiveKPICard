import { NumberFormattingService } from "../src/services/numberFormattingService";

describe("NumberFormattingService", () => {
    let service: NumberFormattingService;

    beforeEach(() => {
        service = new NumberFormattingService();
    });

    // 1. Decimal.
    it("formats decimal correctly", () => {
        expect(service.format(150.55, "0.00")).toBe("150.55");
    });

    // 2. Cero.
    it("formats zero correctly", () => {
        expect(service.format(0, "0")).toBe("0");
    });

    // 3. NaN.
    // 4. Infinity.
    it("handles NaN and Infinity safely", () => {
        expect(service.format(NaN, "0")).toBe("NaN");
        expect(service.format(Infinity, "0")).toBe("+Infinity");
        // Or whatever powerbi valueFormatter returns, usually it just stringifies if invalid, or returns 'NaN'.
    });

    // 5. Formato original de Power BI.
    it("uses default format when no format string provided", () => {
        expect(service.format(1234)).toBe("1234");
    });

    // 6. Prefijo.
    it("formats prefix correctly", () => {
        expect(service.format(150, "$0")).toBe("$150");
    });

    // 7. Sufijo.
    it("formats suffix correctly", () => {
        expect(service.format(150, "0 USD")).toBe("150 USD");
    });

    // 8. Prefijo y sufijo simultáneos.
    it("formats prefix and suffix correctly", () => {
        expect(service.format(150, "$0 USD")).toBe("$150 USD");
    });

    // 9. Separador de miles.
    it("formats thousands separator correctly", () => {
        expect(service.format(1500, "#,0")).toBe("1,500");
    });

    // 10. Miles.
    it("formats thousands shorthand correctly", () => {
        expect(service.format(1500, "0.0", 1000)).toBe("1.5K");
    });

    // 11. Millones.
    it("formats millions correctly", () => {
        expect(service.format(1500000, "0.0", 1000000)).toBe("1.5M");
    });

    // 12. Miles de millones.
    it("formats billions correctly", () => {
        expect(service.format(1500000000, "0.0", 1000000000)).toBe("1.5bn");
    });

    // 13. Decimales configurables.
    it("formats configurable decimals", () => {
        expect(service.format(1.2346, "0.0")).toBe("1.2");
        expect(service.format(1.2346, "0.000")).toBe("1.235");
    });

    // 14. Porcentaje con diferentes decimales.
    it("formats percentage with decimals", () => {
        expect(service.format(0.15, "0 %")).toBe("15 %");
        expect(service.format(0.152, "0.00 %")).toBe("15.20 %");
    });
});
