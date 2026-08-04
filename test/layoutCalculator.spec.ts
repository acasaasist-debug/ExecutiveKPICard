import { LayoutCalculator } from "../src/rendering/layoutCalculator";
import { LayoutMode } from "../src/models/layout";
import { VisualState } from "../src/models/visualState";

describe("LayoutCalculator", () => {
    let calculator: LayoutCalculator;

    beforeEach(() => {
        calculator = new LayoutCalculator();
        const mockContext = {
            measureText: jest.fn().mockReturnValue({ width: 50 }),
            font: ""
        };
        HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext) as any;
    });

    const createDummySettings = (): any => ({
        general: {
            backgroundColor: "#FFFFFF",
            transparency: 0,
            borderOn: true,
            borderColor: "#000000",
            borderThickness: 1,
            cornerRadius: 12,
            padding: 16,
            topLineOn: true,
            topLineUseStatusColor: true,
            topLineThickness: 3,
            topLineColor: "#000000"
        },
        title: {
            show: true,
            fontFamily: "Arial",
            fontSize: 14,
            bold: true,
            color: "#000000",
            alignment: "center",
            bottomMargin: 4
        },
        actualValue: {
            show: true,
            useModelFormat: true,
            fontFamily: "Arial",
            fontSize: 32,
            bold: true,
            color: "#000000",
            alignment: "center",
            displayUnits: 0,
            decimalPlaces: 0,
            prefix: "",
            suffix: "",
            thousandsSeparator: true,
            showDashIfNull: true
        },
        comparison: {
            show: true, showPeriod: true, defaultPeriodText: "vs prior", showVariation: true, showArrow: true, fontFamily: "Arial", fontSize: 12, positiveColor: "#16A34A", negativeColor: "#DC2626", neutralColor: "#6B7280", invertLogic: false, percentageDecimals: 1, noComparisonText: "-"
        },
        target: {
            show: true, inheritValueFormat: true, label: "Meta: ", fontFamily: "Arial", fontSize: 12, color: "#6B7280", displayUnits: 0, decimalPlaces: 0, prefix: "", suffix: ""
        },
        progress: {
            show: true, height: 4, radius: 2, backgroundColor: "#E5E7EB", useStatusColor: true, customColor: "#3B82F6", showPercentage: true, percentageSize: 12, percentageColor: "#6B7280", decimalPlaces: 0, showOverachievementMark: true, markColor: "#111827", markThickness: 2, effectiveRadius: 2
        }
    });

    const createDummyState = (): VisualState => ({
        hasData: true,
        hasActualValueRole: true,
        settings: createDummySettings(),
        title: { text: "Sales" },
        actual: { formattedValue: "1,234" },
        comparison: {
            period: "vs last month",
            formattedVariation: "+5.0 %",
            trend: "up",
            trendIcon: "▲",
            isFavorable: true
        },
        target: { formattedValue: "1,000" },
        achievement: { formattedValue: "123%", progressRatio: 1.23 },
        calculatedVariationColor: "#16A34A",
        calculatedStatusColor: "green",
        status: { text: "On Track" }
    });

    describe("Mode Determination", () => {
        it("returns NORMAL mode for 300x220", () => {
            const layout = calculator.calculate({ width: 300, height: 220 }, createDummyState());
            expect(layout.mode).toBe(LayoutMode.NORMAL);
            expect(layout.showTitle).toBe(true);
            expect(layout.showComparison).toBe(true);
            expect(layout.showTarget).toBe(true);
            expect(layout.showProgress).toBe(true);
            expect(layout.showStatus).toBe(true);
        });

        it("returns NORMAL mode at boundary 260x190", () => {
            const layout = calculator.calculate({ width: 260, height: 190 }, createDummyState());
            expect(layout.mode).toBe(LayoutMode.NORMAL);
        });

        it("returns COMPACT mode for 259x189", () => {
            const layout = calculator.calculate({ width: 259, height: 189 }, createDummyState());
            expect(layout.mode).toBe(LayoutMode.COMPACT);
        });

        it("returns COMPACT mode for 200x160", () => {
            const layout = calculator.calculate({ width: 200, height: 160 }, createDummyState());
            expect(layout.mode).toBe(LayoutMode.COMPACT);
        });

        it("returns COMPACT mode for 180x140 boundary", () => {
            const layout = calculator.calculate({ width: 180, height: 140 }, createDummyState());
            expect(layout.mode).toBe(LayoutMode.COMPACT);
        });

        it("returns MINIMUM mode for 179x139", () => {
            const layout = calculator.calculate({ width: 179, height: 139 }, createDummyState());
            expect(layout.mode).toBe(LayoutMode.MINIMUM);
            // Verify hidden elements in minimum mode
            expect(layout.showComparison).toBe(false); // Period hidden
            expect(layout.showTarget).toBe(false);
            expect(layout.showProgress).toBe(false);
        });

        it("returns MINIMUM mode for 120x100 without negative positions", () => {
            const layout = calculator.calculate({ width: 120, height: 100 }, createDummyState());
            expect(layout.title).toBeDefined();
            expect(layout.value!.y).toBeGreaterThan(0);
        });

        it("centers text horizontally by default", () => {
            const layout = calculator.calculate({ width: 300, height: 400 }, createDummyState());
            expect(layout.value!.x).toBeGreaterThanOrEqual(0);
            expect(layout.title!.x).toEqual(150);
        });
    });

    describe("Element Visibility", () => {
        it("hides title if missing", () => {
            const state = createDummyState();
            delete state.title;
            const layout = calculator.calculate({ width: 300, height: 220 }, state);
            expect(layout.showTitle).toBe(false);
            expect(layout.title).toBeUndefined();
        });

        it("hides comparison if missing", () => {
            const state = createDummyState();
            delete state.comparison;
            const layout = calculator.calculate({ width: 300, height: 220 }, state);
            expect(layout.showComparison).toBe(false);
            expect(layout.comparisonPeriod).toBeUndefined();
        });

        it("hides target if missing", () => {
            const state = createDummyState();
            delete state.target;
            const layout = calculator.calculate({ width: 300, height: 220 }, state);
            expect(layout.showTarget).toBe(false);
            expect(layout.target).toBeUndefined();
        });

        it("hides progress if missing", () => {
            const state = createDummyState();
            delete state.achievement;
            const layout = calculator.calculate({ width: 300, height: 220 }, state);
            expect(layout.showProgress).toBe(false);
            expect(layout.progress).toBeUndefined();
        });

        it("hides status if missing", () => {
            const state = createDummyState();
            delete state.status;
            const layout = calculator.calculate({ width: 300, height: 220 }, state);
            expect(layout.showStatus).toBe(false);
            expect(layout.statusIndicator).toBeUndefined();
        });
        
        it("ignores undefined properties securely", () => {
            const state: VisualState = {
                hasData: true,
                hasActualValueRole: true,
                settings: createDummySettings(),
                calculatedVariationColor: null,
                calculatedStatusColor: "",
                actual: { formattedValue: "1M" }
            };
            const layout = calculator.calculate({ width: 300, height: 220 }, state);
            expect(layout.showTitle).toBe(false);
            expect(layout.showComparison).toBe(false);
            expect(layout.showTarget).toBe(false);
            expect(layout.showProgress).toBe(false);
            expect(layout.showStatus).toBe(false);
            expect(layout.value).toBeDefined();
        });

        it("hides comparison and frees space if settings.comparison.show is false", () => {
            const state = createDummyState();
            state.settings.comparison.show = false;
            
            const layoutWithFalse = calculator.calculate({ width: 300, height: 220 }, state);
            
            expect(layoutWithFalse.showComparison).toBe(false);
            expect(layoutWithFalse.comparisonPeriod).toBeUndefined();
        });

        it("hides target and frees space if settings.target.show is false", () => {
            const state = createDummyState();
            state.settings.target.show = false;
            
            const layoutWithFalse = calculator.calculate({ width: 300, height: 220 }, state);
            
            expect(layoutWithFalse.showTarget).toBe(false);
            expect(layoutWithFalse.target).toBeUndefined();
        });

        it("hides progress and frees space if settings.progress.show is false", () => {
            const state = createDummyState();
            state.settings.progress.show = false;
            
            const layoutWithFalse = calculator.calculate({ width: 300, height: 220 }, state);
            
            expect(layoutWithFalse.showProgress).toBe(false);
            expect(layoutWithFalse.progress).toBeUndefined();
        });
    describe("Adaptive Vertical Distribution", () => {
        it("300x220 conserva la composición base", () => {
            const layout = calculator.calculate({ width: 300, height: 220 }, createDummyState());
            expect(layout.title!.y).toBeGreaterThan(16);
            expect(layout.value!.y).toBeGreaterThan(layout.title!.y);
        });

        it("300x300 aumenta gaps", () => {
            const layout220 = calculator.calculate({ width: 300, height: 220 }, createDummyState());
            const layout300 = calculator.calculate({ width: 300, height: 300 }, createDummyState());
            
            const gap220 = layout220.value!.y - layout220.title!.y;
            const gap300 = layout300.value!.y - layout300.title!.y;
            
            expect(gap300).toBeGreaterThan(gap220);
        });

        it("300x400 mueve el estado hacia abajo", () => {
            const layout220 = calculator.calculate({ width: 300, height: 220 }, createDummyState());
            const layout400 = calculator.calculate({ width: 300, height: 400 }, createDummyState());
            
            expect(layout400.statusText!.y).toBeGreaterThan(layout220.statusText!.y);
        });

        it("300x600 alcanza maxGap y centra el bloque", () => {
            const layout400 = calculator.calculate({ width: 300, height: 400 }, createDummyState());
            const layout600 = calculator.calculate({ width: 300, height: 600 }, createDummyState());
            
            // Gaps should not grow indefinitely, so internal distances stabilize
            const internalHeight400 = layout400.statusText!.y - layout400.title!.y;
            const internalHeight600 = layout600.statusText!.y - layout600.title!.y;
            
            // If they both reached max gaps (or close), they should be similar
            // They might differ slightly if 400 didn't fully reach max gap
            expect(internalHeight600).toBeGreaterThanOrEqual(internalHeight400);
            
            // topOffset should be significant in 600
            const topSpace = layout600.title!.y - layout600.title!.fontSize!; 
            // Bottom space should be roughly equal to top space
            const bottomSpace = 600 - layout600.statusText!.y;
            expect(Math.abs(topSpace - bottomSpace)).toBeLessThan(20);
        });

        it("260x190 conserva NORMAL", () => {
            const layout = calculator.calculate({ width: 260, height: 190 }, createDummyState());
            expect(layout.mode).toBe(LayoutMode.NORMAL);
        });

        it("240x300 aplica el modo definido por ancho (COMPACT)", () => {
            const layout = calculator.calculate({ width: 240, height: 300 }, createDummyState());
            expect(layout.mode).toBe(LayoutMode.COMPACT);
        });

        it("180x300 aplica COMPACT", () => {
            const layout = calculator.calculate({ width: 180, height: 300 }, createDummyState());
            expect(layout.mode).toBe(LayoutMode.COMPACT);
        });

        it("140x400 aplica MINIMUM", () => {
            const layout = calculator.calculate({ width: 140, height: 400 }, createDummyState());
            expect(layout.mode).toBe(LayoutMode.MINIMUM);
        });

        it("Ocultar Título redistribuye", () => {
            const state = createDummyState();
            const layoutFull = calculator.calculate({ width: 300, height: 300 }, state);
            state.settings.title.show = false;
            const layoutHidden = calculator.calculate({ width: 300, height: 300 }, state);
            
            // Should shift value upwards or center differently
            expect(layoutHidden.value!.y).not.toEqual(layoutFull.value!.y);
        });

        it("Ocultar Comparación redistribuye", () => {
            const state = createDummyState();
            const layoutFull = calculator.calculate({ width: 300, height: 300 }, state);
            state.settings.comparison.show = false;
            const layoutHidden = calculator.calculate({ width: 300, height: 300 }, state);
            
            expect(layoutHidden.target!.y).not.toEqual(layoutFull.target!.y);
        });

        it("Ocultar Meta redistribuye", () => {
            const state = createDummyState();
            const layoutFull = calculator.calculate({ width: 300, height: 300 }, state);
            state.settings.target.show = false;
            const layoutHidden = calculator.calculate({ width: 300, height: 300 }, state);
            
            expect(layoutHidden.progress!.track.y).not.toEqual(layoutFull.progress!.track.y);
        });

        it("Ocultar Progreso redistribuye", () => {
            const state = createDummyState();
            const layoutFull = calculator.calculate({ width: 300, height: 300 }, state);
            state.settings.progress.show = false;
            const layoutHidden = calculator.calculate({ width: 300, height: 300 }, state);
            
            expect(layoutHidden.statusText!.y).not.toEqual(layoutFull.statusText!.y);
        });

        it("Ocultar Estado no deja gap huérfano y redistribuye", () => {
            const state = createDummyState();
            const layoutFull = calculator.calculate({ width: 300, height: 300 }, state);
            delete state.status;
            const layoutHidden = calculator.calculate({ width: 300, height: 300 }, state);
            
            expect(layoutHidden.progress!.track.y).not.toEqual(layoutFull.progress!.track.y);
        });

        it("achievement=null no reserva bloque de progreso", () => {
            const state = createDummyState();
            const layoutFull = calculator.calculate({ width: 300, height: 300 }, state);
            state.achievement = undefined;
            const layoutHidden = calculator.calculate({ width: 300, height: 300 }, state);
            
            expect(layoutHidden.showProgress).toBe(false);
            expect(layoutHidden.statusText!.y).not.toEqual(layoutFull.statusText!.y);
        });

        it("Todas las coordenadas son finitas", () => {
            const layout = calculator.calculate({ width: 300, height: 300 }, createDummyState());
            expect(isFinite(layout.title!.y)).toBe(true);
            expect(isFinite(layout.value!.y)).toBe(true);
            expect(isFinite(layout.comparisonPeriod!.y)).toBe(true);
            expect(isFinite(layout.target!.y)).toBe(true);
            expect(isFinite(layout.progress!.track.y)).toBe(true);
            expect(isFinite(layout.statusText!.y)).toBe(true);
        });

        it("Todos los elementos visibles quedan dentro del innerHeight", () => {
            const layout = calculator.calculate({ width: 300, height: 220 }, createDummyState());
            expect(layout.title!.y).toBeGreaterThanOrEqual(0);
            expect(layout.statusText!.y).toBeLessThanOrEqual(220);
        });

        it("La altura real de Progreso considera percentageSize", () => {
            const state = createDummyState();
            state.settings.progress.height = 4;
            state.settings.progress.percentageSize = 24;
            state.settings.progress.showPercentage = true;
            
            const layoutWithPercent = calculator.calculate({ width: 300, height: 300 }, state);
            
            state.settings.progress.showPercentage = false;
            const layoutNoPercent = calculator.calculate({ width: 300, height: 300 }, state);
            
            // Gap should change because block height is different
            expect(layoutWithPercent.statusText!.y).not.toEqual(layoutNoPercent.statusText!.y);
        });
    });
});
});

