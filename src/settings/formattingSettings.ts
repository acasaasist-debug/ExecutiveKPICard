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

class ComparisonCard extends Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        value: true
    });
    
    showPeriod = new formattingSettings.ToggleSwitch({
        name: "showPeriod",
        displayName: "Show Period",
        value: true
    });
    
    defaultPeriodText = new formattingSettings.TextInput({
        name: "defaultPeriodText",
        displayName: "Default Period Text",
        value: "vs período anterior",
        placeholder: ""
    });
    
    showVariation = new formattingSettings.ToggleSwitch({
        name: "showVariation",
        displayName: "Show Variation",
        value: true
    });
    
    showArrow = new formattingSettings.ToggleSwitch({
        name: "showArrow",
        displayName: "Show Arrow",
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
        value: 12
    });
    
    positiveColor = new formattingSettings.ColorPicker({
        name: "positiveColor",
        displayName: "Positive Color",
        value: { value: "#16A34A" }
    });
    
    negativeColor = new formattingSettings.ColorPicker({
        name: "negativeColor",
        displayName: "Negative Color",
        value: { value: "#DC2626" }
    });
    
    neutralColor = new formattingSettings.ColorPicker({
        name: "neutralColor",
        displayName: "Neutral Color",
        value: { value: "#6B7280" }
    });
    
    invertLogic = new formattingSettings.ToggleSwitch({
        name: "invertLogic",
        displayName: "Invert Logic",
        value: false
    });
    
    percentageDecimals = new formattingSettings.NumUpDown({
        name: "percentageDecimals",
        displayName: "Percentage Decimals",
        value: 1
    });
    
    noComparisonText = new formattingSettings.TextInput({
        name: "noComparisonText",
        displayName: "No Comparison Text",
        value: "-",
        placeholder: ""
    });

    name: string = "comparison";
    displayName: string = "Comparación";
    slices: Slice[] = [
        this.show,
        this.showPeriod,
        this.defaultPeriodText,
        this.showVariation,
        this.showArrow,
        this.fontFamily,
        this.fontSize,
        this.positiveColor,
        this.negativeColor,
        this.neutralColor,
        this.invertLogic,
        this.percentageDecimals,
        this.noComparisonText
    ];
}

class TargetCard extends Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        value: true
    });
    
    inheritValueFormat = new formattingSettings.ToggleSwitch({
        name: "inheritValueFormat",
        displayName: "Inherit Value Format",
        value: true
    });
    
    label = new formattingSettings.TextInput({
        name: "label",
        displayName: "Label",
        value: "Meta: ",
        placeholder: ""
    });
    
    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font Family",
        value: "Segoe UI"
    });
    
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        value: 12
    });
    
    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Color",
        value: { value: "#6B7280" }
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

    name: string = "target";
    displayName: string = "Meta";
    slices: Slice[] = [
        this.show,
        this.inheritValueFormat,
        this.label,
        this.fontFamily,
        this.fontSize,
        this.color,
        this.displayUnits,
        this.decimalPlaces,
        this.prefix,
        this.suffix
    ];
}

class ProgressCard extends Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        value: true
    });
    
    height = new formattingSettings.NumUpDown({
        name: "height",
        displayName: "Height",
        value: 10
    });
    
    radius = new formattingSettings.NumUpDown({
        name: "radius",
        displayName: "Radius",
        value: 4
    });
    
    backgroundColor = new formattingSettings.ColorPicker({
        name: "backgroundColor",
        displayName: "Background Color",
        value: { value: "#E5E7EB" }
    });
    
    useStatusColor = new formattingSettings.ToggleSwitch({
        name: "useStatusColor",
        displayName: "Use Status Color",
        value: true
    });
    
    customColor = new formattingSettings.ColorPicker({
        name: "customColor",
        displayName: "Custom Color",
        value: { value: "#3B82F6" }
    });
    
    showPercentage = new formattingSettings.ToggleSwitch({
        name: "showPercentage",
        displayName: "Show Percentage",
        value: true
    });
    
    percentageSize = new formattingSettings.NumUpDown({
        name: "percentageSize",
        displayName: "Percentage Size",
        value: 12
    });
    
    percentageColor = new formattingSettings.ColorPicker({
        name: "percentageColor",
        displayName: "Percentage Color",
        value: { value: "#6B7280" }
    });
    
    decimalPlaces = new formattingSettings.NumUpDown({
        name: "decimalPlaces",
        displayName: "Decimal Places",
        value: 0
    });
    
    showOverachievementMark = new formattingSettings.ToggleSwitch({
        name: "showOverachievementMark",
        displayName: "Show Overachievement Mark",
        value: true
    });
    
    markColor = new formattingSettings.ColorPicker({
        name: "markColor",
        displayName: "Mark Color",
        value: { value: "#111827" }
    });
    
    markThickness = new formattingSettings.NumUpDown({
        name: "markThickness",
        displayName: "Mark Thickness",
        value: 2
    });

    name: string = "progress";
    displayName: string = "Barra de progreso";
    slices: Slice[] = [
        this.show,
        this.height,
        this.radius,
        this.backgroundColor,
        this.useStatusColor,
        this.customColor,
        this.showPercentage,
        this.percentageSize,
        this.percentageColor,
        this.decimalPlaces,
        this.showOverachievementMark,
        this.markColor,
        this.markThickness
    ];
}

