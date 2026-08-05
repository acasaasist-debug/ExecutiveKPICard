import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { LocalizationKeys as LK } from "../localization/localizationKeys";

import Card = formattingSettings.SimpleCard;
import Slice = formattingSettings.Slice;
import Model = formattingSettings.Model;

class GeneralCard extends Card {
    backgroundColor = new formattingSettings.ColorPicker({
        name: "backgroundColor",
        displayName: "Background Color",
        displayNameKey: LK.Slice.BackgroundColor,
        value: { value: "#FFFFFF" }
    });
    
    transparency = new formattingSettings.NumUpDown({
        name: "transparency",
        displayName: "Transparency",
        displayNameKey: LK.Slice.Transparency,
        value: 0
    });
    
    borderOn = new formattingSettings.ToggleSwitch({
        name: "borderOn",
        displayName: "Border",
        displayNameKey: LK.Slice.Border,
        value: true
    });
    
    borderColor = new formattingSettings.ColorPicker({
        name: "borderColor",
        displayName: "Border Color",
        displayNameKey: LK.Slice.BorderColor,
        value: { value: "#D7DDE5" }
    });
    
    borderThickness = new formattingSettings.NumUpDown({
        name: "borderThickness",
        displayName: "Border Thickness",
        displayNameKey: LK.Slice.BorderThickness,
        value: 1
    });
    
    cornerRadius = new formattingSettings.NumUpDown({
        name: "cornerRadius",
        displayName: "Corner Radius",
        displayNameKey: LK.Slice.CornerRadius,
        value: 12
    });
    
    padding = new formattingSettings.NumUpDown({
        name: "padding",
        displayName: "Padding",
        displayNameKey: LK.Slice.Padding,
        value: 16
    });
    
    topLineOn = new formattingSettings.ToggleSwitch({
        name: "topLineOn",
        displayName: "Top Line",
        displayNameKey: LK.Slice.TopLine,
        value: true
    });
    
    topLineUseStatusColor = new formattingSettings.ToggleSwitch({
        name: "topLineUseStatusColor",
        displayName: "Use Status Color",
        displayNameKey: LK.Slice.UseStatusColor,
        value: true
    });
    
    topLineThickness = new formattingSettings.NumUpDown({
        name: "topLineThickness",
        displayName: "Top Line Thickness",
        displayNameKey: LK.Slice.TopLineThickness,
        value: 3
    });
    
    topLineColor = new formattingSettings.ColorPicker({
        name: "topLineColor",
        displayName: "Top Line Color",
        displayNameKey: LK.Slice.TopLineColor,
        value: { value: "#3B82F6" }
    });

