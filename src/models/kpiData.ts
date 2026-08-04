export interface KpiData {
    title?: string;
    actualValue: number | null;
    previousValue?: number | null;
    variation?: number | null;
    target?: number | null;
    achievement?: number | null;
    status?: string;
    comparisonPeriod?: string;
    statusColor?: string;
    variationColor?: string;
    trendIcon?: string;
    
    actualValueFormat?: string;
    previousValueFormat?: string;
    targetFormat?: string;
}
