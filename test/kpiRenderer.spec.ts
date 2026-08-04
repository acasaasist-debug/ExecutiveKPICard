/**
 * @jest-environment jsdom
 */

import { KpiRenderer } from "../src/rendering/kpiRenderer";
import { KpiLayout, LayoutMode } from "../src/models/layout";
import { VisualState } from "../src/models/visualState";
import { SVGConstants } from "../src/constants/svg";
import { SvgFactory } from "../src/rendering/svgFactory";

describe("KpiRenderer", () => {
    let svgRoot: SVGElement;

    beforeEach(() => {
        svgRoot = SvgFactory.createElement("svg");
        document.body.appendChild(svgRoot);

        const mockContext = {
            measureText: jest.fn().mockReturnValue({ width: 50 }),
            font: ""
        };
        HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext) as any;
    });

    afterEach(() => {
        document.body.removeChild(svgRoot);
        jest.clearAllMocks();
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
        },
        status: {
            show: true, statusSource: "auto", showCircle: true, circleSize: 8, fontFamily: "Segoe UI", fontSize: 12, textColor: "#6B7280", effectiveSuccessThreshold: 1.0, effectiveWarningThreshold: 0.9, successText: "Cumpliendo", warningText: "En camino", dangerText: "En riesgo", noDataText: "Sin información", successColor: "#16A34A", warningColor: "#F59E0B", dangerColor: "#DC2626", neutralColor: "#6B7280"
        }
    });

    const createDummyState = (): VisualState => ({
        hasData: true,
        hasActualValueRole: true,
        settings: createDummySettings(),
        title: { text: "Test KPI" },
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
        calculatedStatusColor: "#16A34A",
        statusCategory: "success",
        calculatedStatusText: "On Track"
    });

    const createDummyLayout = (): KpiLayout => ({
        mode: LayoutMode.NORMAL,
        viewport: { width: 300, height: 220 },
        padding: 16,
        showTitle: true,
        showComparison: true,
        showTarget: true,
        showProgress: true,
        showStatus: true,
        accent: { x: 0, y: 0, width: 300, height: 3 },
        title: { x: 150, y: 20, width: 268, fontSize: 14, textAnchor: "middle" },
        value: { x: 150, y: 60, width: 268, fontSize: 32, textAnchor: "middle" },
        comparisonPeriod: { x: 16, y: 90, width: 134, fontSize: 12, textAnchor: "start" },
        variation: { x: 284, y: 90, width: 134, fontSize: 12, textAnchor: "end" },
        target: { x: 16, y: 110, width: 268, fontSize: 12, textAnchor: "start" },
        progress: {
            track: { x: 16, y: 130, width: 228, height: 10 },
            fill: { x: 16, y: 130, width: 228, height: 10 }, // Capped at track width
            achievementText: { x: 284, y: 139, width: 35, fontSize: 12, textAnchor: "end" },
            isOverperforming: true,
            overperformanceMarker: { x: 242, y: 128, width: 4, height: 14 }
        },
        statusIndicator: { x: 100, y: 180, width: 8, height: 8, radius: 4 },
        statusText: { x: 114, y: 184, width: 50, fontSize: 12, textAnchor: "start" }
    });

    it("renders all groups when full layout is provided", () => {
        KpiRenderer.render(svgRoot, createDummyLayout(), createDummyState());

        expect(svgRoot.querySelector(`g.${SVGConstants.classes.backgroundGroup}`)).not.toBeNull();
        expect(svgRoot.querySelector(`g.${SVGConstants.classes.accentGroup}`)).not.toBeNull();
        expect(svgRoot.querySelector(`g.${SVGConstants.classes.titleGroup}`)).not.toBeNull();
        expect(svgRoot.querySelector(`g.${SVGConstants.classes.valueGroup}`)).not.toBeNull();
        expect(svgRoot.querySelector(`g.${SVGConstants.classes.comparisonGroup}`)).not.toBeNull();
        expect(svgRoot.querySelector(`g.${SVGConstants.classes.targetGroup}`)).not.toBeNull();
        expect(svgRoot.querySelector(`g.${SVGConstants.classes.progressGroup}`)).not.toBeNull();
        expect(svgRoot.querySelector(`g.${SVGConstants.classes.statusGroup}`)).not.toBeNull();
    });

    it("updates without duplicating groups", () => {
        KpiRenderer.render(svgRoot, createDummyLayout(), createDummyState());
        KpiRenderer.render(svgRoot, createDummyLayout(), createDummyState());

        const bgGroups = svgRoot.querySelectorAll(`g.${SVGConstants.classes.backgroundGroup}`);
        expect(bgGroups.length).toBe(1);
    });

    it("clears SVG content correctly", () => {
        KpiRenderer.render(svgRoot, createDummyLayout(), createDummyState());
        KpiRenderer.clear(svgRoot);
        
        const titleGroup = svgRoot.querySelector(`g.${SVGConstants.classes.titleGroup}`);
        expect(titleGroup?.children.length).toBe(0);
    });

    it("hides elements that are marked false in layout", () => {
        const layout = createDummyLayout();
        layout.showComparison = false;
        layout.showTarget = false;
        
        KpiRenderer.render(svgRoot, layout, createDummyState());
        
        const comparisonGroup = svgRoot.querySelector(`g.${SVGConstants.classes.comparisonGroup}`);
        const targetGroup = svgRoot.querySelector(`g.${SVGConstants.classes.targetGroup}`);
        
        expect(comparisonGroup?.children.length).toBe(0);
        expect(targetGroup?.children.length).toBe(0);
    });

    // 7. Test variation color applied to variation text and icon
    it("applies variation color to text and icon", () => {
        const state = createDummyState();
        state.calculatedVariationColor = "#7C3AED";
        if (state.comparison) {
            state.comparison.trendIcon = "▲";
        }
        KpiRenderer.render(svgRoot, createDummyLayout(), state);
        
        const varText = svgRoot.querySelector(`text.${SVGConstants.classes.variationText}`) as SVGTextElement;
        const iconText = svgRoot.querySelector(`text.${SVGConstants.classes.variationIcon}`) as SVGTextElement;
        
        expect(varText.style.fill).toMatch(/rgb\(124, 58, 237\)|#7C3AED/i);
        expect(iconText).not.toBeNull();
        expect(iconText.textContent).toBe("▲");
        expect(iconText.style.fill).toMatch(/rgb\(124, 58, 237\)|#7C3AED/i);
    });

    it("uses formatted value text via textContent (no innerHTML)", () => {
        const state = createDummyState();
        state.actual.formattedValue = "<script>alert('xss')</script>";
        KpiRenderer.render(svgRoot, createDummyLayout(), state);
        
        const valueText = svgRoot.querySelector(`text.${SVGConstants.classes.valueText}`);
        expect(valueText?.textContent).toBe("<script>alert('xss')</script>"); // browser handles encoding for textContent safely
        expect(valueText?.innerHTML).not.toContain("<script>");
    });

    it("accents color uses status color", () => {
        const state = createDummyState();
        state.calculatedStatusColor = "#FF0000";
        KpiRenderer.render(svgRoot, createDummyLayout(), state);
        
        const accentPath = svgRoot.querySelector(`path.${SVGConstants.classes.accentLine}`) as SVGPathElement;
        expect(accentPath.style.fill).toMatch(/rgb\(255, 0, 0\)|#FF0000/i);
    });

    describe("Comparison Group", () => {
        it("hides only the period when showPeriod is false", () => {
            const state = createDummyState();
            state.settings.comparison.showPeriod = false;
            KpiRenderer.render(svgRoot, createDummyLayout(), state);
            
            const periodText = svgRoot.querySelector(`text.${SVGConstants.classes.periodText}`);
            const variationText = svgRoot.querySelector(`text.${SVGConstants.classes.variationText}`);
            
            expect(periodText).toBeNull();
            expect(variationText).not.toBeNull();
        });

        it("hides variation and icon when showVariation is false", () => {
            const state = createDummyState();
            state.settings.comparison.showVariation = false;
            KpiRenderer.render(svgRoot, createDummyLayout(), state);
            
            const variationText = svgRoot.querySelector(`text.${SVGConstants.classes.variationText}`);
            const variationIcon = svgRoot.querySelector(`text.${SVGConstants.classes.variationIcon}`);
            
            expect(variationText).toBeNull();
            expect(variationIcon).toBeNull();
        });

        it("hides icon only when showArrow is false", () => {
            const state = createDummyState();
            state.settings.comparison.showArrow = false;
            KpiRenderer.render(svgRoot, createDummyLayout(), state);
            
            const variationText = svgRoot.querySelector(`text.${SVGConstants.classes.variationText}`);
            const variationIcon = svgRoot.querySelector(`text.${SVGConstants.classes.variationIcon}`);
            
            expect(variationText).not.toBeNull();
            expect(variationIcon).toBeNull();
        });

        it("uses data-driven period if available, else fallback", () => {
            const state = createDummyState();
            
            // From data
            state.comparison!.period = "Q3 2023";
            KpiRenderer.render(svgRoot, createDummyLayout(), state);
            let periodText = svgRoot.querySelector(`text.${SVGConstants.classes.periodText}`);
            expect(periodText?.textContent).toBe("Q3 2023");

            // Fallback
            state.comparison!.period = null;
            state.settings.comparison.defaultPeriodText = "Fallback period";
            KpiRenderer.render(svgRoot, createDummyLayout(), state);
            periodText = svgRoot.querySelector(`text.${SVGConstants.classes.periodText}`);
            expect(periodText?.textContent).toBe("Fallback period");
        });

        it("hides element if both data period and fallback period are empty strings", () => {
            const state = createDummyState();
            state.comparison!.period = "";
            state.settings.comparison.defaultPeriodText = "";
            const layout = createDummyLayout();
            KpiRenderer.render(svgRoot, layout, state);
            
            const periodText = svgRoot.querySelector(`text.${SVGConstants.classes.periodText}`);
            expect(periodText).toBeNull();
        });

        it("shows noComparisonText when variation is null", () => {
            const state = createDummyState();
            state.comparison!.formattedVariation = ""; // indicates null/blank
            state.settings.comparison.noComparisonText = "-";
            KpiRenderer.render(svgRoot, createDummyLayout(), state);
            
            const variationText = svgRoot.querySelector(`text.${SVGConstants.classes.variationText}`);
            expect(variationText?.textContent).toBe("-");
        });

        it("does not show noComparisonText if showVariation is false", () => {
            const state = createDummyState();
            state.comparison!.formattedVariation = "";
            state.settings.comparison.showVariation = false;
            KpiRenderer.render(svgRoot, createDummyLayout(), state);
            
            const variationText = svgRoot.querySelector(`text.${SVGConstants.classes.variationText}`);
            expect(variationText).toBeNull();
        });
    });

    describe("Target Group", () => {
        it("hides targetGroup when target is null", () => {
            const state = createDummyState();
            state.target = undefined;
            KpiRenderer.render(svgRoot, createDummyLayout(), state);
            
            const targetText = svgRoot.querySelector(`text.${SVGConstants.classes.targetText}`);
            expect(targetText).toBeNull();
        });

        it("handles custom, default, and empty labels", () => {
            const state = createDummyState();
            
            // Custom label
            state.settings.target.label = "Goal: ";
            state.target = { formattedValue: "1K" };
            KpiRenderer.render(svgRoot, createDummyLayout(), state);
            let targetText = svgRoot.querySelector(`text.${SVGConstants.classes.targetText}`);
            expect(targetText?.textContent).toBe("Goal: 1K");

            // Empty label
            state.settings.target.label = "";
            KpiRenderer.render(svgRoot, createDummyLayout(), state);
            targetText = svgRoot.querySelector(`text.${SVGConstants.classes.targetText}`);
            expect(targetText?.textContent).toBe("1K");
        });

        it("applies target visual settings: fontFamily, fontSize, color", () => {
            const state = createDummyState();
            state.settings.target.fontFamily = "Comic Sans MS";
            state.settings.target.fontSize = 20;
            state.settings.target.color = "#FF00FF";
            
            const layout = createDummyLayout();
            layout.target!.fontSize = 20; // The renderer relies on the layout for dimensions
            
            KpiRenderer.render(svgRoot, layout, state);
            
            const targetText = svgRoot.querySelector(`text.${SVGConstants.classes.targetText}`) as SVGTextElement;
            expect(targetText.style.fontFamily).toContain("Comic Sans MS");
            expect(targetText.style.fontSize).toBe("20px");
            expect(targetText.style.fill).toMatch(/rgb\(255, 0, 255\)|#FF00FF/i);
        });
    });

    describe("Progress Group", () => {
        it("uses backgroundColor, customColor vs useStatusColor", () => {
            const state = createDummyState();
            
            // custom color
            state.settings.progress.useStatusColor = false;
            state.settings.progress.customColor = "#0000FF";
            state.settings.progress.backgroundColor = "#CCCCCC";
            KpiRenderer.render(svgRoot, createDummyLayout(), state);
            
            let track = svgRoot.querySelector(`rect.${SVGConstants.classes.progressTrack}`) as SVGRectElement;
            let fill = svgRoot.querySelector(`rect.${SVGConstants.classes.progressFill}`) as SVGRectElement;
            
            expect(track.style.fill).toMatch(/rgb\(204, 204, 204\)|#CCCCCC/i);
            expect(fill.style.fill).toMatch(/rgb\(0, 0, 255\)|#0000FF/i);

            // use status color
            state.settings.progress.useStatusColor = true;
            state.calculatedStatusColor = "#FF0000";
            KpiRenderer.render(svgRoot, createDummyLayout(), state);
            
            fill = svgRoot.querySelector(`rect.${SVGConstants.classes.progressFill}`) as SVGRectElement;
            expect(fill.style.fill).toMatch(/rgb\(255, 0, 0\)|#FF0000/i);
        });

        it("maps height and effectiveRadius to SVG correctly", () => {
            const state = createDummyState();
            const layout = createDummyLayout();
            layout.progress!.track.height = 16;
            state.settings.progress.effectiveRadius = 8;
            
            KpiRenderer.render(svgRoot, layout, state);
            
            const track = svgRoot.querySelector(`rect.${SVGConstants.classes.progressTrack}`) as SVGRectElement;
            expect(track.getAttribute("height")).toBe("16");
            expect(track.getAttribute("rx")).toBe("8");
        });

        it("hides achievementText when showPercentage is false", () => {
            const state = createDummyState();
            state.settings.progress.showPercentage = false;
            
            const layout = createDummyLayout();
            layout.progress!.achievementText = undefined; // Handled by layout
            
            KpiRenderer.render(svgRoot, layout, state);
            
            const achievementText = svgRoot.querySelector(`text.${SVGConstants.classes.achievementText}`);
            expect(achievementText).toBeNull();
        });

        it("applies percentageSize and percentageColor", () => {
            const state = createDummyState();
            state.settings.progress.showPercentage = true;
            state.settings.progress.percentageSize = 18;
            state.settings.progress.percentageColor = "#123456";
            
            const layout = createDummyLayout();
            layout.progress!.achievementText!.fontSize = 18;
            
            KpiRenderer.render(svgRoot, layout, state);
            
            const achievementText = svgRoot.querySelector(`text.${SVGConstants.classes.achievementText}`) as SVGTextElement;
            expect(achievementText.style.fontSize).toBe("18px");
            expect(achievementText.style.fill).toMatch(/rgb\(18, 52, 86\)|#123456/i);
        });

        it("hides overachievement mark when showOverachievementMark is false", () => {
            const state = createDummyState();
            state.settings.progress.showOverachievementMark = false;
            
            const layout = createDummyLayout();
            layout.progress!.overperformanceMarker = undefined; // Handled by layout
            
            KpiRenderer.render(svgRoot, layout, state);
            
            const mark = svgRoot.querySelector(`rect.${SVGConstants.classes.overperformanceMarker}`);
            expect(mark).toBeNull();
        });

        it("applies markColor and markThickness", () => {
            const state = createDummyState();
            state.settings.progress.showOverachievementMark = true;
            state.settings.progress.markColor = "#654321";
            state.settings.progress.markThickness = 5;
            
            const layout = createDummyLayout();
            layout.progress!.overperformanceMarker!.width = 5;
            
            KpiRenderer.render(svgRoot, layout, state);
            
            const mark = svgRoot.querySelector(`rect.${SVGConstants.classes.overperformanceMarker}`) as SVGRectElement;
            expect(mark.style.fill).toMatch(/rgb\(101, 67, 33\)|#654321/i);
            expect(mark.getAttribute("width")).toBe("5");
        });

        it("shows mark when achievement > 1 and hides when achievement <= 1", () => {
            const state = createDummyState();
            const layout = createDummyLayout();
            
            // > 1
            layout.progress!.isOverperforming = true;
            KpiRenderer.render(svgRoot, layout, state);
            expect(svgRoot.querySelector(`rect.${SVGConstants.classes.overperformanceMarker}`)).not.toBeNull();

            // <= 1
            layout.progress!.isOverperforming = false;
            KpiRenderer.render(svgRoot, layout, state);
            expect(svgRoot.querySelector(`rect.${SVGConstants.classes.overperformanceMarker}`)).toBeNull();
        });

        it("avoids duplicate SVG elements on multiple updates", () => {
            KpiRenderer.render(svgRoot, createDummyLayout(), createDummyState());
            KpiRenderer.render(svgRoot, createDummyLayout(), createDummyState());
            
            const tracks = svgRoot.querySelectorAll(`rect.${SVGConstants.classes.progressTrack}`);
            const fills = svgRoot.querySelectorAll(`rect.${SVGConstants.classes.progressFill}`);
            const marks = svgRoot.querySelectorAll(`rect.${SVGConstants.classes.overperformanceMarker}`);
            const texts = svgRoot.querySelectorAll(`text.${SVGConstants.classes.achievementText}`);
            
            expect(tracks.length).toBe(1);
            expect(fills.length).toBe(1);
            expect(marks.length).toBe(1);
            expect(texts.length).toBe(1);
        });
    });
});
