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
export interface Point {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface RectLayout extends Point, Size {}

export interface TextLayout extends Point {
    width?: number; // Maximum width available for the text
    fontSize?: number;
    textAnchor?: "start" | "middle" | "end";
}

export interface ProgressLayout {
    track: RectLayout;
    fill: RectLayout;
    achievementText?: TextLayout;
    isOverperforming: boolean;
    overperformanceMarker?: RectLayout;
}

export interface KpiLayout {
    responsiveMode: ResponsiveMode;
    hiddenByResponsive: ResponsiveElementKey[];
    effectiveFontSizes: {
        title: number;
        actualValue: number;
        comparison: number;
        target: number;
        progressPercentage: number;
        status: number;
    };
    fits: boolean;
    contentTop: number;
    contentBottom: number;
    
    viewport: Size;
    padding: number;
    
    // Elements visibility flags
    showTitle: boolean;
    showComparison: boolean;
    showTarget: boolean;
    showProgress: boolean;
    showStatus: boolean;

    // Layout elements
    accent: RectLayout;
    title?: TextLayout;
    value?: TextLayout;
    
    comparisonPeriod?: TextLayout;
    variation?: TextLayout;
    target?: TextLayout;
    
    progress?: ProgressLayout;
    
    statusCircle?: RectLayout & { radius: number };
    statusText?: TextLayout;
}
