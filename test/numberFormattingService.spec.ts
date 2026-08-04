import { NumberFormattingService } from "../src/services/numberFormattingService";

describe("NumberFormattingService", () => {
    let service: NumberFormattingService;

    beforeEach(() => {
        service = new NumberFormattingService();
    });

    it("should handle null or invalid data", () => {
        expect(service.format(null)).toBe("—");
        expect(service.format(undefined as unknown as number)).toBe("—");
        expect(service.format(NaN)).toBe("—");
        
        expect(service.format(null, { showDashIfNull: false })).toBe("");
    });

    it("should format using default format if no options provided", () => {
        expect(service.format(1234.56)).toBe("1235");
    });

    it("should respect formatString when useModelFormat is true", () => {
        expect(service.format(1234.56, { useModelFormat: true, formatString: "0.00" })).toBe("1234.56");
        expect(service.format(0.5, { useModelFormat: true, formatString: "0 %" })).toBe("50 %");
    });

    it("should apply manual formatting when useModelFormat is false", () => {
        const result = service.format(1500000, {
            useModelFormat: false,
            displayUnits: 1000000,
            decimalPlaces: 1,
            prefix: "$",
            suffix: " usd"
        });
        expect(result).toBe("$1.5M usd");
    });

    it("should format negative numbers correctly with manual formatting", () => {
        const result = service.format(-2500, {
            useModelFormat: false,
            displayUnits: 1000,
            decimalPlaces: 1,
            prefix: "USD "
        });
        expect(result).toBe("USD -2.5K");
    });

    it("should format zero correctly with manual formatting", () => {
        const result = service.format(0, {
            useModelFormat: false,
            displayUnits: 1000,
            decimalPlaces: 2
        });
        expect(result).toContain("0.00");
    });

    it("should format thousands separator when useModelFormat is false", () => {
        const result = service.format(1234567, {
            useModelFormat: false,
            thousandsSeparator: true
        });
        expect(result).toBe("1,234,567");
    });

    describe("formatPercentage", () => {
        it("1. Variación con 0 decimales", () => {
            expect(service.formatPercentage(0.5, 0)).toBe("50 %");
        });
        it("2. Variación con 1 decimal", () => {
            expect(service.formatPercentage(0.512, 1)).toBe("51.2 %");
        });
        it("3. Variación con 5 decimales", () => {
            expect(service.formatPercentage(0.512345, 5)).toBe("51.23450 %");
        });
        it("4. Achievement con 0 decimales", () => {
            expect(service.formatPercentage(1.25, 0)).toBe("125 %");
        });
        it("5. Achievement con 2 decimales", () => {
            expect(service.formatPercentage(1.251, 2)).toBe("125.10 %");
        });
        it("6. Achievement con 5 decimales", () => {
            expect(service.formatPercentage(1.251234, 5)).toBe("125.12340 %");
        });
    });

    describe("formatTarget", () => {
        const dummyActualOptions = {
            useModelFormat: true,
            displayUnits: 1000,
            decimalPlaces: 1,
            prefix: "A",
            suffix: "B",
            thousandsSeparator: true
        };
        const dummyTargetOptions = {
            displayUnits: 1000000,
            decimalPlaces: 2,
            prefix: "C",
            suffix: "D"
        };

        it("7. Meta heredada con useModelFormat=true usa targetFormat", () => {
            expect(service.formatTarget(1500, "0.0", "0", true, dummyActualOptions, dummyTargetOptions)).toBe("1500.0");
        });
        it("8. targetFormat ausente usa actualValueFormat", () => {
            expect(service.formatTarget(1500, undefined, "0.00", true, dummyActualOptions, dummyTargetOptions)).toBe("1500.00");
        });
        it("9. Meta heredada con useModelFormat=false usa displayUnits de Valor principal", () => {
            const actualOptions = { ...dummyActualOptions, useModelFormat: false };
            const result = service.formatTarget(1500, undefined, undefined, true, actualOptions, dummyTargetOptions);
            expect(result).toContain("1.5K");
        });
        it("10. Hereda decimalPlaces", () => {
            const actualOptions = { ...dummyActualOptions, useModelFormat: false };
            const result = service.formatTarget(1500, undefined, undefined, true, actualOptions, dummyTargetOptions);
            expect(result).toContain("1.5");
        });
        it("11. Hereda thousandsSeparator", () => {
            const actualOptions = { ...dummyActualOptions, useModelFormat: false };
            const result = service.formatTarget(1500000, undefined, undefined, true, actualOptions, dummyTargetOptions);
            expect(result).toContain("1,500.0K");
        });
        it("12. Hereda prefix y suffix", () => {
            const actualOptions = { ...dummyActualOptions, useModelFormat: false };
            const result = service.formatTarget(1500, undefined, undefined, true, actualOptions, dummyTargetOptions);
            expect(result).toBe("A1.5KB");
        });
        it("13. inheritValueFormat=false usa opciones propias de Meta", () => {
            const actualOptions = { ...dummyActualOptions, useModelFormat: false };
            const result = service.formatTarget(1500000, undefined, undefined, false, actualOptions, dummyTargetOptions);
            expect(result).toBe("C1.50MD");
        });
        it("14. Nunca reutiliza el texto ya formateado de actualValue", () => {
            // It simply proves it formats from raw number
            const result = service.formatTarget(2500, undefined, undefined, false, dummyActualOptions, {
                displayUnits: 0, decimalPlaces: 0, prefix: "", suffix: ""
            });
            expect(result).toBe("2500");
        });
        it("15. Siempre formatea el valor raw de target", () => {
            const result = service.formatTarget(0.5, "0.0", undefined, true, dummyActualOptions, dummyTargetOptions);
            expect(result).toBe("0.5");
        });
    });
});