    name: string = "general";
    displayName: string = "General";
    displayNameKey: string = LK.Card.General;
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
        displayNameKey: LK.Slice.Show,
        value: true
    });
    
    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font Family",
        displayNameKey: LK.Slice.FontFamily,
        value: "Segoe UI"
    });
    
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        displayNameKey: LK.Slice.TextSize,
        value: 14
    });
    
    bold = new formattingSettings.ToggleSwitch({
        name: "bold",
        displayName: "Bold",
        displayNameKey: LK.Slice.Bold,
        value: true
    });
    
    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Font Color",
        displayNameKey: LK.Slice.FontColor,
        value: { value: "#111827" }
    });
    
    alignment = new formattingSettings.AlignmentGroup({
        name: "alignment",
        displayName: "Alignment",
        displayNameKey: LK.Slice.Alignment,
        mode: powerbi.visuals.AlignmentGroupMode.Horizonal,
        value: "center"
    });
    
    bottomMargin = new formattingSettings.NumUpDown({
        name: "bottomMargin",
        displayName: "Bottom Margin",
        displayNameKey: LK.Slice.BottomMargin,
        value: 4
    });

    name: string = "title";
    displayName: string = "Title";
    displayNameKey: string = LK.Card.Title;
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
        displayNameKey: LK.Slice.Show,
        value: true
    });
    
    useModelFormat = new formattingSettings.ToggleSwitch({
        name: "useModelFormat",
        displayName: "Use Model Format",
        displayNameKey: LK.Slice.UseModelFormat,
        value: true
    });
    
    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font Family",
        displayNameKey: LK.Slice.FontFamily,
        value: "Segoe UI"
    });
    
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        displayNameKey: LK.Slice.TextSize,
        value: 32
    });
    
    bold = new formattingSettings.ToggleSwitch({
        name: "bold",
        displayName: "Bold",
        displayNameKey: LK.Slice.Bold,
        value: true
    });
    
    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Font Color",
        displayNameKey: LK.Slice.FontColor,
        value: { value: "#111827" }
    });
    
    alignment = new formattingSettings.AlignmentGroup({
        name: "alignment",
        displayName: "Alignment",
        displayNameKey: LK.Slice.Alignment,
        mode: powerbi.visuals.AlignmentGroupMode.Horizonal,
        value: "center"
    });
    
    displayUnits = new formattingSettings.AutoDropdown({
        name: "displayUnits",
        displayName: "Display Units",
        displayNameKey: LK.Slice.DisplayUnits,
        value: 0
    });
    
    decimalPlaces = new formattingSettings.NumUpDown({
        name: "decimalPlaces",
        displayName: "Decimal Places",
        displayNameKey: LK.Slice.DecimalPlaces,
        value: 0
    });
    
    prefix = new formattingSettings.TextInput({
        name: "prefix",
        displayName: "Prefix",
        displayNameKey: LK.Slice.Prefix,
        value: "",
        placeholder: ""
    });
    
    suffix = new formattingSettings.TextInput({
        name: "suffix",
        displayName: "Suffix",
        displayNameKey: LK.Slice.Suffix,
        value: "",
        placeholder: ""
    });
    
    thousandsSeparator = new formattingSettings.ToggleSwitch({
        name: "thousandsSeparator",
        displayName: "Thousands Separator",
        displayNameKey: LK.Slice.ThousandsSeparator,
        value: true
    });
    
    showDashIfNull = new formattingSettings.ToggleSwitch({
        name: "showDashIfNull",
        displayName: "Show Dash if Null",
        displayNameKey: LK.Slice.ShowDashIfNull,
        value: true
    });

    name: string = "actualValue";
    displayName: string = "Actual Value";
    displayNameKey: string = LK.Card.ActualValue;
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
        displayNameKey: LK.Slice.Show,
        value: true
    });
    
    showPeriod = new formattingSettings.ToggleSwitch({
        name: "showPeriod",
        displayName: "Show Period",
        displayNameKey: LK.Slice.ShowPeriod,
        value: true
    });
    
    defaultPeriodText = new formattingSettings.TextInput({
        name: "defaultPeriodText",
        displayName: "Default Period Text",
        displayNameKey: LK.Slice.DefaultPeriodText,
        value: "vs período anterior",
        placeholder: ""
    });
    
    showVariation = new formattingSettings.ToggleSwitch({
        name: "showVariation",
        displayName: "Show Variation",
        displayNameKey: LK.Slice.ShowVariation,
        value: true
    });
    
    showArrow = new formattingSettings.ToggleSwitch({
        name: "showArrow",
        displayName: "Show Arrow",
        displayNameKey: LK.Slice.ShowArrow,
        value: true
    });
    
    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font Family",
        displayNameKey: LK.Slice.FontFamily,
        value: "Segoe UI"
    });
    
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        displayNameKey: LK.Slice.TextSize,
        value: 12
    });
    
    positiveColor = new formattingSettings.ColorPicker({
        name: "positiveColor",
        displayName: "Positive Color",
        displayNameKey: LK.Slice.PositiveColor,
        value: { value: "#16A34A" }
    });
    
    negativeColor = new formattingSettings.ColorPicker({
        name: "negativeColor",
        displayName: "Negative Color",
        displayNameKey: LK.Slice.NegativeColor,
        value: { value: "#DC2626" }
    });
    
    neutralColor = new formattingSettings.ColorPicker({
        name: "neutralColor",
        displayName: "Neutral Color",
        displayNameKey: LK.Slice.NeutralColor,
        value: { value: "#6B7280" }
    });
    
    invertLogic = new formattingSettings.ToggleSwitch({
        name: "invertLogic",
        displayName: "Invert Logic",
        displayNameKey: LK.Slice.InvertLogic,
        value: false
    });
    
    percentageDecimals = new formattingSettings.NumUpDown({
        name: "percentageDecimals",
        displayName: "Percentage Decimals",
        displayNameKey: LK.Slice.PercentageDecimals,
        value: 1
    });
    
    noComparisonText = new formattingSettings.TextInput({
        name: "noComparisonText",
        displayName: "No Comparison Text",
        displayNameKey: LK.Slice.NoComparisonText,
        value: "-",
        placeholder: ""
    });

    name: string = "comparison";
    displayName: string = "Comparison";
    displayNameKey: string = LK.Card.Comparison;
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
        displayNameKey: LK.Slice.Show,
        value: true
    });
    
    inheritValueFormat = new formattingSettings.ToggleSwitch({
        name: "inheritValueFormat",
        displayName: "Inherit Value Format",
        displayNameKey: LK.Slice.InheritValueFormat,
        value: true
    });
    
    label = new formattingSettings.TextInput({
        name: "label",
        displayName: "Label",
        displayNameKey: LK.Slice.Label,
        value: "Meta: ",
        placeholder: ""
    });
    
    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font Family",
        displayNameKey: LK.Slice.FontFamily,
        value: "Segoe UI"
    });
    
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        displayNameKey: LK.Slice.TextSize,
        value: 12
    });
    
    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Color",
        displayNameKey: LK.Slice.Color,
        value: { value: "#6B7280" }
    });
    
    displayUnits = new formattingSettings.AutoDropdown({
        name: "displayUnits",
        displayName: "Display Units",
        displayNameKey: LK.Slice.DisplayUnits,
        value: 0
    });
    
    decimalPlaces = new formattingSettings.NumUpDown({
        name: "decimalPlaces",
        displayName: "Decimal Places",
        displayNameKey: LK.Slice.DecimalPlaces,
        value: 0
    });
    
    prefix = new formattingSettings.TextInput({
        name: "prefix",
        displayName: "Prefix",
        displayNameKey: LK.Slice.Prefix,
        value: "",
        placeholder: ""
    });
    
    suffix = new formattingSettings.TextInput({
        name: "suffix",
        displayName: "Suffix",
        displayNameKey: LK.Slice.Suffix,
        value: "",
        placeholder: ""
    });

    name: string = "target";
    displayName: string = "Target";
    displayNameKey: string = LK.Card.Target;
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
        displayNameKey: LK.Slice.Show,
        value: true
    });
    
    height = new formattingSettings.NumUpDown({
        name: "height",
        displayName: "Height",
        displayNameKey: LK.Slice.Height,
        value: 10
    });
    
    radius = new formattingSettings.NumUpDown({
        name: "radius",
        displayName: "Radius",
        displayNameKey: LK.Slice.Radius,
        value: 4
    });
    
    backgroundColor = new formattingSettings.ColorPicker({
        name: "backgroundColor",
        displayName: "Background Color",
        displayNameKey: LK.Slice.BackgroundColor,
        value: { value: "#E5E7EB" }
    });
    
    useStatusColor = new formattingSettings.ToggleSwitch({
        name: "useStatusColor",
        displayName: "Use Status Color",
        displayNameKey: LK.Slice.UseStatusColor,
        value: true
    });
    
    customColor = new formattingSettings.ColorPicker({
        name: "customColor",
        displayName: "Custom Color",
        displayNameKey: LK.Slice.CustomColor,
        value: { value: "#3B82F6" }
    });
    
    showPercentage = new formattingSettings.ToggleSwitch({
        name: "showPercentage",
        displayName: "Show Percentage",
        displayNameKey: LK.Slice.ShowPercentage,
        value: true
    });
    
    percentageSize = new formattingSettings.NumUpDown({
        name: "percentageSize",
        displayName: "Percentage Size",
        displayNameKey: LK.Slice.PercentageSize,
        value: 12
    });
    
    percentageColor = new formattingSettings.ColorPicker({
        name: "percentageColor",
        displayName: "Percentage Color",
        displayNameKey: LK.Slice.PercentageColor,
        value: { value: "#6B7280" }
    });
    
    decimalPlaces = new formattingSettings.NumUpDown({
        name: "decimalPlaces",
        displayName: "Decimal Places",
        displayNameKey: LK.Slice.DecimalPlaces,
        value: 0
    });
    
    showOverachievementMark = new formattingSettings.ToggleSwitch({
        name: "showOverachievementMark",
        displayName: "Show Overachievement Mark",
        displayNameKey: LK.Slice.ShowOverachievementMark,
        value: true
    });
    
    markColor = new formattingSettings.ColorPicker({
        name: "markColor",
        displayName: "Mark Color",
        displayNameKey: LK.Slice.MarkColor,
        value: { value: "#111827" }
    });
    
    markThickness = new formattingSettings.NumUpDown({
        name: "markThickness",
        displayName: "Mark Thickness",
        displayNameKey: LK.Slice.MarkThickness,
        value: 2
    });

    name: string = "progress";
    displayName: string = "Progress Bar";
    displayNameKey: string = LK.Card.Progress;
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
        displayNameKey: LK.Slice.Show,
        value: true
    });
    
    statusSource = new formattingSettings.ItemDropdown({
        name: "statusSource",
        displayName: "Status Source",
        displayNameKey: LK.Slice.StatusSource,
        value: { value: "auto", displayName: "Automatic" },
        items: [
            { value: "auto", displayName: "Automatic" },
            { value: "data", displayName: "From data" },
            { value: "custom", displayName: "Custom" }
        ]
    });
    
    showCircle = new formattingSettings.ToggleSwitch({
        name: "showCircle",
        displayName: "Show Circle",
        displayNameKey: LK.Slice.ShowCircle,
        value: true
    });
    
    circleSize = new formattingSettings.NumUpDown({
        name: "circleSize",
        displayName: "Circle Size",
        displayNameKey: LK.Slice.CircleSize,
        value: 8
    });
    
    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font Family",
        displayNameKey: LK.Slice.FontFamily,
        value: "Segoe UI"
    });
    
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        displayNameKey: LK.Slice.TextSize,
        value: 12
    });
    
    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Text Color",
        displayNameKey: LK.Slice.TextColor,
        value: { value: "#6B7280" }
    });
    
    successThreshold = new formattingSettings.NumUpDown({
        name: "successThreshold",
        displayName: "Success Threshold",
        displayNameKey: LK.Slice.SuccessThreshold,
        value: 1.00
    });
    
    warningThreshold = new formattingSettings.NumUpDown({
        name: "warningThreshold",
        displayName: "Warning Threshold",
        displayNameKey: LK.Slice.WarningThreshold,
        value: 0.90
    });
    
    successText = new formattingSettings.TextInput({
        name: "successText",
        displayName: "Success Text",
        displayNameKey: LK.Slice.SuccessText,
        value: "Cumpliendo",
        placeholder: "Cumpliendo"
    });
    
    warningText = new formattingSettings.TextInput({
        name: "warningText",
        displayName: "Warning Text",
        displayNameKey: LK.Slice.WarningText,
        value: "En camino",
        placeholder: "En camino"
    });
    
    dangerText = new formattingSettings.TextInput({
        name: "dangerText",
        displayName: "Danger Text",
        displayNameKey: LK.Slice.DangerText,
        value: "En riesgo",
        placeholder: "En riesgo"
    });
    
    noDataText = new formattingSettings.TextInput({
        name: "noDataText",
        displayName: "No Data Text",
        displayNameKey: LK.Slice.NoDataText,
        value: "Sin información",
        placeholder: "Sin información"
    });
    
    successColor = new formattingSettings.ColorPicker({
        name: "successColor",
        displayName: "Success Color",
        displayNameKey: LK.Slice.SuccessColor,
        value: { value: "#16A34A" }
    });
    
    warningColor = new formattingSettings.ColorPicker({
        name: "warningColor",
        displayName: "Warning Color",
        displayNameKey: LK.Slice.WarningColor,
        value: { value: "#F59E0B" }
    });
    
    dangerColor = new formattingSettings.ColorPicker({
        name: "dangerColor",
        displayName: "Danger Color",
        displayNameKey: LK.Slice.DangerColor,
        value: { value: "#DC2626" }
    });
    
    neutralColor = new formattingSettings.ColorPicker({
        name: "neutralColor",
        displayName: "Neutral Color",
        displayNameKey: LK.Slice.NeutralColor2,
        value: { value: "#6B7280" }
    });

    name: string = "status";
    displayName: string = "Status";
    displayNameKey: string = LK.Card.Status;
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
    displayName: string = "Responsive Layout";
    displayNameKey: string = LK.Card.Responsive;

    autoScale = new formattingSettings.ToggleSwitch({
        name: "autoScale",
        displayName: "Auto Scale",
        displayNameKey: LK.Slice.AutoScale,
        value: true
    });

    minWidth = new formattingSettings.NumUpDown({
        name: "minWidth",
        displayName: "Min Width",
        displayNameKey: LK.Slice.MinWidth,
        value: 180
    });

    minHeight = new formattingSettings.NumUpDown({
        name: "minHeight",
        displayName: "Min Height",
        displayNameKey: LK.Slice.MinHeight,
        value: 140
    });

    hideSecondary = new formattingSettings.ToggleSwitch({
        name: "hideSecondary",
        displayName: "Hide Secondary",
        displayNameKey: LK.Slice.HideSecondary,
        value: true
    });

    compactMode = new formattingSettings.ToggleSwitch({
        name: "compactMode",
        displayName: "Compact Mode",
        displayNameKey: LK.Slice.CompactMode,
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

class TooltipSettingsCard extends formattingSettings.SimpleCard {
    name = "tooltipSettings";
    displayName = "Tooltips";
    displayNameKey = LK.Card.Tooltips;

    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show tooltips",
        displayNameKey: LK.Slice.ShowTooltips,
        value: true
    });

    slices = [
        this.show
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
    tooltipSettings = new TooltipSettingsCard();

    cards = [
        this.generalCard, 
        this.titleCard, 
        this.actualValueCard,
        this.comparisonCard,
        this.targetCard,
        this.progressCard,
        this.statusCard,
        this.responsiveCard,
        this.tooltipSettings
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
