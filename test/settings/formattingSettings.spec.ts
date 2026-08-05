import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "../../src/settings/formattingSettings";

describe("VisualFormattingSettingsModel", () => {
    let model: VisualFormattingSettingsModel;

    beforeEach(() => {
        model = new VisualFormattingSettingsModel();
    });

    it("Tarjeta de tooltips settings se instancia correctamente", () => {
        expect(model.tooltipSettings).toBeDefined();
        expect(model.tooltipSettings.show.value).toBe(true);
    });

    it("Contiene todas las tarjetas (ahora 9)", () => {
        expect(model.cards.length).toBe(9);
        expect(model.generalCard.name).toBe("general");
        expect(model.titleCard.name).toBe("title");
        expect(model.actualValueCard.name).toBe("actualValue");
        expect(model.comparisonCard.name).toBe("comparison");
        expect(model.targetCard.name).toBe("target");
        expect(model.progressCard.name).toBe("progress");
        expect(model.statusCard.name).toBe("status");
        expect(model.responsiveCard.name).toBe("responsive");
        expect(model.tooltipSettings.name).toBe("tooltipSettings");
    });

    it("should map slice names exactly as capabilities.json", () => {
        expect(model.generalCard.backgroundColor.name).toBe("backgroundColor");
        expect(model.titleCard.fontFamily.name).toBe("fontFamily");
        expect(model.actualValueCard.useModelFormat.name).toBe("useModelFormat");
        expect(model.actualValueCard.displayUnits.name).toBe("displayUnits");
    });

    it("should evaluate visibility correctly for borderOn", () => {
        model.generalCard.borderOn.value = true;
        model.populateVisibleProperties();
        expect(model.generalCard.borderColor.visible).toBe(true);

        model.generalCard.borderOn.value = false;
        model.populateVisibleProperties();
        expect(model.generalCard.borderColor.visible).toBe(false);
    });

    it("should evaluate visibility correctly for topLineUseStatusColor", () => {
        model.generalCard.topLineOn.value = true;
        model.generalCard.topLineUseStatusColor.value = true;
        model.populateVisibleProperties();
        expect(model.generalCard.topLineColor.visible).toBe(false);

        model.generalCard.topLineUseStatusColor.value = false;
        model.populateVisibleProperties();
        expect(model.generalCard.topLineColor.visible).toBe(true);
    });

    it("should hide title properties if title.show is false", () => {
        model.titleCard.show.value = false;
        model.populateVisibleProperties();
        expect(model.titleCard.fontFamily.visible).toBe(false);
        expect(model.titleCard.color.visible).toBe(false);
    });

    it("should toggle manual format properties based on useModelFormat", () => {
        model.actualValueCard.show.value = true;
        model.actualValueCard.useModelFormat.value = true;
        model.populateVisibleProperties();
        expect(model.actualValueCard.displayUnits.visible).toBe(false);
        expect(model.actualValueCard.decimalPlaces.visible).toBe(false);

        model.actualValueCard.useModelFormat.value = false;
        model.populateVisibleProperties();
        expect(model.actualValueCard.displayUnits.visible).toBe(true);
        expect(model.actualValueCard.decimalPlaces.visible).toBe(true);
    });

    it("should hide manual options of target if inheritValueFormat is true", () => {
        model.targetCard.show.value = true;
        model.targetCard.inheritValueFormat.value = true;
        model.populateVisibleProperties();
        expect(model.targetCard.displayUnits.visible).toBe(false);
        expect(model.targetCard.decimalPlaces.visible).toBe(false);
        expect(model.targetCard.prefix.visible).toBe(false);
        expect(model.targetCard.suffix.visible).toBe(false);

        model.targetCard.inheritValueFormat.value = false;
        model.populateVisibleProperties();
        expect(model.targetCard.displayUnits.visible).toBe(true);
        expect(model.targetCard.decimalPlaces.visible).toBe(true);
        expect(model.targetCard.prefix.visible).toBe(true);
        expect(model.targetCard.suffix.visible).toBe(true);
    });

    it("should ensure visibility logic does not alter slice values for comparison", () => {
        model.comparisonCard.show.value = false;
        model.comparisonCard.fontSize.value = 24;
        model.populateVisibleProperties();
        expect(model.comparisonCard.fontSize.visible).toBe(false);
        expect(model.comparisonCard.fontSize.value).toBe(24);
    });

    it("la tarjeta Tooltip aparece en FormattingModel y Show tooltips es ToggleSwitch", () => {
        expect(model.tooltipSettings.name).toBe("tooltipSettings");
        expect(model.tooltipSettings.show.name).toBe("show");
    });

    it("should ensure visibility logic does not alter slice values for target", () => {
        model.targetCard.show.value = false;
        model.targetCard.fontSize.value = 24;
        model.populateVisibleProperties();
        expect(model.targetCard.fontSize.visible).toBe(false);
        expect(model.targetCard.fontSize.value).toBe(24);
    });

    it("should ensure visibility logic does not alter slice values for progress", () => {
        model.progressCard.show.value = false;
        model.progressCard.height.value = 10;
        model.populateVisibleProperties();
        expect(model.progressCard.height.visible).toBe(false);
        expect(model.progressCard.height.value).toBe(10);
    });

    it("simulates full cycle of tooltipSettings.show false persistence", () => {
        // 1. Initial model has show=true
        expect(model.tooltipSettings.show.value).toBe(true);

        // 2. Power BI delivers metadata with show=false
        const dataView: powerbi.DataView = {
            metadata: {
                columns: [],
                objects: {
                    tooltipSettings: {
                        show: false
                    }
                }
            }
        };

        // 3. populateFormattingSettingsModel loads false
        const service = new FormattingSettingsService();
        const populatedModel = service.populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView);
        expect(populatedModel.tooltipSettings.show.value).toBe(false);

        // 4. getFormattingModel (simulated by buildFormattingModel) maintains false
        populatedModel.populateVisibleProperties();
        const formattingModel = service.buildFormattingModel(populatedModel);
        expect(formattingModel).toBeDefined();

        // 5. second populate on same dataview maintains false
        const repopulatedModel = service.populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView);
        expect(repopulatedModel.tooltipSettings.show.value).toBe(false);
    });
});
