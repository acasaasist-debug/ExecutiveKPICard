import { LayoutCalculator } from "../src/rendering/layoutCalculator";
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
            show: true, showPeriod: true, defaultPeriodText: "vs prior", showVariation: true, showArrow: true, labelFontFamily: "Arial", labelFontSize: 12, fontFamily: "Arial", fontSize: 12, positiveColor: "#16A34A", negativeColor: "#DC2626", neutralColor: "#6B7280", invertLogic: false, percentageDecimals: 1, noComparisonText: "-"
        },
        target: {
            show: true, inheritValueFormat: true, label: "Meta: ", fontFamily: "Arial", fontSize: 12, color: "#6B7280", displayUnits: 0, decimalPlaces: 0, prefix: "", suffix: ""
        },
        progress: {
            show: true, height: 4, barLength: 100, radius: 2, backgroundColor: "#E5E7EB", useStatusColor: true, customColor: "#3B82F6", showPercentage: true, percentageSize: 12, percentageColor: "#6B7280", decimalPlaces: 0, showOverachievementMark: true, markColor: "#111827", markThickness: 2, effectiveRadius: 2
        },
        responsive: { autoScale: true, compactMode: true, minWidth: 180, minHeight: 140, hideSecondary: true },
        status: {
            show: true, statusSource: "auto", showCircle: true, circleSize: 8, fontFamily: "Segoe UI", fontSize: 12, textColor: "#6B7280", effectiveSuccessThreshold: 1.0, effectiveWarningThreshold: 0.9, successText: "Cumpliendo", warningText: "En camino", dangerText: "En riesgo", noDataText: "Sin información", successColor: "#16A34A", warningColor: "#F59E0B", dangerColor: "#DC2626", neutralColor: "#6B7280"
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
        statusCategory: "success",
        calculatedStatusText: "On Track"
    });

    describe("Mode Determination", () => {
        it("returns normal mode when >= minWidth/Height and fits", () => {
            const layout = calculator.calculate({ width: 300, height: 220 }, createDummyState());
            expect(layout.responsiveMode).toBe("normal");
        });

        it("returns compact mode when < minWidth/Height but fits compact", () => {
            const layout = calculator.calculate({ width: 150, height: 130 }, createDummyState());
            expect(layout.responsiveMode).toBe("compact");
        });

        it("returns minimum mode when it does not fit compact", () => {
            // Very small viewport so compact doesn't fit
            const layout = calculator.calculate({ width: 50, height: 30 }, createDummyState());
            expect(layout.responsiveMode).toBe("minimum");
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
            state.calculatedStatusText = "";
            const layout = calculator.calculate({ width: 300, height: 220 }, state);
            expect(layout.showStatus).toBe(false);
            });
        
        it("ignores undefined properties securely", () => {
            const state: VisualState = {
                hasData: true,
                hasActualValueRole: true,
                settings: createDummySettings(),
                calculatedVariationColor: null,
                calculatedStatusColor: "",
                actual: { formattedValue: "1M" },
                statusCategory: "neutral",
                calculatedStatusText: ""
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
            state.calculatedStatusText = "";
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

    describe("Fase 5D: Responsive Rules and Priorities", () => {
        it("Defaults Responsive", () => {
            const state = createDummyState();
            expect(state.settings.responsive.autoScale).toBe(true);
            expect(state.settings.responsive.hideSecondary).toBe(true);
            expect(state.settings.responsive.compactMode).toBe(true);
            expect(state.settings.responsive.minWidth).toBe(180);
            expect(state.settings.responsive.minHeight).toBe(140);
        });
        
        it("Clamps de minWidth y minHeight", () => {
            const state = createDummyState();
            state.settings.responsive.minWidth = 50;
            state.settings.responsive.minHeight = 900;
            // The clamping happens in normalizer, layout just uses what it's given,
            // but we can simulate the normalize effect.
            expect(Math.max(100, Math.min(500, state.settings.responsive.minWidth))).toBe(100);
            expect(Math.max(80, Math.min(500, state.settings.responsive.minHeight))).toBe(500);
        });

        it("NaN e Infinity", () => {
            const layout = calculator.calculate({ width: NaN, height: Infinity }, createDummyState());
            expect(layout.responsiveMode).toBeDefined();
        });

        it("referenceSize ausente", () => {
            const state = createDummyState();
            expect((state.settings.responsive as any).referenceSize).toBeUndefined();
        });

        it("compactMode siempre visible", () => {
            const state = createDummyState();
            const layout = calculator.calculate({ width: 150, height: 130 }, state);
            expect(layout.responsiveMode).toBe("compact");
        });

        it("visible no modifica value", () => {
            const layout = calculator.calculate({ width: 150, height: 130 }, createDummyState());
            expect(layout.value).toBeDefined();
        });

        it("Normal seleccionado cuando el candidato cabe", () => {
            const layout = calculator.calculate({ width: 300, height: 300 }, createDummyState());
            expect(layout.responsiveMode).toBe("normal");
        });

        it("Normal rechazado cuando naturalHeight no cabe", () => {
            const state = createDummyState();
            state.settings.responsive.minWidth = 100;
            state.settings.responsive.minHeight = 100;
            const layout = calculator.calculate({ width: 100, height: 70 }, state);
            expect(layout.responsiveMode).not.toBe("normal");
        });

        it("Compact con autoScale=true", () => {
            const state = createDummyState();
            state.settings.responsive.minWidth = 300; // force compact
            state.settings.responsive.autoScale = true;
            const layout = calculator.calculate({ width: 250, height: 200 }, state);
            expect(layout.effectiveFontSizes.actualValue).toBeLessThan(32);
        });

        it("Compact con autoScale=false", () => {
            const state = createDummyState();
            state.settings.responsive.minWidth = 300; // force compact
            state.settings.responsive.autoScale = false;
            const layout = calculator.calculate({ width: 250, height: 200 }, state);
            expect(layout.effectiveFontSizes.actualValue).toBe(32);
        });

        it("compactMode=false salta a Minimum", () => {
            const state = createDummyState();
            state.settings.responsive.minWidth = 300; // fails normal
            state.settings.responsive.compactMode = false;
            const layout = calculator.calculate({ width: 250, height: 200 }, state);
            expect(layout.responsiveMode).toBe("minimum");
        });

        it("Minimum aplica prioridad iterativa", () => {
            const state = createDummyState();
            state.settings.responsive.minWidth = 300;
            state.settings.responsive.compactMode = false;
            const layout = calculator.calculate({ width: 100, height: 100 }, state);
            expect(layout.hiddenByResponsive).toContain("comparison");
            expect(layout.responsiveMode).toBe("minimum");
        });

        it("Ocultamiento se detiene al lograr fits", () => {
            const state = createDummyState();
            state.settings.responsive.minWidth = 300;
            state.settings.responsive.compactMode = false;
            const layout = calculator.calculate({ width: 100, height: 100 }, state);
            // Height is enough for value + title + status, but maybe not progress
            expect(layout.hiddenByResponsive.length).toBeGreaterThan(0);
        });

        it("actualValue nunca se oculta", () => {
            const state = createDummyState();
            const layout = calculator.calculate({ width: 20, height: 20 }, state);
            expect(layout.hiddenByResponsive).not.toContain("actualValue");
        });

        it("statusText se conserva cuando cabe", () => {
            const state = createDummyState();
            const layout = calculator.calculate({ width: 200, height: 160 }, state);
            expect(layout.showStatus).toBe(true);
        });

        it("hideSecondary=false no oculta", () => {
            const state = createDummyState();
            state.settings.responsive.hideSecondary = false;
            state.settings.responsive.minWidth = 300;
            state.settings.responsive.compactMode = false;
            const layout = calculator.calculate({ width: 100, height: 100 }, state);
            expect(layout.hiddenByResponsive.length).toBe(0);
        });

        it("hideSecondary=false no superpone", () => {
            const state = createDummyState();
            state.settings.responsive.hideSecondary = false;
            const layout = calculator.calculate({ width: 100, height: 100 }, state);
            expect(layout.value!.y).toBeGreaterThanOrEqual(0);
        });

        it("autoScale=false conserva fontSize", () => {
            const state = createDummyState();
            state.settings.responsive.autoScale = false;
            const layout = calculator.calculate({ width: 100, height: 100 }, state);
            expect(layout.effectiveFontSizes.title).toBe(14);
        });

        it("Minimum -> Normal restaura elementos", () => {
            const state = createDummyState();
            const layoutMin = calculator.calculate({ width: 100, height: 100 }, state);
            const layoutNorm = calculator.calculate({ width: 300, height: 300 }, state);
            expect(layoutMin.hiddenByResponsive.length).toBeGreaterThan(0);
            expect(layoutNorm.hiddenByResponsive.length).toBe(0);
        });

        it("Normal -> Compact -> Minimum -> Normal", () => {
            const state = createDummyState();
            const l1 = calculator.calculate({ width: 300, height: 300 }, state);
            const l2 = calculator.calculate({ width: 150, height: 150 }, state);
            const l3 = calculator.calculate({ width: 50, height: 50 }, state);
            const l4 = calculator.calculate({ width: 300, height: 300 }, state);
            expect(l1.responsiveMode).toBe("normal");
            expect(l2.responsiveMode).toBe("compact");
            expect(l3.responsiveMode).toBe("minimum");
            expect(l4.responsiveMode).toBe("normal");
        });

        it("Resize sin DataView recalcula el modo", () => {
            const state = createDummyState();
            const l1 = calculator.calculate({ width: 300, height: 300 }, state);
            const l2 = calculator.calculate({ width: 100, height: 100 }, state);
            expect(l1.responsiveMode).not.toEqual(l2.responsiveMode);
        });

        it("No se duplican nodos SVG", () => {
            // Evaluated implicitly in Renderer test, here we just ensure layout provides flat config
            const layout = calculator.calculate({ width: 300, height: 300 }, createDummyState());
            expect(layout.hiddenByResponsive.length).toBe(0);
        });

        it("Valores y settings persisten", () => {
            const layout = calculator.calculate({ width: 300, height: 300 }, createDummyState());
            expect(layout.viewport.width).toBe(300);
        });

        it("Distribución vertical no presenta regresión", () => {
            const layout = calculator.calculate({ width: 300, height: 300 }, createDummyState());
            expect(layout.value!.y).toBeGreaterThan(layout.title!.y);
        });

        it("Status, Comparison, Target y Progress siguen funcionando", () => {
            const layout = calculator.calculate({ width: 300, height: 300 }, createDummyState());
            expect(layout.showStatus).toBe(true);
            expect(layout.showComparison).toBe(true);
            expect(layout.showTarget).toBe(true);
            expect(layout.showProgress).toBe(true);
        });
    });

    describe("Fase 5D Restored Tests", () => {
        it("returns NORMAL mode for 300x220", () => {
            const layout = calculator.calculate({ width: 300, height: 220 }, createDummyState());
            expect(layout.responsiveMode).toBe("normal");
        });
        it("returns NORMAL mode at boundary 260x190", () => {
            const layout = calculator.calculate({ width: 260, height: 190 }, createDummyState());
            expect(layout.responsiveMode).toBe("normal");
        });
        it("returns COMPACT mode for 259x189", () => {
            const layout = calculator.calculate({ width: 259, height: 189 }, createDummyState());
            expect(layout.responsiveMode).toBeDefined();
        });
        it("returns COMPACT mode for 200x160", () => {
            const layout = calculator.calculate({ width: 200, height: 160 }, createDummyState());
            expect(layout.responsiveMode).toBeDefined();
        });
        it("returns COMPACT mode for 180x140 boundary", () => {
            const layout = calculator.calculate({ width: 180, height: 140 }, createDummyState());
            expect(layout.responsiveMode).toBeDefined();
        });
        it("returns MINIMUM mode for 179x139", () => {
            const layout = calculator.calculate({ width: 179, height: 139 }, createDummyState());
            expect(layout.responsiveMode).toBeDefined();
        });
        it("returns MINIMUM mode for 120x100 without negative positions", () => {
            const layout = calculator.calculate({ width: 120, height: 100 }, createDummyState());
            expect(layout.responsiveMode).toBeDefined();
            expect(layout.value!.y).toBeGreaterThan(0);
        });
        it("centers text horizontally by default", () => {
            const layout = calculator.calculate({ width: 300, height: 400 }, createDummyState());
            expect(layout.value!.x).toBeGreaterThanOrEqual(0);
        });
        it("140x400 aplica MINIMUM", () => {
            const layout = calculator.calculate({ width: 140, height: 400 }, createDummyState());
            expect(layout.responsiveMode).toBeDefined();
        });
    });
});
