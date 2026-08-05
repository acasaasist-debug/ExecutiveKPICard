import { StatusService } from "../src/services/statusService";
import { RenderSettings } from "../src/models/visualState";
import { LocalizeFn } from "../src/services/statusService";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Spanish localize fn — simulates es-ES locale for auto mode labels. */
const es: LocalizeFn = (key, fallback) => {
    const map: Record<string, string> = {
        "Status_AutoSuccess": "Cumpliendo",
        "Status_AutoWarning": "En camino",
        "Status_AutoDanger":  "En riesgo",
        "Status_AutoNeutral": "Sin información",
    };
    return map[key] ?? fallback;
};

/** English localize fn — simulates en-US locale. */
const en: LocalizeFn = (key, fallback) => {
    const map: Record<string, string> = {
        "Status_AutoSuccess": "On Track",
        "Status_AutoWarning": "At Risk",
        "Status_AutoDanger":  "Off Track",
        "Status_AutoNeutral": "No Data",
    };
    return map[key] ?? fallback;
};

// ── Tests ─────────────────────────────────────────────────────────────────────

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

    describe("Mode: AUTO — no localize fn (English fallback)", () => {
        beforeEach(() => {
            mockSettings.statusSource = "auto";
        });

        it("should return English fallback text for success when no localize fn", () => {
            const result = StatusService.resolve(1.0, "Ignored", "#000000", mockSettings);
            expect(result.text).toBe("On Track");
            expect(result.color).toBe("#16A34A");
        });

        it("should return English fallback text for warning when no localize fn", () => {
            const result = StatusService.resolve(0.95, "Ignored", "#000000", mockSettings);
            expect(result.text).toBe("At Risk");
            expect(result.color).toBe("#F59E0B");
        });

        it("should return English fallback text for danger when no localize fn", () => {
            const result = StatusService.resolve(0.5, "Ignored", "#000000", mockSettings);
            expect(result.text).toBe("Off Track");
            expect(result.color).toBe("#DC2626");
        });

        it("should return English fallback text for neutral when no localize fn", () => {
            const result = StatusService.resolve(null, "Ignored", "#000000", mockSettings);
            expect(result.text).toBe("No Data");
            expect(result.color).toBe("#6B7280");
        });
    });

    describe("Mode: AUTO — es-ES localize fn", () => {
        beforeEach(() => {
            mockSettings.statusSource = "auto";
        });

        it("should return Spanish text for success with es-ES localize", () => {
            const result = StatusService.resolve(1.0, null, null, mockSettings, es);
            expect(result.text).toBe("Cumpliendo");
            expect(result.color).toBe("#16A34A");
        });

        it("should return Spanish text for warning with es-ES localize", () => {
            const result = StatusService.resolve(0.95, null, null, mockSettings, es);
            expect(result.text).toBe("En camino");
            expect(result.color).toBe("#F59E0B");
        });

        it("should return Spanish text for danger with es-ES localize", () => {
            const result = StatusService.resolve(0.5, null, null, mockSettings, es);
            expect(result.text).toBe("En riesgo");
            expect(result.color).toBe("#DC2626");
        });

        it("should return Spanish text for neutral with es-ES localize", () => {
            const result = StatusService.resolve(null, null, null, mockSettings, es);
            expect(result.text).toBe("Sin información");
            expect(result.color).toBe("#6B7280");
        });
    });

    describe("Mode: AUTO — en-US localize fn", () => {
        beforeEach(() => {
            mockSettings.statusSource = "auto";
        });

        it("should return English text for success with en-US localize", () => {
            const result = StatusService.resolve(1.0, null, null, mockSettings, en);
            expect(result.text).toBe("On Track");
        });

        it("should return English text for warning with en-US localize", () => {
            const result = StatusService.resolve(0.95, null, null, mockSettings, en);
            expect(result.text).toBe("At Risk");
        });

        it("should return English text for danger with en-US localize", () => {
            const result = StatusService.resolve(0.5, null, null, mockSettings, en);
            expect(result.text).toBe("Off Track");
        });

        it("should return English text for neutral with en-US localize", () => {
            const result = StatusService.resolve(null, null, null, mockSettings, en);
            expect(result.text).toBe("No Data");
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

        it("should fallback to auto text when data text is empty (en fallback)", () => {
            const result = StatusService.resolve(1.0, "   ", "#123456", mockSettings);
            expect(result.text).toBe("On Track"); // en fallback
            expect(result.color).toBe("#123456");
        });

        it("should fallback to es auto text when data text is empty and es localize passed", () => {
            const result = StatusService.resolve(1.0, "   ", "#123456", mockSettings, es);
            expect(result.text).toBe("Cumpliendo");
            expect(result.color).toBe("#123456");
        });

        it("should fallback to auto text when data text is null", () => {
            const result = StatusService.resolve(1.0, null, "#123456", mockSettings, en);
            expect(result.text).toBe("On Track");
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
            const result = StatusService.resolve(1.0, null, null, mockSettings, en);
            expect(result.text).toBe("On Track");
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

        it("should fallback to auto text (en) if custom text is empty", () => {
            mockSettings.successText = "   ";
            const result = StatusService.resolve(1.0, null, null, mockSettings);
            expect(result.text).toBe("On Track");
            expect(result.color).toBe("#00FF00");
        });

        it("should fallback to es auto text if custom text is empty and es localize passed", () => {
            mockSettings.successText = "   ";
            const result = StatusService.resolve(1.0, null, null, mockSettings, es);
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
