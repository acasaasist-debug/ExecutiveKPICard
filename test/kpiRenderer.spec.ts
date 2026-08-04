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
            isFavorable: true,
            color: "#16A34A"
        },
        target: { formattedValue: "1,000" },
        achievement: { formattedValue: "123%", progressRatio: 1.23 },
        status: { text: "On Track", color: "#16A34A" }
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
        if (state.comparison) {
            state.comparison.color = "#7C3AED";
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
        state.status!.color = "#FF0000";
        KpiRenderer.render(svgRoot, createDummyLayout(), state);
        
        const accentPath = svgRoot.querySelector(`path.${SVGConstants.classes.accentLine}`) as SVGPathElement;
        expect(accentPath.style.fill).toMatch(/rgb\(255, 0, 0\)|#FF0000/i);
    });
});
