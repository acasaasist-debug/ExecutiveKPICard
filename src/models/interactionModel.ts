import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import ISelectionId = powerbi.visuals.ISelectionId;

/**
 * Canonical union of SVG regions that can receive pointer interactions.
 * Each value maps to a data-interaction-target attribute on an SVG group.
 */
export type InteractionTarget =
    | "card"
    | "actualValue"
    | "comparison"
    | "target"
    | "progress"
    | "status";

/**
 * Tooltip model for a single interactive region.
 *
 * Built once per stable update cycle from already-resolved, formatted data.
 * Never stores DOM nodes, PointerEvents, or raw numeric values.
 *
 * visible=false → TooltipController must not show the tooltip and must hide
 * any active tooltip for this target immediately.
 */
export interface KpiTooltipModel {
    target: InteractionTarget;
    items: VisualTooltipDataItem[];
    selectionId: ISelectionId | null;
    visible: boolean;
}
