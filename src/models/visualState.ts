import { VisualFormattingSettingsModel } from "../settings/formattingSettings";
import { StatusCategory } from "./statusCategory";

export interface RenderSettings {
    general: {
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
    };
    title: {
        show: boolean;
        fontFamily: string;
        fontSize: number;
        bold: boolean;
        color: string;
        alignment: string;
        bottomMargin: number;
    };
    actualValue: {
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
    };
    comparison: {
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
    };
    target: {
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
    };
    progress: {
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
    };
    status: {
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
    };
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
