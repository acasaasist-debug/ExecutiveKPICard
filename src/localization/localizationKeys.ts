/**
 * Typed localization key constants.
 * All keys must exist in both stringResources/en-US/resources.resjson
 * and stringResources/es-ES/resources.resjson.
 */
export const LocalizationKeys = {
    // ── Data roles ────────────────────────────────────────────────────────────
    Role: {
        Title:                 "Role_Title",
        ActualValue:           "Role_ActualValue",
        PreviousValue:         "Role_PreviousValue",
        Variation:             "Role_Variation",
        Target:                "Role_Target",
        Achievement:           "Role_Achievement",
        Status:                "Role_Status",
        ComparisonPeriod:      "Role_ComparisonPeriod",
        StatusColor:           "Role_StatusColor",
        VariationColor:        "Role_VariationColor",
        TrendIcon:             "Role_TrendIcon",
        // descriptions
        TitleDesc:             "Role_Title_Desc",
        ActualValueDesc:       "Role_ActualValue_Desc",
        PreviousValueDesc:     "Role_PreviousValue_Desc",
        VariationDesc:         "Role_Variation_Desc",
        TargetDesc:            "Role_Target_Desc",
        AchievementDesc:       "Role_Achievement_Desc",
        StatusDesc:            "Role_Status_Desc",
        ComparisonPeriodDesc:  "Role_ComparisonPeriod_Desc",
        StatusColorDesc:       "Role_StatusColor_Desc",
        VariationColorDesc:    "Role_VariationColor_Desc",
        TrendIconDesc:         "Role_TrendIcon_Desc",
    },

    // ── Formatting cards ──────────────────────────────────────────────────────
    Card: {
        General:       "Card_General",
        Title:         "Card_Title",
        ActualValue:   "Card_ActualValue",
        Comparison:    "Card_Comparison",
        Target:        "Card_Target",
        Progress:      "Card_Progress",
        Status:        "Card_Status",
        Responsive:    "Card_Responsive",
        Accessibility: "Card_Accessibility",
        Tooltips:      "Card_Tooltips",
    },

    // ── Dropdown options ──────────────────────────────────────────────────────
    Option: {
        Auto:     "Option_Auto",
        FromData: "Option_FromData",
        Custom:   "Option_Custom",
    },

    // ── Formatting slices ─────────────────────────────────────────────────────
    Slice: {
        BackgroundColor:          "Slice_BackgroundColor",
        Transparency:             "Slice_Transparency",
        Border:                   "Slice_Border",
        BorderColor:              "Slice_BorderColor",
        BorderThickness:          "Slice_BorderThickness",
        CornerRadius:             "Slice_CornerRadius",
        Padding:                  "Slice_Padding",
        TopLine:                  "Slice_TopLine",
        UseStatusColor:           "Slice_UseStatusColor",
        TopLineThickness:         "Slice_TopLineThickness",
        TopLineColor:             "Slice_TopLineColor",
        Show:                     "Slice_Show",
        FontFamily:               "Slice_FontFamily",
        TextSize:                 "Slice_TextSize",
        Bold:                     "Slice_Bold",
        FontColor:                "Slice_FontColor",
        Alignment:                "Slice_Alignment",
        BottomMargin:             "Slice_BottomMargin",
        UseModelFormat:           "Slice_UseModelFormat",
        DisplayUnits:             "Slice_DisplayUnits",
        DecimalPlaces:            "Slice_DecimalPlaces",
        Prefix:                   "Slice_Prefix",
        Suffix:                   "Slice_Suffix",
        ThousandsSeparator:       "Slice_ThousandsSeparator",
        ShowDashIfNull:           "Slice_ShowDashIfNull",
        ShowPeriod:               "Slice_ShowPeriod",
        DefaultPeriodText:        "Slice_DefaultPeriodText",
        ShowVariation:            "Slice_ShowVariation",
        ShowArrow:                "Slice_ShowArrow",
        PositiveColor:            "Slice_PositiveColor",
        NegativeColor:            "Slice_NegativeColor",
        NeutralColor:             "Slice_NeutralColor",
        InvertLogic:              "Slice_InvertLogic",
        PercentageDecimals:       "Slice_PercentageDecimals",
        NoComparisonText:         "Slice_NoComparisonText",
        InheritValueFormat:       "Slice_InheritValueFormat",
        Label:                    "Slice_Label",
        LabelFontFamily:          "Slice_LabelFontFamily",
        LabelTextSize:            "Slice_LabelTextSize",
        Color:                    "Slice_Color",
        Height:                   "Slice_Height",
        BarLength:                "Slice_BarLength",
        Radius:                   "Slice_Radius",
        CustomColor:              "Slice_CustomColor",
        ShowPercentage:           "Slice_ShowPercentage",
        PercentageSize:           "Slice_PercentageSize",
        PercentageColor:          "Slice_PercentageColor",
        ShowOverachievementMark:  "Slice_ShowOverachievementMark",
        MarkColor:                "Slice_MarkColor",
        MarkThickness:            "Slice_MarkThickness",
        StatusSource:             "Slice_StatusSource",
        ShowCircle:               "Slice_ShowCircle",
        CircleSize:               "Slice_CircleSize",
        TextColor:                "Slice_TextColor",
        SuccessThreshold:         "Slice_SuccessThreshold",
        WarningThreshold:         "Slice_WarningThreshold",
        SuccessText:              "Slice_SuccessText",
        WarningText:              "Slice_WarningText",
        DangerText:               "Slice_DangerText",
        NoDataText:               "Slice_NoDataText",
        SuccessColor:             "Slice_SuccessColor",
        WarningColor:             "Slice_WarningColor",
        DangerColor:              "Slice_DangerColor",
        NeutralColor2:            "Slice_NeutralColor2",
        AutoScale:                "Slice_AutoScale",
        MinWidth:                 "Slice_MinWidth",
        MinHeight:                "Slice_MinHeight",
        HideSecondary:            "Slice_HideSecondary",
        CompactMode:              "Slice_CompactMode",
        ShowTooltips:             "Slice_ShowTooltips",
    },

    // ── Tooltip labels ────────────────────────────────────────────────────────
    Tooltip: {
        Title:         "Tooltip_Title",
        ActualValue:   "Tooltip_ActualValue",
        Variation:     "Tooltip_Variation",
        Target:        "Tooltip_Target",
        Achievement:   "Tooltip_Achievement",
        Status:        "Tooltip_Status",
        Period:        "Tooltip_Period",
        PreviousValue: "Tooltip_PreviousValue",
        Trend:         "Tooltip_Trend",
        Category:      "Tooltip_Category",
    },

    // ── Status labels ─────────────────────────────────────────────────────────
    Status: {
        AutoSuccess: "Status_AutoSuccess",
        AutoWarning: "Status_AutoWarning",
        AutoDanger:  "Status_AutoDanger",
        AutoNeutral: "Status_AutoNeutral",
        Success:     "Status_Success",
        Warning:     "Status_Warning",
        Danger:      "Status_Danger",
        Neutral:     "Status_Neutral",
    },

    // ── Trend labels ──────────────────────────────────────────────────────────
    Trend: {
        Favorable:   "Trend_Favorable",
        Unfavorable: "Trend_Unfavorable",
    },

    // ── Landing page ──────────────────────────────────────────────────────────
    Landing: {
        Title:    "Landing_Title",
        Subtitle: "Landing_Subtitle",
        Hint:     "Landing_Hint",
    },
} as const;

/** Union type of all localization key string values */
export type LocalizationKey = typeof LocalizationKeys[keyof typeof LocalizationKeys] extends infer Group
    ? Group extends Record<string, string>
        ? Group[keyof Group]
        : never
    : never;
