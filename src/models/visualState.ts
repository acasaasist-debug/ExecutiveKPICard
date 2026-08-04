import { VisualFormattingSettingsModel } from "../settings/formattingSettings";

export interface Phase5ARenderSettings {
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
}

export interface VisualState {
    hasData: boolean;
    hasActualValueRole: boolean;
    settings: Phase5ARenderSettings;
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
        color: string | null;
    };
    target?: {
        formattedValue: string;
    };
    achievement?: {
        formattedValue: string;
        progressRatio: number;
    };
    status?: {
        text: string;
        color: string;
    };
}
