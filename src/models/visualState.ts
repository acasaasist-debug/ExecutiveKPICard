import { KpiData } from "./kpiData";
import { LayoutMode, StatusType } from "./enums";

export interface VisualState {
    data: KpiData | null;
    layoutMode: LayoutMode;
    viewport: { width: number; height: number };
    calculatedStatus: StatusType;
    calculatedStatusText: string;
    calculatedStatusColor: string;
    calculatedVariation: number | null;
    calculatedAchievement: number | null;
}
