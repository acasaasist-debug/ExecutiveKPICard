export enum LayoutMode {
    NORMAL = "normal",
    COMPACT = "compact",
    MINIMUM = "minimum"
}

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
    mode: LayoutMode;
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
    
    statusIndicator?: RectLayout & { radius: number };
    statusText?: TextLayout;
}
