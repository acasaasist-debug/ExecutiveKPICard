export interface VisualState {
    hasData: boolean;
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
