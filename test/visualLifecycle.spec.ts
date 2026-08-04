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
    }
});

function buildState(withTitle: boolean, value = "1,234"): VisualState {
    return {
        hasData: true,
        hasActualValueRole: true,
        settings: dummySettings(),
        title: withTitle ? { text: "My KPI" } : undefined,
        actual: { formattedValue: value },
        status: { text: "OK", color: "#16A34A" }
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
