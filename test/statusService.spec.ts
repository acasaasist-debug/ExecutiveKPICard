import { StatusService } from "../src/services/statusService";
import { RenderSettings } from "../src/models/visualState";

describe("StatusService", () => {
    let mockSettings: RenderSettings["status"];

    beforeEach(() => {
        mockSettings = {
            show: true,
            statusSource: "auto",
            showCircle: true,
            circleSize: 8,
            fontFamily: "Segoe UI",
            fontSize: 12,
            textColor: "#111111",
            effectiveSuccessThreshold: 1.0,
            effectiveWarningThreshold: 0.9,
            successText: "Custom Success",
            warningText: "Custom Warning",
            dangerText: "Custom Danger",
            noDataText: "Custom NoData",
            successColor: "#00FF00",
            warningColor: "#FFFF00",
            dangerColor: "#FF0000",
            neutralColor: "#888888"
        };
    });

    describe("Classification", () => {
        it("should classify as neutral if achievement is null", () => {
            const result = StatusService.resolve(null, null, null, mockSettings);
            expect(result.category).toBe("neutral");
        });

        it("should classify as neutral if achievement is not finite", () => {
            const result = StatusService.resolve(NaN, null, null, mockSettings);
            expect(result.category).toBe("neutral");
        });

        it("should classify as success if achievement >= effectiveSuccessThreshold", () => {
            const result = StatusService.resolve(1.0, null, null, mockSettings);
            expect(result.category).toBe("success");
            const result2 = StatusService.resolve(1.5, null, null, mockSettings);
            expect(result2.category).toBe("success");
        });

        it("should classify as warning if effectiveWarningThreshold <= achievement < effectiveSuccessThreshold", () => {
            const result = StatusService.resolve(0.9, null, null, mockSettings);
            expect(result.category).toBe("warning");
            const result2 = StatusService.resolve(0.95, null, null, mockSettings);
            expect(result2.category).toBe("warning");
        });

        it("should classify as danger if achievement < effectiveWarningThreshold", () => {
            const result = StatusService.resolve(0.89, null, null, mockSettings);
            expect(result.category).toBe("danger");
            const result2 = StatusService.resolve(0.0, null, null, mockSettings);
            expect(result2.category).toBe("danger");
            const result3 = StatusService.resolve(-0.5, null, null, mockSettings);
            expect(result3.category).toBe("danger");
        });

        it("should handle equal thresholds by dropping warning band", () => {
            mockSettings.effectiveSuccessThreshold = 1.0;
            mockSettings.effectiveWarningThreshold = 1.0;
            const successResult = StatusService.resolve(1.0, null, null, mockSettings);
            expect(successResult.category).toBe("success");

            const dangerResult = StatusService.resolve(0.99, null, null, mockSettings);
            expect(dangerResult.category).toBe("danger");
        });
    });

    describe("Mode: AUTO", () => {
        beforeEach(() => {
            mockSettings.statusSource = "auto";
        });

        it("should return auto text and colors for success", () => {
            const result = StatusService.resolve(1.0, "Ignored", "#000000", mockSettings);
            expect(result.text).toBe("Cumpliendo");
            expect(result.color).toBe("#16A34A");
        });

        it("should return auto text and colors for warning", () => {
            const result = StatusService.resolve(0.95, "Ignored", "#000000", mockSettings);
            expect(result.text).toBe("En camino");
            expect(result.color).toBe("#F59E0B");
        });

        it("should return auto text and colors for danger", () => {
            const result = StatusService.resolve(0.5, "Ignored", "#000000", mockSettings);
            expect(result.text).toBe("En riesgo");
            expect(result.color).toBe("#DC2626");
        });

        it("should return auto text and colors for neutral", () => {
            const result = StatusService.resolve(null, "Ignored", "#000000", mockSettings);
            expect(result.text).toBe("Sin información");
            expect(result.color).toBe("#6B7280");
        });
    });

    describe("Mode: DATA", () => {
        beforeEach(() => {
            mockSettings.statusSource = "data";
        });

        it("should use data text and data color when both are valid", () => {
            const result = StatusService.resolve(1.0, "Valid Data", "#123456", mockSettings);
            expect(result.text).toBe("Valid Data");
            expect(result.color).toBe("#123456");
        });

        it("should fallback to auto text when data text is empty, but keep data color", () => {
            const result = StatusService.resolve(1.0, "   ", "#123456", mockSettings);
            expect(result.text).toBe("Cumpliendo"); // fallback to success auto text
            expect(result.color).toBe("#123456");
        });

        it("should fallback to auto text when data text is null", () => {
            const result = StatusService.resolve(1.0, null, "#123456", mockSettings);
            expect(result.text).toBe("Cumpliendo");
            expect(result.color).toBe("#123456");
        });

        it("should fallback to auto color when data color is invalid, but keep data text", () => {
            const result = StatusService.resolve(1.0, "Valid Data", "invalid", mockSettings);
            expect(result.text).toBe("Valid Data");
            expect(result.color).toBe("#16A34A"); // fallback to success auto color
        });

        it("should fallback to auto color when data color is null", () => {
            const result = StatusService.resolve(1.0, "Valid Data", null, mockSettings);
            expect(result.text).toBe("Valid Data");
            expect(result.color).toBe("#16A34A");
        });
        
        it("should fallback to auto text and color when both are invalid/null", () => {
            const result = StatusService.resolve(1.0, null, null, mockSettings);
            expect(result.text).toBe("Cumpliendo");
            expect(result.color).toBe("#16A34A");
        });
    });

    describe("Mode: CUSTOM", () => {
        beforeEach(() => {
            mockSettings.statusSource = "custom";
        });

        it("should use custom texts and colors for success", () => {
            const result = StatusService.resolve(1.0, null, null, mockSettings);
            expect(result.text).toBe("Custom Success");
            expect(result.color).toBe("#00FF00");
        });

        it("should use custom texts and colors for warning", () => {
            const result = StatusService.resolve(0.95, null, null, mockSettings);
            expect(result.text).toBe("Custom Warning");
            expect(result.color).toBe("#FFFF00");
        });

        it("should use custom texts and colors for danger", () => {
            const result = StatusService.resolve(0.5, null, null, mockSettings);
            expect(result.text).toBe("Custom Danger");
            expect(result.color).toBe("#FF0000");
        });

        it("should use custom texts and colors for neutral", () => {
            const result = StatusService.resolve(null, null, null, mockSettings);
            expect(result.text).toBe("Custom NoData");
            expect(result.color).toBe("#888888");
        });

        it("should fallback to auto text if custom text is empty", () => {
            mockSettings.successText = "   ";
            const result = StatusService.resolve(1.0, null, null, mockSettings);
            expect(result.text).toBe("Cumpliendo");
            expect(result.color).toBe("#00FF00");
        });

        it("should fallback to auto color if custom color is invalid", () => {
            mockSettings.successColor = "not-a-color";
            const result = StatusService.resolve(1.0, null, null, mockSettings);
            expect(result.text).toBe("Custom Success");
            expect(result.color).toBe("#16A34A");
        });
    });
});
