import { normalizeRenderSettings } from "../src/utils/renderSettingsNormalizer";

describe("Render Settings Normalizer", () => {
    let mockGeneralCard: any;
    let mockTitleCard: any;
    let mockActualValueCard: any;
    let mockComparisonCard: any;
    let mockTargetCard: any;
    let mockProgressCard: any;
    let mockStatusCard: any;
    let mockResponsiveCard: any;

    beforeEach(() => {
        mockGeneralCard = {
            backgroundColor: { value: { value: "#ffffff" } },
            transparency: { value: 0 },
            borderOn: { value: false },
            borderColor: { value: { value: "#000000" } },
            borderThickness: { value: 1 },
            cornerRadius: { value: 0 },
            padding: { value: 10 },
            topLineOn: { value: false },
            topLineUseStatusColor: { value: false },
            topLineThickness: { value: 4 },
            topLineColor: { value: { value: "#000000" } }
        };
        mockTitleCard = {
            show: { value: true },
            fontFamily: { value: "Arial" },
            fontSize: { value: 14 },
            bold: { value: true },
            color: { value: { value: "#333333" } },
            alignment: { value: "left" },
            bottomMargin: { value: 5 }
        };
        mockActualValueCard = {
            show: { value: true },
            useModelFormat: { value: true },
            fontFamily: { value: "Arial" },
            fontSize: { value: 24 },
            bold: { value: true },
            color: { value: { value: "#000000" } },
            alignment: { value: "left" },
            displayUnits: { value: 0 },
            decimalPlaces: { value: 2 },
            prefix: { value: "" },
            suffix: { value: "" },
            thousandsSeparator: { value: true },
            showDashIfNull: { value: false }
        };
        mockComparisonCard = {
            show: { value: true },
            showPeriod: { value: true },
            defaultPeriodText: { value: "vs prior" },
            showVariation: { value: true },
            showArrow: { value: true },
            fontFamily: { value: "Arial" },
            fontSize: { value: 12 },
            positiveColor: { value: { value: "#00ff00" } },
            negativeColor: { value: { value: "#ff0000" } },
            neutralColor: { value: { value: "#888888" } },
            invertLogic: { value: false },
            percentageDecimals: { value: 1 },
            noComparisonText: { value: "-" }
        };
        mockTargetCard = {
            show: { value: true },
            inheritValueFormat: { value: true },
            label: { value: "Goal: " },
            fontFamily: { value: "Arial" },
            fontSize: { value: 12 },
            color: { value: { value: "#555555" } },
            displayUnits: { value: 0 },
            decimalPlaces: { value: 0 },
            prefix: { value: "" },
            suffix: { value: "" }
        };
        mockProgressCard = {
            show: { value: true },
            height: { value: 10 },
            radius: { value: 5 },
            backgroundColor: { value: { value: "#eeeeee" } },
            useStatusColor: { value: true },
            customColor: { value: { value: "#0000ff" } },
            showPercentage: { value: true },
            percentageSize: { value: 10 },
            percentageColor: { value: { value: "#444444" } },
            decimalPlaces: { value: 0 },
            showOverachievementMark: { value: true },
            markColor: { value: { value: "#111111" } },
            markThickness: { value: 2 }
        };
        mockStatusCard = {
            show: { value: true },
            statusSource: { value: { value: "auto" } },
            showCircle: { value: true },
            circleSize: { value: 8 },
            fontFamily: { value: "Segoe UI" },
            fontSize: { value: 12 },
            color: { value: { value: "#6B7280" } },
            successThreshold: { value: 1.0 },
            warningThreshold: { value: 0.9 },
            successText: { value: "Cumpliendo" },
            warningText: { value: "En camino" },
            dangerText: { value: "En riesgo" },
            noDataText: { value: "Sin información" },
            successColor: { value: { value: "#16A34A" } },
            warningColor: { value: { value: "#F59E0B" } },
            dangerColor: { value: { value: "#DC2626" } },
            neutralColor: { value: { value: "#6B7280" } }
        };

        mockResponsiveCard = {
            autoScale: { value: true },
            minWidth: { value: 180 },
            minHeight: { value: 140 },
            hideSecondary: { value: true },
            compactMode: { value: true }
        };
    });

    it("should clamp progress height between 4 and 40", () => {
        mockProgressCard.height.value = 2;
        let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.progress.height).toBe(4);

        mockProgressCard.height.value = 50;
        settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.progress.height).toBe(40);
    });

    it("should clamp progress radius between 0 and 20", () => {
        mockProgressCard.radius.value = -5;
        let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.progress.effectiveRadius).toBeGreaterThanOrEqual(0); // Also limited by height/2

        mockProgressCard.height.value = 40; // Max height so max effective radius can be 20
        mockProgressCard.radius.value = 30;
        settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.progress.effectiveRadius).toBe(20);
    });

    it("should compute effectiveRadius correctly", () => {
        // height = 10 -> height / 2 = 5. Even if radius = 10, it should be 5
        mockProgressCard.height.value = 10;
        mockProgressCard.radius.value = 10;
        let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.progress.effectiveRadius).toBe(5);
        
        mockProgressCard.radius.value = 3;
        settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.progress.effectiveRadius).toBe(3);
    });

    it("should validate and fallback hex colors", () => {
        mockProgressCard.backgroundColor.value.value = "invalid";
        const settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.progress.backgroundColor).toBe("#E5E7EB");
    });

    it("should handle undefined safeText properly", () => {
        mockComparisonCard.defaultPeriodText.value = null;
        let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.comparison.defaultPeriodText).toBe("vs período anterior");
        
        mockTargetCard.label.value = undefined;
        settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.target.label).toBe("Meta: ");
    });

    it("should clamp comparison font size between 8 and 36", () => {
        mockComparisonCard.fontSize.value = 5;
        let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.comparison.fontSize).toBe(8);

        mockComparisonCard.fontSize.value = 50;
        settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.comparison.fontSize).toBe(36);
    });

    it("should clamp decimal places for comparison, target and progress", () => {
        mockComparisonCard.percentageDecimals.value = -1;
        mockTargetCard.decimalPlaces.value = -1;
        mockProgressCard.decimalPlaces.value = -1;
        
        let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.comparison.percentageDecimals).toBe(0);
        expect(settings.target.decimalPlaces).toBe(0);
        expect(settings.progress.decimalPlaces).toBe(0);

        mockComparisonCard.percentageDecimals.value = 10;
        mockTargetCard.decimalPlaces.value = 15;
        mockProgressCard.decimalPlaces.value = 10;
        
        settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.comparison.percentageDecimals).toBe(5);
        expect(settings.target.decimalPlaces).toBe(10);
        expect(settings.progress.decimalPlaces).toBe(5);
    });

    it("should clamp progress markThickness between 1 and 10", () => {
        mockProgressCard.markThickness.value = 0;
        let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.progress.markThickness).toBe(1);

        mockProgressCard.markThickness.value = 20;
        settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.progress.markThickness).toBe(10);
    });

    it("should handle undefined, null, NaN and Infinity values safely", () => {
        mockTargetCard.fontSize.value = NaN;
        mockComparisonCard.percentageDecimals.value = Infinity;
        mockProgressCard.height.value = undefined;

        let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.target.fontSize).toBe(8); // Default lower bound clamp
        expect(settings.comparison.percentageDecimals).toBe(0); // Default lower bound clamp for non-finite
        expect(settings.progress.height).toBe(4); // Default lower bound clamp
    });

    it("should sanitize empty strings for fallback texts", () => {
        mockComparisonCard.noComparisonText.value = "   ";
        let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        expect(settings.comparison.noComparisonText).toBe("-");
    });

    it("should ensure the result object has no mutable references to FormattingSettings", () => {
        let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        
        // Mutate original mock
        mockProgressCard.height.value = 40;
        mockGeneralCard.backgroundColor.value.value = "#000000";

        // Assert settings object did not change
        expect(settings.progress.height).toBe(10);
        expect(settings.general.backgroundColor).toBe("#ffffff");
    });

    it("should ensure all number outputs are finite", () => {
        let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        
        expect(isFinite(settings.general.transparency)).toBe(true);
        expect(isFinite(settings.general.borderThickness)).toBe(true);
        expect(isFinite(settings.comparison.fontSize)).toBe(true);
        expect(isFinite(settings.progress.effectiveRadius)).toBe(true);
    });

    it("should default title and actual alignment to center if invalid", () => {
        mockTitleCard.alignment.value = "";
        mockActualValueCard.alignment.value = "   ";
        let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
        
        expect(settings.title.alignment).toBe("center");
        expect(settings.actualValue.alignment).toBe("center");
    });

    describe("Status Normalization", () => {
        it("should clamp circleSize between 2 and 24", () => {
            mockStatusCard.circleSize.value = 1;
            let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
            expect(settings.status.circleSize).toBe(2);

            mockStatusCard.circleSize.value = 50;
            settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
            expect(settings.status.circleSize).toBe(24);
        });

        it("should sanitize statusSource enum", () => {
            mockStatusCard.statusSource.value.value = "invalid";
            let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
            expect(settings.status.statusSource).toBe("auto");

            mockStatusCard.statusSource.value = null; // edge case
            settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
            expect(settings.status.statusSource).toBe("auto");
        });

        it("should handle inverted thresholds by making effectiveSuccess >= effectiveWarning", () => {
            mockStatusCard.successThreshold.value = 0.5;
            mockStatusCard.warningThreshold.value = 0.9; // inverted mathematically for achievement
            let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
            
            expect(settings.status.effectiveSuccessThreshold).toBe(0.9);
            expect(settings.status.effectiveWarningThreshold).toBe(0.5);
        });
        
        it("should trim and fallback empty custom texts", () => {
            mockStatusCard.successText.value = "  ";
            mockStatusCard.dangerText.value = undefined;
            let settings = normalizeRenderSettings(mockGeneralCard, mockTitleCard, mockActualValueCard, mockComparisonCard, mockTargetCard, mockProgressCard, mockStatusCard, mockResponsiveCard);
            
            expect(settings.status.successText).toBe("Cumpliendo");
            expect(settings.status.dangerText).toBe("En riesgo");
        });
    });
});
