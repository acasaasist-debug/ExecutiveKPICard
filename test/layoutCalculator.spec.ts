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

    const createDummyState = (): VisualState => ({
        hasData: true,
        title: { text: "My Title" },
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
        status: { text: "On Track", color: "green" }
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
            expect(layout.mode).toBe(LayoutMode.MINIMUM);
            expect(layout.value.y).toBeGreaterThan(0);
        });

        it("handles zero viewport gracefully", () => {
            const layout = calculator.calculate({ width: 0, height: 0 }, createDummyState());
            expect(layout.mode).toBe(LayoutMode.MINIMUM);
            expect(layout.value.x).toBeGreaterThanOrEqual(0);
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
        
        it("calculates layout with ONLY actualValue safely", () => {
            const state: VisualState = {
                hasData: true,
                actual: { formattedValue: "1,234" }
            };
            const layout = calculator.calculate({ width: 300, height: 220 }, state);
            expect(layout.showTitle).toBe(false);
            expect(layout.showComparison).toBe(false);
            expect(layout.showTarget).toBe(false);
            expect(layout.showProgress).toBe(false);
            expect(layout.showStatus).toBe(false);
            expect(layout.value).toBeDefined();
        });
    });
});