class StatusCard extends Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        value: true
    });
    
    statusSource = new formattingSettings.ItemDropdown({
        name: "statusSource",
        displayName: "Status Source",
        value: { value: "auto", displayName: "Automático" },
        items: [
            { value: "auto", displayName: "Automático" },
            { value: "data", displayName: "Desde datos" },
            { value: "custom", displayName: "Personalizado" }
        ]
    });
    
    showCircle = new formattingSettings.ToggleSwitch({
        name: "showCircle",
        displayName: "Show Circle",
        value: true
    });
    
    circleSize = new formattingSettings.NumUpDown({
        name: "circleSize",
        displayName: "Circle Size",
        value: 8
    });
    
    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font Family",
        value: "Segoe UI"
    });
    
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        value: 12
    });
    
    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Text Color",
        value: { value: "#6B7280" }
    });
    
    successThreshold = new formattingSettings.NumUpDown({
        name: "successThreshold",
        displayName: "Success Threshold",
        value: 1.00
    });
    
    warningThreshold = new formattingSettings.NumUpDown({
        name: "warningThreshold",
        displayName: "Warning Threshold",
        value: 0.90
    });
    
    successText = new formattingSettings.TextInput({
        name: "successText",
        displayName: "Success Text",
        value: "Cumpliendo",
        placeholder: "Cumpliendo"
    });
    
    warningText = new formattingSettings.TextInput({
        name: "warningText",
        displayName: "En camino",
        value: "En camino",
        placeholder: "En camino"
    });
    
    dangerText = new formattingSettings.TextInput({
        name: "dangerText",
        displayName: "Danger Text",
        value: "En riesgo",
        placeholder: "En riesgo"
    });
    
    noDataText = new formattingSettings.TextInput({
        name: "noDataText",
        displayName: "No Data Text",
        value: "Sin información",
        placeholder: "Sin información"
    });
    
    successColor = new formattingSettings.ColorPicker({
        name: "successColor",
        displayName: "Success Color",
        value: { value: "#16A34A" }
    });
    
    warningColor = new formattingSettings.ColorPicker({
        name: "warningColor",
        displayName: "Warning Color",
        value: { value: "#F59E0B" }
    });
    
    dangerColor = new formattingSettings.ColorPicker({
        name: "dangerColor",
        displayName: "Danger Color",
        value: { value: "#DC2626" }
    });
    
    neutralColor = new formattingSettings.ColorPicker({
        name: "neutralColor",
        displayName: "Neutral Color",
        value: { value: "#6B7280" }
    });

    name: string = "status";
    displayName: string = "Estado";
    slices: Slice[] = [
        this.show,
        this.statusSource,
        this.showCircle,
        this.circleSize,
        this.fontFamily,
        this.fontSize,
        this.color,
        this.successThreshold,
        this.warningThreshold,
        this.successText,
        this.warningText,
        this.dangerText,
        this.noDataText,
        this.successColor,
        this.warningColor,
        this.dangerColor,
        this.neutralColor
    ];
}

class ResponsiveCard extends Card {
    name: string = "responsive";
    displayName: string = "Diseño responsive";

    autoScale = new formattingSettings.ToggleSwitch({
        name: "autoScale",
        displayName: "Auto escalar",
        value: true
    });

    minWidth = new formattingSettings.NumUpDown({
        name: "minWidth",
        displayName: "Ancho mínimo",
        value: 180
    });

    minHeight = new formattingSettings.NumUpDown({
        name: "minHeight",
        displayName: "Alto mínimo",
        value: 140
    });

    hideSecondary = new formattingSettings.ToggleSwitch({
        name: "hideSecondary",
        displayName: "Ocultar secundarios",
        value: true
    });

    compactMode = new formattingSettings.ToggleSwitch({
        name: "compactMode",
        displayName: "Modo compacto",
        value: true
    });

    slices: Slice[] = [
        this.autoScale,
        this.minWidth,
        this.minHeight,
        this.hideSecondary,
        this.compactMode
    ];
}

export class VisualFormattingSettingsModel extends Model {
    generalCard = new GeneralCard();
    titleCard = new TitleCard();
    actualValueCard = new ActualValueCard();
    comparisonCard = new ComparisonCard();
    targetCard = new TargetCard();
    progressCard = new ProgressCard();
    statusCard = new StatusCard();
    responsiveCard = new ResponsiveCard();

