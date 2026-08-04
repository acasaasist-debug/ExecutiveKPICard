import { ColorService } from "../src/services/colorService";
import { isValidHexColor, normalizeHexColor } from "../src/utils/validationUtils";

describe("ColorService", () => {
    let service: ColorService;

    beforeEach(() => {
        service = new ColorService();
    });

    describe("Hex Color Validation", () => {
        // 1. Acepta #RGB
        it("accepts #RGB", () => {
            expect(isValidHexColor("#abc")).toBe(true);
        });

        // 2. Acepta #RRGGBB
        it("accepts #RRGGBB", () => {
            expect(isValidHexColor("#aabbcc")).toBe(true);
        });

        // 3. Acepta #RGBA
        it("accepts #RGBA", () => {
            expect(isValidHexColor("#abcd")).toBe(true);
        });

        // 4. Acepta #RRGGBBAA
        it("accepts #RRGGBBAA", () => {
            expect(isValidHexColor("#aabbccdd")).toBe(true);
        });

        // 5. Rechaza colores hexadecimales inválidos.
        it("rejects invalid hex colors", () => {
            expect(isValidHexColor("#ab")).toBe(false);
            expect(isValidHexColor("#abcde")).toBe(false);
            expect(isValidHexColor("aabbcc")).toBe(false);
            expect(isValidHexColor("#gggggg")).toBe(false);
        });

        // 6. Rechaza expresiones CSS arbitrarias como rgb(), var() y url().
        it("rejects arbitrary CSS expressions", () => {
            expect(isValidHexColor("rgb(255, 255, 255)")).toBe(false);
            expect(isValidHexColor("var(--my-color)")).toBe(false);
            expect(isValidHexColor("url('image.png')")).toBe(false);
        });

        // 7. Normaliza colores cuando corresponda.
        it("normalizes valid colors", () => {
            expect(normalizeHexColor("#aabbcc", "#000000")).toBe("#aabbcc");
        });

        // 8. Usa fallback para colores inválidos.
        it("uses fallback for invalid colors", () => {
            expect(normalizeHexColor("invalid", "#123456")).toBe("#123456");
        });
    });

    describe("Variation Color", () => {
        // 15. Variación cero usa neutral.
        it("returns neutral color for null or zero variation", () => {
            expect(service.getVariationColor(undefined, null, false, "#16A34A", "#DC2626", "#6B7280")).toBe("#6B7280");
            expect(service.getVariationColor(undefined, 0, false, "#16A34A", "#DC2626", "#6B7280")).toBe("#6B7280");
        });

        // 11. Variación positiva normal.
        it("returns positive color for positive variation with normal logic", () => {
            expect(service.getVariationColor(undefined, 0.5, false, "#16A34A", "#DC2626", "#6B7280")).toBe("#16A34A");
        });

        // 12. Variación negativa normal.
        it("returns negative color for negative variation with normal logic", () => {
            expect(service.getVariationColor(undefined, -0.5, false, "#16A34A", "#DC2626", "#6B7280")).toBe("#DC2626");
        });

        // 13. Variación positiva invertida.
        it("returns negative color for positive variation with inverted logic", () => {
            expect(service.getVariationColor(undefined, 0.5, true, "#16A34A", "#DC2626", "#6B7280")).toBe("#DC2626");
        });

        // 14. Variación negativa invertida.
        it("returns positive color for negative variation with inverted logic", () => {
            expect(service.getVariationColor(undefined, -0.5, true, "#16A34A", "#DC2626", "#6B7280")).toBe("#16A34A");
        });

        it("validates data-driven variation color", () => {
            expect(service.getVariationColor("#7C3AED", -0.5, false, "#16A34A", "#DC2626", "#6B7280")).toBe("#7C3AED");
            expect(service.getVariationColor("invalid", -0.5, false, "#16A34A", "#DC2626", "#6B7280")).toBe("#DC2626");
        });
    });

    describe("Status Color", () => {
        it("validates data-driven status color", () => {
            expect(service.getStatusColor("#7C3AED", "#16A34A")).toBe("#7C3AED");
            expect(service.getStatusColor("invalid", "#16A34A")).toBe("#16A34A");
            expect(service.getStatusColor(undefined, "#16A34A")).toBe("#16A34A");
        });
    });
});
