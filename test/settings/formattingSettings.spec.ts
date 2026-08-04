import { VisualFormattingSettingsModel } from "../../src/settings/formattingSettings";

describe("VisualFormattingSettingsModel", () => {
    let model: VisualFormattingSettingsModel;

    beforeEach(() => {
        model = new VisualFormattingSettingsModel();
    });

    it("should create General, Title and ActualValue cards", () => {
        expect(model.cards.length).toBe(3);
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
});
