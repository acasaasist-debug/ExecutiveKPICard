import { VisualFormattingSettingsModel } from "../../src/settings/formattingSettings";

describe("VisualFormattingSettingsModel", () => {
    let model: VisualFormattingSettingsModel;

    beforeEach(() => {
        model = new VisualFormattingSettingsModel();
    });

    it("should create General, Title, ActualValue, Comparison, Target, Progress cards", () => {
        expect(model.cards.length).toBe(6);
        expect(model.generalCard.name).toBe("general");
        expect(model.titleCard.name).toBe("title");
        expect(model.actualValueCard.name).toBe("actualValue");
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
});
