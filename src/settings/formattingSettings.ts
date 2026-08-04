import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import Card = formattingSettings.SimpleCard;
import Slice = formattingSettings.Slice;
import Model = formattingSettings.Model;

class GeneralCard extends Card {
    backgroundColor = new formattingSettings.ColorPicker({
        name: "backgroundColor",
        displayName: "Background Color",
        value: { value: "#FFFFFF" }
    });
    
    transparency = new formattingSettings.NumUpDown({
        name: "transparency",
        displayName: "Transparency",
        value: 0
    });
    
    borderOn = new formattingSettings.ToggleSwitch({
        name: "borderOn",
        displayName: "Border",
        value: true
    });
    
    borderColor = new formattingSettings.ColorPicker({
        name: "borderColor",
        displayName: "Border Color",
        value: { value: "#D7DDE5" }
    });
    
    borderThickness = new formattingSettings.NumUpDown({
        name: "borderThickness",
        displayName: "Border Thickness",
        value: 1
    });
    
    cornerRadius = new formattingSettings.NumUpDown({
        name: "cornerRadius",
        displayName: "Corner Radius",
        value: 12
    });
    
    padding = new formattingSettings.NumUpDown({
        name: "padding",
        displayName: "Padding",
        value: 16
    });
    
    topLineOn = new formattingSettings.ToggleSwitch({
        name: "topLineOn",
        displayName: "Top Line",
        value: true
    });
    
    topLineUseStatusColor = new formattingSettings.ToggleSwitch({
        name: "topLineUseStatusColor",
        displayName: "Use Status Color",
        value: true
    });
    
    topLineThickness = new formattingSettings.NumUpDown({
        name: "topLineThickness",
        displayName: "Top Line Thickness",
        value: 3
    });
    
    topLineColor = new formattingSettings.ColorPicker({
        name: "topLineColor",
        displayName: "Top Line Color",
        value: { value: "#3B82F6" }
    });

    name: string = "general";
    displayName: string = "General";
    slices: Slice[] = [
        this.backgroundColor,
        this.transparency,
        this.borderOn,
        this.borderColor,
        this.borderThickness,
        this.cornerRadius,
        this.padding,
        this.topLineOn,
        this.topLineUseStatusColor,
        this.topLineThickness,
        this.topLineColor
    ];
}

class TitleCard extends Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        value: true
    });
    
    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font Family",
        value: "Segoe UI"
    });
    
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        value: 14
    });
    
    bold = new formattingSettings.ToggleSwitch({
        name: "bold",
        displayName: "Bold",
        value: true
    });
    
    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Font Color",
        value: { value: "#111827" }
    });
    
    alignment = new formattingSettings.AlignmentGroup({
        name: "alignment",
        displayName: "Alignment",
        mode: powerbi.visuals.AlignmentGroupMode.Horizonal,
        value: "center"
    });
    
    bottomMargin = new formattingSettings.NumUpDown({
        name: "bottomMargin",
        displayName: "Bottom Margin",
        value: 4
    });

    name: string = "title";
    displayName: string = "Título";
    slices: Slice[] = [
        this.show,
        this.fontFamily,
        this.fontSize,
        this.bold,
        this.color,
        this.alignment,
        this.bottomMargin
    ];
}

class ActualValueCard extends Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        value: true
    });
    
    useModelFormat = new formattingSettings.ToggleSwitch({
        name: "useModelFormat",
        displayName: "Use Model Format",
        value: true
    });
    
    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font Family",
        value: "Segoe UI"
    });
    
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        value: 32
    });
    
    bold = new formattingSettings.ToggleSwitch({
        name: "bold",
        displayName: "Bold",
        value: true
    });
    
    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Font Color",
        value: { value: "#111827" }
    });
    
    alignment = new formattingSettings.AlignmentGroup({
        name: "alignment",
        displayName: "Alignment",
        mode: powerbi.visuals.AlignmentGroupMode.Horizonal,
        value: "center"
    });
    
    displayUnits = new formattingSettings.AutoDropdown({
        name: "displayUnits",
        displayName: "Display Units",
        value: 0
    });
    
    decimalPlaces = new formattingSettings.NumUpDown({
        name: "decimalPlaces",
        displayName: "Decimal Places",
        value: 0
    });
    
    prefix = new formattingSettings.TextInput({
        name: "prefix",
        displayName: "Prefix",
        value: "",
        placeholder: ""
    });
    
    suffix = new formattingSettings.TextInput({
        name: "suffix",
        displayName: "Suffix",
        value: "",
        placeholder: ""
    });
    
    thousandsSeparator = new formattingSettings.ToggleSwitch({
        name: "thousandsSeparator",
        displayName: "Thousands Separator",
        value: true
    });
    
    showDashIfNull = new formattingSettings.ToggleSwitch({
        name: "showDashIfNull",
        displayName: "Show Dash if Null",
        value: true
    });

    name: string = "actualValue";
    displayName: string = "Valor Principal";
    slices: Slice[] = [
        this.show,
        this.useModelFormat,
        this.fontFamily,
        this.fontSize,
        this.bold,
        this.color,
        this.alignment,
        this.displayUnits,
        this.decimalPlaces,
        this.prefix,
        this.suffix,
        this.thousandsSeparator,
        this.showDashIfNull
    ];
}

export class VisualFormattingSettingsModel extends Model {
    generalCard = new GeneralCard();
    titleCard = new TitleCard();
    actualValueCard = new ActualValueCard();

    cards = [this.generalCard, this.titleCard, this.actualValueCard];
    
    public populateVisibleProperties() {
        // GENERAL visibility
        this.generalCard.borderColor.visible = this.generalCard.borderOn.value;
        this.generalCard.borderThickness.visible = this.generalCard.borderOn.value;
        
        this.generalCard.topLineUseStatusColor.visible = this.generalCard.topLineOn.value;
        this.generalCard.topLineThickness.visible = this.generalCard.topLineOn.value;
        this.generalCard.topLineColor.visible = this.generalCard.topLineOn.value && !this.generalCard.topLineUseStatusColor.value;
        
        // TITLE visibility
        const isTitleVisible = this.titleCard.show.value;
        this.titleCard.fontFamily.visible = isTitleVisible;
        this.titleCard.fontSize.visible = isTitleVisible;
        this.titleCard.bold.visible = isTitleVisible;
        this.titleCard.color.visible = isTitleVisible;
        this.titleCard.alignment.visible = isTitleVisible;
        this.titleCard.bottomMargin.visible = isTitleVisible;
        
        // ACTUAL VALUE visibility
        const isActualValueVisible = this.actualValueCard.show.value;
        this.actualValueCard.useModelFormat.visible = isActualValueVisible;
        this.actualValueCard.fontFamily.visible = isActualValueVisible;
        this.actualValueCard.fontSize.visible = isActualValueVisible;
        this.actualValueCard.bold.visible = isActualValueVisible;
        this.actualValueCard.color.visible = isActualValueVisible;
        this.actualValueCard.alignment.visible = isActualValueVisible;
        this.actualValueCard.showDashIfNull.visible = isActualValueVisible;
        
        // Format properties only visible if !useModelFormat.value and card is shown
        const showFormatProps = isActualValueVisible && !this.actualValueCard.useModelFormat.value;
        this.actualValueCard.displayUnits.visible = showFormatProps;
        this.actualValueCard.decimalPlaces.visible = showFormatProps;
        this.actualValueCard.prefix.visible = showFormatProps;
        this.actualValueCard.suffix.visible = showFormatProps;
        this.actualValueCard.thousandsSeparator.visible = showFormatProps;
    }
}
