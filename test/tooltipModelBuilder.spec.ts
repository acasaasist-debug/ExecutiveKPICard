import { buildTooltipModels, TooltipModelBuilderInput } from "../src/interactions/tooltipModelBuilder";
import { InteractionTarget } from "../src/models/interactionModel";
import { KpiData } from "../src/models/kpiData";
import { VisualState } from "../src/models/visualState";
import { KpiLayout } from "../src/models/layout";
import powerbi from "powerbi-visuals-api";

describe("TooltipModelBuilder", () => {
    let input: TooltipModelBuilderInput;

    beforeEach(() => {
        const kpiData: KpiData = {
            hasActualValueRole: true,
            actualValue: 100,
            previousValue: 80,
            variation: 0.25,
            target: 120,
            achievement: 0.8333,
            status: "OK",
            statusColor: "#00FF00",
            variationColor: "#00FF00",
            trendIcon: "▲"
        };

        const state: VisualState = {
            hasData: true,
            hasActualValueRole: true,
            settings: {
                general: {} as any,
                title: {} as any,
                actualValue: {} as any,
                comparison: { show: true, defaultPeriodText: "YTD" } as any,
                target: { show: true, label: "Meta: " } as any,
                progress: { show: true } as any,
                status: {
                    show: true,
                    successText: "Cumpliendo",
                    warningText: "En camino",
                    dangerText: "En riesgo",
                    noDataText: "Sin información",
                    effectiveSuccessThreshold: 0,
                    effectiveWarningThreshold: 0
                } as any,
                responsive: {} as any,
                tooltip: { show: true }
            },
            title: { text: "My KPI" },
            actual: { formattedValue: "100" },
            comparison: {
                period: "Q1",
                formattedVariation: "+25%",
                trend: "up",
                trendIcon: "▲",
                isFavorable: true
            },
            target: { formattedValue: "120" },
            achievement: { formattedValue: "83%", progressRatio: 0.83 },
            statusCategory: "success",
            calculatedStatusText: "On Track",
            calculatedStatusColor: "#00FF00",
            calculatedVariationColor: "#00FF00"
        };

        const layout: KpiLayout = {
            responsiveMode: "normal",
            hiddenByResponsive: [],
            effectiveFontSizes: {} as any,
            fits: true,
            contentTop: 0,
            contentBottom: 100,
            viewport: { width: 200, height: 100 },
            padding: 10,
            showTitle: true,
            showComparison: true,
            showTarget: true,
            showProgress: true,
            showStatus: true,
            accent: {} as any,
            value: {} as any
        };

        const metadataColumns: powerbi.DataViewMetadataColumn[] = [
            { displayName: "KPI VALORR", roles: { actualValue: true } },
            { displayName: "Valor Anterior Técnico", roles: { previousValue: true } },
            { displayName: "KPI Meta Test", roles: { target: true } }
        ];

        input = { kpiData, state, layout, metadataColumns };
    });

    it("Card contiene únicamente bloques visibles", () => {
        const result = buildTooltipModels(input);
        const cardModel = result.get("card");
        expect(cardModel?.visible).toBe(true);
        const displayNames = cardModel?.items.map((i: any) => i.displayName);
        expect(displayNames).toEqual([
            "Título",
            "Valor actual",
            "Variación",
            "Meta",
            "Cumplimiento",
            "Estado"
        ]);
    });

    it("Card usa 'Valor actual' aunque la medida se llame 'KPI VALORR'", () => {
        const result = buildTooltipModels(input);
        const cardModel = result.get("card");
        const actualValueItem = cardModel?.items.find((i: any) => i.value === "100");
        expect(actualValueItem?.displayName).toBe("Valor actual");
    });

    it("Card usa 'Meta' aunque la medida se llame 'KPI Meta Test'", () => {
        const result = buildTooltipModels(input);
        const cardModel = result.get("card");
        const targetItem = cardModel?.items.find((i: any) => i.value === "120");
        expect(targetItem?.displayName).toBe("Meta");
    });

    it("ActualValue usa displayName semántico ('Valor actual') y valor formateado", () => {
        const result = buildTooltipModels(input);
        const valModel = result.get("actualValue");
        expect(valModel?.visible).toBe(true);
        expect(valModel?.items).toEqual([
            { displayName: "Valor actual", value: "100" }
        ]);
    });

    it("Comparison usa etiquetas semánticas y omite metadata", () => {
        const result = buildTooltipModels(input);
        const compModel = result.get("comparison");
        expect(compModel?.visible).toBe(true);
        expect(compModel?.items).toEqual([
            { displayName: "Período", value: "Q1" },
            { displayName: "Valor anterior", value: "80" },
            { displayName: "Variación", value: "+25%" },
            { displayName: "Tendencia", value: "Favorable" }
        ]);
    });

    it("Target usa settings.target.label cuando está configurado", () => {
        const result = buildTooltipModels(input);
        const targetModel = result.get("target");
        expect(targetModel?.visible).toBe(true);
        expect(targetModel?.items).toEqual([
            { displayName: "Meta:", value: "120" } // trim() removes trailing space
        ]);
    });

    it("Target usa 'Meta' cuando label está vacío o es inválido", () => {
        input.state.settings.target.label = "   "; // invalid empty
        const result = buildTooltipModels(input);
        const targetModel = result.get("target");
        expect(targetModel?.items).toEqual([
            { displayName: "Meta", value: "120" }
        ]);
    });

    it("Progress usa cumplimiento real superior a 100% y etiqueta 'Meta'", () => {
        input.state.achievement!.formattedValue = "150%";
        const result = buildTooltipModels(input);
        const progModel = result.get("progress");
        expect(progModel?.visible).toBe(true);
        expect(progModel?.items).toEqual([
            { displayName: "Cumplimiento", value: "150%" },
            { displayName: "Meta", value: "120" }
        ]);
    });

    it("Status usa texto y categoría", () => {
        const result = buildTooltipModels(input);
        const statModel = result.get("status");
        expect(statModel?.visible).toBe(true);
        expect(statModel?.items).toEqual([
            { displayName: "Estado", value: "On Track" },
            { displayName: "Categoría", value: "Éxito" }
        ]);
    });

    it("Excluye undefined", () => {
        input.state.title = undefined;
        const result = buildTooltipModels(input);
        const cardModel = result.get("card");
        expect(cardModel?.items.find((i: any) => i.displayName === "Título")).toBeUndefined();
    });

    it("Excluye NaN", () => {
        input.state.achievement!.formattedValue = "NaN%";
        const result = buildTooltipModels(input);
        const progModel = result.get("progress");
        // Only target remains if achievement value string contains NaN
        expect(progModel?.items).toEqual([
            { displayName: "Meta", value: "120" }
        ]);
    });

    it("Excluye Infinity", () => {
        input.state.comparison!.formattedVariation = "+Infinity%";
        const result = buildTooltipModels(input);
        const compModel = result.get("comparison");
        expect(compModel?.items.find((i: any) => i.displayName === "Variación")).toBeUndefined();
    });

    it("Excluye strings vacíos", () => {
        input.state.calculatedStatusText = "   ";
        const result = buildTooltipModels(input);
        const statModel = result.get("status");
        expect(statModel?.visible).toBe(false);
    });

    it("Respeta hiddenByResponsive", () => {
        input.layout.hiddenByResponsive = ["comparison", "target"];
        const result = buildTooltipModels(input);
        expect(result.get("comparison")?.visible).toBe(false);
        expect(result.get("target")?.visible).toBe(false);
        
        const cardModel = result.get("card");
        expect(cardModel?.items.find((i: any) => i.displayName === "Variación")).toBeUndefined();
        expect(cardModel?.items.find((i: any) => i.displayName === "Meta")).toBeUndefined();
    });

    it("No recalcula valores", () => {
        // Just verify it uses exactly what's in state
        input.state.actual.formattedValue = "Formatted123";
        const result = buildTooltipModels(input);
        expect(result.get("actualValue")?.items[0].value).toBe("Formatted123");
    });

    it("Ningún nombre técnico de medida aparece en los seis tooltips", () => {
        input.state.settings.target.label = ""; // Force fallback to 'Meta'
        const result = buildTooltipModels(input);
        
        const technicalNames = ["KPI VALORR", "Valor Anterior Técnico", "KPI Meta Test"];
        
        for (const [_, model] of result.entries()) {
            for (const item of model.items) {
                expect(technicalNames).not.toContain(item.displayName);
            }
        }
    });
});
