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
});