    cards = [
        this.generalCard, 
        this.titleCard, 
        this.actualValueCard,
        this.comparisonCard,
        this.targetCard,
        this.progressCard,
        this.statusCard,
        this.responsiveCard
    ];
    
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
        
        // COMPARISON visibility
        const isComparisonVisible = this.comparisonCard.show.value;
        this.comparisonCard.showPeriod.visible = isComparisonVisible;
        this.comparisonCard.defaultPeriodText.visible = isComparisonVisible && this.comparisonCard.showPeriod.value;
        this.comparisonCard.showVariation.visible = isComparisonVisible;
        
        const showVariationOptions = isComparisonVisible && this.comparisonCard.showVariation.value;
        this.comparisonCard.showArrow.visible = showVariationOptions;
        this.comparisonCard.fontFamily.visible = isComparisonVisible;
        this.comparisonCard.fontSize.visible = isComparisonVisible;
        this.comparisonCard.positiveColor.visible = showVariationOptions;
        this.comparisonCard.negativeColor.visible = showVariationOptions;
        this.comparisonCard.neutralColor.visible = showVariationOptions;
        this.comparisonCard.invertLogic.visible = showVariationOptions;
        this.comparisonCard.percentageDecimals.visible = showVariationOptions;
        this.comparisonCard.noComparisonText.visible = showVariationOptions;
        
        // TARGET visibility
        const isTargetVisible = this.targetCard.show.value;
        this.targetCard.inheritValueFormat.visible = isTargetVisible;
        this.targetCard.label.visible = isTargetVisible;
        this.targetCard.fontFamily.visible = isTargetVisible;
        this.targetCard.fontSize.visible = isTargetVisible;
        this.targetCard.color.visible = isTargetVisible;
        
        const showTargetFormatProps = isTargetVisible && !this.targetCard.inheritValueFormat.value;
        this.targetCard.displayUnits.visible = showTargetFormatProps;
        this.targetCard.decimalPlaces.visible = showTargetFormatProps;
        this.targetCard.prefix.visible = showTargetFormatProps;
        this.targetCard.suffix.visible = showTargetFormatProps;
        
        // PROGRESS visibility
        const isProgressVisible = this.progressCard.show.value;
        this.progressCard.height.visible = isProgressVisible;
        this.progressCard.radius.visible = isProgressVisible;
        this.progressCard.backgroundColor.visible = isProgressVisible;
        this.progressCard.useStatusColor.visible = isProgressVisible;
        this.progressCard.customColor.visible = isProgressVisible && !this.progressCard.useStatusColor.value;
        this.progressCard.showPercentage.visible = isProgressVisible;
        
        const showPercentageProps = isProgressVisible && this.progressCard.showPercentage.value;
        this.progressCard.percentageSize.visible = showPercentageProps;
        this.progressCard.percentageColor.visible = showPercentageProps;
        this.progressCard.decimalPlaces.visible = showPercentageProps;
        
        this.progressCard.showOverachievementMark.visible = isProgressVisible;
        const showMarkProps = isProgressVisible && this.progressCard.showOverachievementMark.value;
        this.progressCard.markColor.visible = showMarkProps;
        this.progressCard.markThickness.visible = showMarkProps;
        
        // STATUS visibility
        const isStatusVisible = this.statusCard.show.value;
        this.statusCard.statusSource.visible = isStatusVisible;
        this.statusCard.showCircle.visible = isStatusVisible;
        this.statusCard.circleSize.visible = isStatusVisible && this.statusCard.showCircle.value;
        this.statusCard.fontFamily.visible = isStatusVisible;
        this.statusCard.fontSize.visible = isStatusVisible;
        this.statusCard.color.visible = isStatusVisible;
        this.statusCard.successThreshold.visible = isStatusVisible;
        this.statusCard.warningThreshold.visible = isStatusVisible;
        
        const statusValue = (this.statusCard.statusSource.value as any).value;
        const isCustomStatus = isStatusVisible && statusValue === "custom";
        this.statusCard.successText.visible = isCustomStatus;
        this.statusCard.warningText.visible = isCustomStatus;
        this.statusCard.dangerText.visible = isCustomStatus;
        this.statusCard.noDataText.visible = isCustomStatus || statusValue === "auto";
        this.statusCard.successColor.visible = isCustomStatus || statusValue === "auto";
        this.statusCard.warningColor.visible = isCustomStatus || statusValue === "auto";
        this.statusCard.dangerColor.visible = isCustomStatus || statusValue === "auto";
        this.statusCard.neutralColor.visible = isCustomStatus || statusValue === "auto";
        
        // RESPONSIVE visibility
        this.responsiveCard.autoScale.visible = true;
        this.responsiveCard.minWidth.visible = true;
        this.responsiveCard.minHeight.visible = true;
        this.responsiveCard.hideSecondary.visible = true;
        this.responsiveCard.compactMode.visible = true;
    }
}
