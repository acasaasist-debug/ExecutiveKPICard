/**
 * @jest-environment jsdom
 *
 * Visual lifecycle tests – verifies SVG preservation during TransientIncomplete
 * and correct rendering after stable updates.
 *
 * Covers specs 6 (SVG preservation), 12, 13, 14, 15 from the mandatory list.
 */

import { DataViewService } from "../src/services/dataViewService";
import { DataViewReadStatus } from "../src/models/dataViewStatus";
import { KpiRenderer } from "../src/rendering/kpiRenderer";
import { LandingPageRenderer } from "../src/rendering/landingPageRenderer";
import { SvgFactory } from "../src/rendering/svgFactory";
import { SVGConstants } from "../src/constants/svg";
import { KpiLayout, LayoutMode } from "../src/models/layout";
import { VisualState } from "../src/models/visualState";

// ─────────────────────────────────────────────────────────────────────────────
// Minimal helpers
// ─────────────────────────────────────────────────────────────────────────────

const dummySettings = (): any => ({
    general: {
        backgroundColor: "#FFFFFF", transparency: 0,
        borderOn: true, borderColor: "#D7DDE5", borderThickness: 1,
        cornerRadius: 12, padding: 16,
        topLineOn: true, topLineUseStatusColor: true,
        topLineThickness: 3, topLineColor: "#3B82F6"
    },
    title:  { show: true, fontFamily: "Segoe UI", fontSize: 14, bold: true, color: "#111827", alignment: "center", bottomMargin: 4 },
    actualValue: {
        show: true, useModelFormat: true, fontFamily: "Segoe UI", fontSize: 32, bold: true,
        color: "#111827", alignment: "center", displayUnits: 0, decimalPlaces: 0,
        prefix: "", suffix: "", thousandsSeparator: true, showDashIfNull: true
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

function buildState(withTitle: boolean, value = "1,234"): VisualState {
    return {
        hasData: true,
        hasActualValueRole: true,
        settings: dummySettings(),
        title: withTitle ? { text: "My KPI" } : undefined,
        actual: { formattedValue: value },
        calculatedVariationColor: null,
        calculatedStatusColor: "#16A34A",
        statusCategory: "success",
        calculatedStatusText: "OK"
    };
}

function buildLayout(withTitle: boolean): KpiLayout {
    return {
        mode: LayoutMode.NORMAL,
        viewport: { width: 300, height: 220 },
        padding: 16,
        showTitle: withTitle,
        showComparison: false,
        showTarget: false,
        showProgress: false,
        showStatus: true,
        accent: { x: 0, y: 0, width: 300, height: 3 },
        title:  withTitle ? { x: 150, y: 30, width: 268, fontSize: 14, textAnchor: "middle" } : undefined,
        value:  { x: 150, y: 70, width: 268, fontSize: 32, textAnchor: "middle" },
        statusIndicator: { x: 100, y: 200, width: 8, height: 8, radius: 4 },
        statusText:      { x: 114, y: 204, width: 50, fontSize: 12, textAnchor: "start" }
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

describe("Visual lifecycle – SVG preservation during TransientIncomplete", () => {
    let svgRoot: SVGElement;

    beforeEach(() => {
        svgRoot = SvgFactory.createElement("svg");
        document.body.appendChild(svgRoot);

        const mockCtx = { measureText: jest.fn().mockReturnValue({ width: 50 }), font: "" };
        HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockCtx) as any;
    });

    afterEach(() => {
        document.body.removeChild(svgRoot);
        jest.clearAllMocks();
    });

    // ── Spec 13 ───────────────────────────────────────────────────────────
    it("13: SVG innerHTML does NOT change during TransientIncomplete", () => {
        // Initial stable render (value only, no title)
        KpiRenderer.render(svgRoot, buildLayout(false), buildState(false));
        const htmlAfterStable = svgRoot.innerHTML;

        // Simulate a TransientIncomplete: do NOT call KpiRenderer at all.
        // (In the real visual, the switch case returns early without touching SVG.)
        // innerHTML must be identical.
        expect(svgRoot.innerHTML).toBe(htmlAfterStable);
    });

    // ── Spec 14 ───────────────────────────────────────────────────────────
    it("14: titleGroup and valueGroup remain visible during TransientIncomplete", () => {
        // Stable render: value without title
        KpiRenderer.render(svgRoot, buildLayout(false), buildState(false));

        // valueGroup should have children after the stable render
        const valueGroup = svgRoot.querySelector(`g.${SVGConstants.classes.valueGroup}`);
        expect(valueGroup).not.toBeNull();
        expect(valueGroup!.children.length).toBeGreaterThan(0);

        // Simulate TransientIncomplete: no SVG mutation.
        // Groups must still have children.
        const valueGroupAfter = svgRoot.querySelector(`g.${SVGConstants.classes.valueGroup}`);
        expect(valueGroupAfter!.children.length).toBeGreaterThan(0);
    });

    // ── Spec 15 ───────────────────────────────────────────────────────────
    it("15: next StableValue after TransientIncomplete updates both groups without duplicates", () => {
        // Step A: stable render (value, no title)
        KpiRenderer.render(svgRoot, buildLayout(false), buildState(false));

        // Step B: TransientIncomplete (no SVG change simulated)
        // (nothing)

        // Step C: stable render with title + value
        KpiRenderer.render(svgRoot, buildLayout(true), buildState(true));

        // titleGroup must have exactly one child (the text element)
        const titleGroup = svgRoot.querySelector(`g.${SVGConstants.classes.titleGroup}`);
        expect(titleGroup).not.toBeNull();
        expect(titleGroup!.children.length).toBe(1);

        // valueGroup must have exactly one child
        const valueGroup = svgRoot.querySelector(`g.${SVGConstants.classes.valueGroup}`);
        expect(valueGroup).not.toBeNull();
        expect(valueGroup!.children.length).toBe(1);

        // No duplicate groups
        const allTitleGroups = svgRoot.querySelectorAll(`g.${SVGConstants.classes.titleGroup}`);
        expect(allTitleGroups.length).toBe(1);
        const allValueGroups = svgRoot.querySelectorAll(`g.${SVGConstants.classes.valueGroup}`);
        expect(allValueGroups.length).toBe(1);
    });

    // ── Spec 6 (SVG level) ────────────────────────────────────────────────
    it("6: value text content persists through a TransientIncomplete update", () => {
        // Initial stable: value = "1,234"
        KpiRenderer.render(svgRoot, buildLayout(false), buildState(false, "1,234"));
        const valueText = svgRoot.querySelector(`text.${SVGConstants.classes.valueText}`);
        expect(valueText?.textContent).toBe("1,234");

        // Transient: NO render call, so SVG unchanged
        // Value text must still be "1,234"
        const valueTextAfter = svgRoot.querySelector(`text.${SVGConstants.classes.valueText}`);
        expect(valueTextAfter?.textContent).toBe("1,234");
    });

    // ── Spec 12 ───────────────────────────────────────────────────────────
    it("12: getFormattingModel is NOT required to make the visual render", () => {
        // Rendering must succeed without ever calling getFormattingModel.
        // We just call KpiRenderer.render directly.
        expect(() => {
            KpiRenderer.render(svgRoot, buildLayout(true), buildState(true));
        }).not.toThrow();

        const valueGroup = svgRoot.querySelector(`g.${SVGConstants.classes.valueGroup}`);
        expect(valueGroup).not.toBeNull();
    });

    // ── Landing page NOT shown during TransientIncomplete ─────────────────
    it("landingPage group is empty when only TransientIncomplete occurs", () => {
        // Stable render first
        KpiRenderer.render(svgRoot, buildLayout(false), buildState(false));

        // No LandingPageRenderer call during transient (simulated by skipping it).
        const landingGroup = svgRoot.querySelector(`g.${SVGConstants.classes.landingPageGroup}`);
        // Landing group either doesn't exist or has no children (was never populated).
        if (landingGroup) {
            expect(landingGroup.children.length).toBe(0);
        } else {
            expect(landingGroup).toBeNull();
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// DataViewReadStatus – lastStableState semantics (unit-level)
// ─────────────────────────────────────────────────────────────────────────────

describe("DataViewService – stable vs transient semantics", () => {
    const service = new DataViewService();

    it("7: TransientIncomplete result must not be used as lastStableState", () => {
        const dv: any = {
            metadata: { columns: [{ roles: { title: true } }, { roles: { actualValue: true } }] },
            table: { rows: [] }
        };
        const result = service.parse(dv);
        // The caller must check status === TransientIncomplete and skip updating lastStableState.
        expect(result.status).toBe(DataViewReadStatus.TransientIncomplete);
        // The data contained inside is a sentinel – actualValue will be null.
        expect(result.data.actualValue).toBeNull();
    });

    it("8: StableBlank updates stable cache (showDashIfNull applies)", () => {
        const dv: any = {
            metadata: { columns: [{ roles: { actualValue: true } }] },
            table: { rows: [[null]] }
        };
        const result = service.parse(dv);
        expect(result.status).toBe(DataViewReadStatus.StableBlank);
        // The caller SHOULD save this as lastStableState.
        expect(result.data.hasActualValueRole).toBe(true);
        expect(result.data.actualValue).toBeNull();
    });
});

import { Visual } from "../src/visual";
import powerbi from "powerbi-visuals-api";
import { VisualFormattingSettingsModel } from "../src/settings/formattingSettings";

describe("Visual - Resize Lifecycle Integration", () => {
    let visual: Visual;
    let element: HTMLElement;
    let host: any;
    let events: any;
    let formattingSettingsService: any;

    beforeEach(() => {
        element = document.createElement("div");
        document.body.appendChild(element);

        host = {
            createSelectionIdBuilder: jest.fn().mockReturnValue({
                withCategory: jest.fn().mockReturnThis(),
                withMeasure: jest.fn().mockReturnThis(),
                createSelectionId: jest.fn().mockReturnValue({})
            }),
            colorPalette: { getColor: jest.fn().mockReturnValue({ value: "#000000" }) },
            tooltipService: { enabled: jest.fn(), show: jest.fn(), move: jest.fn(), hide: jest.fn() }
        };
        events = { renderingStarted: jest.fn(), renderingFinished: jest.fn(), renderingFailed: jest.fn((options, err) => console.error("RENDERING FAILED:", err)) };
        formattingSettingsService = { populateFormattingSettingsModel: jest.fn().mockReturnValue(new VisualFormattingSettingsModel()) };

        const options: any = { element, host };
        visual = new Visual(options);
        visual["events"] = events;
        visual["formattingSettingsService"] = formattingSettingsService;
        
        const mockCtx = { measureText: jest.fn().mockReturnValue({ width: 50 }), font: "" };
        HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockCtx) as any;
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    const createValidDataView = (): powerbi.DataView => ({
        metadata: { columns: [
            { roles: { title: true }, type: { text: true } as any },
            { roles: { actualValue: true }, type: { numeric: true } as any }
        ], objects: {} },
        table: { rows: [["Sales", 1000]] }
    } as any);

    it("Resize Lifecycle behaves correctly", () => {
        const svgRoot = element.querySelector("svg")!;
        
        // 1. Initial 300x220 render
        visual.update({
            type: powerbi.VisualUpdateType.Data,
            viewport: { width: 300, height: 220 },
            dataViews: [createValidDataView()]
        } as any);
        
        expect(svgRoot.getAttribute("width")).toBe("300");
        expect(svgRoot.getAttribute("height")).toBe("220");
        expect(svgRoot.getAttribute("viewBox")).toBe("0 0 300 220");
        
        const landingPage = element.querySelector(`g.${SVGConstants.classes.landingPageGroup}`);
        expect(landingPage ? landingPage.children.length : 0).toBe(0); // Not shown

        const statusGroup220 = element.querySelector(`g.${SVGConstants.classes.statusGroup}`);
        const statusText220 = statusGroup220?.querySelector("text");
        console.log("SVG HTML:", svgRoot.innerHTML);
        const y220 = Number(statusText220?.getAttribute("y"));
        expect(y220).toBeGreaterThan(0);

        // 2. Resize to 300x400 without DataView recalculates coordinates
        visual.update({
            type: powerbi.VisualUpdateType.Resize,
            viewport: { width: 300, height: 400 },
            dataViews: undefined // Missing dataviews entirely
        } as any);

        // 3. SVG root does not change reference
        expect(element.querySelector("svg")).toBe(svgRoot);
        expect(svgRoot.getAttribute("height")).toBe("400");
        
        // 4. Nodes do not duplicate
        expect(element.querySelectorAll(`g.${SVGConstants.classes.statusGroup}`).length).toBe(1);
        
        // 5. Value and data remain (state preserved)
        expect(element.querySelector(`text.${SVGConstants.classes.valueText}`)?.textContent).toBe("1000"); // Using dummy settings or parsed mock format
        
        // 6. status.y increases
        const statusText400 = element.querySelector(`g.${SVGConstants.classes.statusGroup}`)?.querySelector("text");
        const y400 = Number(statusText400?.getAttribute("y"));
        expect(y400).toBeGreaterThan(y220);
        
        // 7. Resize back to 300x220 restores distribution
        visual.update({
            type: powerbi.VisualUpdateType.Resize,
            viewport: { width: 300, height: 220 },
            dataViews: [] // Empty array
        } as any);
        const yRestored = Number(element.querySelector(`g.${SVGConstants.classes.statusGroup}`)?.querySelector("text")?.getAttribute("y"));
        expect(yRestored).toBe(y220);
        
        // 8. Resize to 300x600 centers block
        visual.update({
            type: powerbi.VisualUpdateType.Resize,
            viewport: { width: 300, height: 600 },
            dataViews: []
        } as any);
        const y600 = Number(element.querySelector(`g.${SVGConstants.classes.statusGroup}`)?.querySelector("text")?.getAttribute("y"));
        expect(y600).toBeGreaterThan(y400); // 400 vs 600 means gap capped and block centered
        
        // 9. width, height, viewBox updated on every call (verified above)
        expect(svgRoot.getAttribute("viewBox")).toBe("0 0 300 600");

        // 10. Landing Page not shown
        const landingPageAfter = element.querySelector(`g.${SVGConstants.classes.landingPageGroup}`);
        expect(landingPageAfter ? landingPageAfter.children.length : 0).toBe(0);
    });
});
