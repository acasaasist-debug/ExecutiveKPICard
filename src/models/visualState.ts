import { VisualFormattingSettingsModel } from "../settings/formattingSettings";
import { StatusCategory } from "./statusCategory";

export type ResponsiveMode = "normal" | "compact" | "minimum";

export type ResponsiveElementKey =
    | "comparisonPeriod"
    | "trendIcon"
    | "comparison"
    | "target"
    | "progressPercentage"
    | "progress"
    | "statusCircle"
    | "title";

export interface ResponsiveRenderSettings {
    autoScale: boolean;
    minWidth: number;
    minHeight: number;
    hideSecondary: boolean;
    compactMode: boolean;
}

export interface GeneralRenderSettings {
    backgroundColor: string;
    transparency: number;
    borderOn: boolean;
    borderColor: string;
    borderThickness: number;
    cornerRadius: number;
    padding: number;
    topLineOn: boolean;
    topLineUseStatusColor: boolean;
    topLineThickness: number;
    topLineColor: string;
}

export interface TitleRenderSettings {
    show: boolean;
    fontFamily: string;
    fontSize: number;
    bold: boolean;
    color: string;
    alignment: string;
    bottomMargin: number;
}

export interface ActualValueRenderSettings {
    show: boolean;
    useModelFormat: boolean;
    fontFamily: string;
    fontSize: number;
    bold: boolean;
    color: string;
    alignment: string;
    displayUnits: number;
    decimalPlaces: number;
    prefix: string;
    suffix: string;
    thousandsSeparator: boolean;
    showDashIfNull: boolean;
}

export interface ComparisonRenderSettings {
    show: boolean;
    showPeriod: boolean;
    defaultPeriodText: string;
    showVariation: boolean;
    showArrow: boolean;
    fontFamily: string;
    fontSize: number;
    positiveColor: string;
    negativeColor: string;
    neutralColor: string;
    invertLogic: boolean;
    percentageDecimals: number;
    noComparisonText: string;
}

export interface TargetRenderSettings {
    show: boolean;
    inheritValueFormat: boolean;
    label: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    displayUnits: number;
    decimalPlaces: number;
    prefix: string;
    suffix: string;
}

export interface ProgressRenderSettings {
    show: boolean;
    height: number;
    effectiveRadius: number;
    backgroundColor: string;
    useStatusColor: boolean;
    customColor: string;
    showPercentage: boolean;
    percentageSize: number;
    percentageColor: string;
    decimalPlaces: number;
    showOverachievementMark: boolean;
    markColor: string;
    markThickness: number;
}

export interface StatusRenderSettings {
    show: boolean;
    statusSource: "auto" | "data" | "custom";
    showCircle: boolean;
    circleSize: number;
    fontFamily: string;
    fontSize: number;
    textColor: string;
    effectiveSuccessThreshold: number;
    effectiveWarningThreshold: number;
    successText: string;
    warningText: string;
    dangerText: string;
    noDataText: string;
    successColor: string;
    warningColor: string;
    dangerColor: string;
    neutralColor: string;
}

export interface RenderSettings {
    general: GeneralRenderSettings;
    title: TitleRenderSettings;
    actualValue: ActualValueRenderSettings;
    comparison: ComparisonRenderSettings;
    target: TargetRenderSettings;
    progress: ProgressRenderSettings;
    status: StatusRenderSettings;
    responsive: ResponsiveRenderSettings;
}

export type Phase5ARenderSettings = RenderSettings;


export interface VisualState {
    hasData: boolean;
    hasActualValueRole: boolean;
    settings: RenderSettings;
    calculatedVariationColor: string | null;
    calculatedStatusColor: string;
    title?: {
        text: string;
    };
    actual: {
        formattedValue: string;
    };
    comparison?: {
        period: string | null;
        formattedVariation: string;
        trend: "up" | "down" | "neutral" | "unavailable";
        trendIcon: string | null;
        isFavorable: boolean;
    };
    target?: {
        formattedValue: string;
    };
    achievement?: {
        formattedValue: string;
        progressRatio: number;
    };
    statusCategory: StatusCategory;
    calculatedStatusText: string;
}
