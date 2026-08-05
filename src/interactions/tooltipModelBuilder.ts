import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;

import { KpiData } from "../models/kpiData";
import { VisualState } from "../models/visualState";
import { KpiLayout } from "../models/layout";
import { InteractionTarget, KpiTooltipModel } from "../models/interactionModel";
import { LocalizationKeys as LK } from "../localization/localizationKeys";

/** Minimal localize function signature. */
export type LocalizeFn = (key: string, fallback: string) => string;

// ── Internal helpers ────────────────────────────────────────────────────────

/** Accept a string value only when it is non-empty and has no sentinel values. */
function validStr(v: string | null | undefined): v is string {
    if (v === null || v === undefined) return false;
    const s = v.trim();
    if (s === "") return false;
    // Discard hex color strings used as data (e.g. "#16A34A")
    if (/^#[0-9A-Fa-f]{3,8}$/.test(s)) return false;
    return true;
}

/** Accept a number only when it is finite (no NaN, no Infinity). */
function validNum(v: number | null | undefined): v is number {
    return typeof v === "number" && isFinite(v);
}

/** Discard a formatted string that contains NaN or Infinity literals. */
function validFormatted(v: string | null | undefined): v is string {
    if (!validStr(v)) return false;
    const upper = v.toUpperCase();
    if (upper.includes("NAN") || upper.includes("INFINITY") || upper.includes("INFINITE")) {
        return false;
    }
    return true;
}

/** Push a tooltip item only when both displayName and value are valid. */
function push(
    items: VisualTooltipDataItem[],
    displayName: string,
    value: string | null | undefined
): void {
    if (!validStr(displayName) || !validFormatted(value)) return;
    items.push({ displayName: displayName.trim(), value: (value as string).trim() });
}

/** Map StatusCategory to a localized label. */
function semanticCategoryLabel(
    category: string | undefined,
    L: LocalizeFn
): string {
    switch (category) {
        case "success": return L(LK.Status.Success, "Success");
        case "warning": return L(LK.Status.Warning, "Caution");
        case "danger":  return L(LK.Status.Danger,  "Danger");
        case "neutral": return L(LK.Status.Neutral, "Neutral");
        default:        return "";
    }
}

/** Map trend to a localized label. */
function trendLabel(
    trend: "up" | "down" | "neutral" | "unavailable" | undefined,
    isFavorable: boolean | undefined,
    L: LocalizeFn
): string {
    if (!trend || trend === "unavailable") return "";
    if (isFavorable === true)  return L(LK.Trend.Favorable,   "Favorable");
    if (isFavorable === false) return L(LK.Trend.Unfavorable, "Unfavorable");
    return L(LK.Status.Neutral, "Neutral");
}

// ── Main builder ─────────────────────────────────────────────────────────────

export interface TooltipModelBuilderInput {
    kpiData: KpiData;
    state: VisualState;
    layout: KpiLayout;
    /** dataView.metadata.columns – may be undefined during tests */
    metadataColumns?: DataViewMetadataColumn[];
    /** Localization function — optional, falls back to English */
    localize?: LocalizeFn;
}

/**
 * Pure builder — builds tooltip models from already-resolved, formatted data.
 *
 * Rules:
 * - Uses only values already present in state / layout (no recalculation).
 * - Discards undefined, null, NaN, Infinity, empty strings, hex colors.
 * - Respects configuredVisible (settings.*.show) and hiddenByResponsive.
 * - Returns ReadonlyMap<InteractionTarget, KpiTooltipModel>.
 */
export function buildTooltipModels(
    input: TooltipModelBuilderInput
): ReadonlyMap<InteractionTarget, KpiTooltipModel> {
    const { kpiData, state, layout, localize } = input;
    const L: LocalizeFn = localize ?? ((_key, fallback) => fallback);
    const result = new Map<InteractionTarget, KpiTooltipModel>();
    const hidden = new Set(layout.hiddenByResponsive);

    // ── card ──────────────────────────────────────────────────────────────────
    {
        const items: VisualTooltipDataItem[] = [];

        if (layout.showTitle && state.title && !hidden.has("title")) {
            push(items, L(LK.Tooltip.Title, "Title"), state.title.text);
        }
        push(items, L(LK.Tooltip.ActualValue, "Actual value"), state.actual.formattedValue);
        
        if (layout.showComparison && state.comparison && !hidden.has("comparison")) {
            push(items, L(LK.Tooltip.Variation, "Variation"), state.comparison.formattedVariation);
        }
        if (layout.showTarget && state.target && !hidden.has("target")) {
            push(items, L(LK.Tooltip.Target, "Target"), state.target.formattedValue);
        }
        if (layout.showProgress && state.achievement && !hidden.has("progress")) {
            push(items, L(LK.Tooltip.Achievement, "Achievement"), state.achievement.formattedValue);
        }
        if (layout.showStatus && validStr(state.calculatedStatusText) && !hidden.has("statusCircle")) {
            push(items, L(LK.Tooltip.Status, "Status"), state.calculatedStatusText);
        }

        const visible = layout.showTitle || layout.showComparison || layout.showTarget
            || layout.showProgress || layout.showStatus || !!state.actual.formattedValue;

        result.set("card", { target: "card", items, selectionId: null, visible: visible && items.length > 0 });
    }

    // ── actualValue ───────────────────────────────────────────────────────────
    {
        const items: VisualTooltipDataItem[] = [];
        push(items, L(LK.Tooltip.ActualValue, "Actual value"), state.actual.formattedValue);

        result.set("actualValue", {
            target: "actualValue",
            items,
            selectionId: null,
            visible: !!layout.value && items.length > 0
        });
    }

    // ── comparison ────────────────────────────────────────────────────────────
    {
        const items: VisualTooltipDataItem[] = [];
        const visible = layout.showComparison && !!state.comparison && !hidden.has("comparison");

        if (visible && state.comparison) {
            const comp = state.comparison;
            const compSettings = state.settings.comparison;

            // Period
            const period = comp.period || (validStr(compSettings.defaultPeriodText) ? compSettings.defaultPeriodText : null);
            push(items, L(LK.Tooltip.Period, "Period"), period);

            // Previous value (raw number from kpiData — already validated, format it simply)
            if (validNum(kpiData.previousValue)) {
                push(items, L(LK.Tooltip.PreviousValue, "Previous value"), String(kpiData.previousValue));
            }

            // Variation
            push(items, L(LK.Tooltip.Variation, "Variation"), comp.formattedVariation);

            // Trend
            const tl = trendLabel(comp.trend, comp.isFavorable, L);
            push(items, L(LK.Tooltip.Trend, "Trend"), tl);
        }

        result.set("comparison", {
            target: "comparison",
            items,
            selectionId: null,
            visible: visible && items.length > 0
        });
    }

    // ── target ────────────────────────────────────────────────────────────────
    {
        const items: VisualTooltipDataItem[] = [];
        const visible = layout.showTarget && !!state.target && !hidden.has("target");

        if (visible && state.target) {
            let label = L(LK.Tooltip.Target, "Target");
            if (validStr(state.settings.target.label)) {
                label = state.settings.target.label.trim();
            }
            push(items, label, state.target.formattedValue);
        }

        result.set("target", {
            target: "target",
            items,
            selectionId: null,
            visible: visible && items.length > 0
        });
    }

    // ── progress ──────────────────────────────────────────────────────────────
    {
        const items: VisualTooltipDataItem[] = [];
        const visible = layout.showProgress && !!state.achievement && !hidden.has("progress");

        if (visible && state.achievement) {
            // Real cumplimiento — may exceed 100%
            push(items, L(LK.Tooltip.Achievement, "Achievement"), state.achievement.formattedValue);
            // Target, when present
            if (state.target && layout.showTarget) {
                push(items, L(LK.Tooltip.Target, "Target"), state.target.formattedValue);
            }
        }

        result.set("progress", {
            target: "progress",
            items,
            selectionId: null,
            visible: visible && items.length > 0
        });
    }

    // ── status ────────────────────────────────────────────────────────────────
    {
        const items: VisualTooltipDataItem[] = [];
        const visible = layout.showStatus && validStr(state.calculatedStatusText) && !hidden.has("statusCircle");

        if (visible) {
            push(items, L(LK.Tooltip.Status,   "Status"),   state.calculatedStatusText);
            const catLabel = semanticCategoryLabel(state.statusCategory, L);
            push(items, L(LK.Tooltip.Category, "Category"), catLabel);
        }

        result.set("status", {
            target: "status",
            items,
            selectionId: null,
            visible: visible && items.length > 0
        });
    }

    return result as ReadonlyMap<InteractionTarget, KpiTooltipModel>;
}
