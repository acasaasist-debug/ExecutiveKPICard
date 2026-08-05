import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;

import { KpiData } from "../models/kpiData";
import { VisualState } from "../models/visualState";
import { KpiLayout } from "../models/layout";
import { InteractionTarget, KpiTooltipModel } from "../models/interactionModel";

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

// We no longer use displayNameFor, but keep metadataColumns in interface in case needed later.

/** Map StatusCategory to a human-readable label (Spanish). */
function semanticCategoryLabel(category: string | undefined): string {
    switch (category) {
        case "success": return "Éxito";
        case "warning": return "Precaución";
        case "danger":  return "Peligro";
        case "neutral": return "Neutral";
        default:        return "";
    }
}

/** Map trend to a human-readable label (Spanish). */
function trendLabel(
    trend: "up" | "down" | "neutral" | "unavailable" | undefined,
    isFavorable: boolean | undefined
): string {
    if (!trend || trend === "unavailable") return "";
    if (isFavorable === true)  return "Favorable";
    if (isFavorable === false) return "Desfavorable";
    return "Neutral";
}

// ── Main builder ─────────────────────────────────────────────────────────────

export interface TooltipModelBuilderInput {
    kpiData: KpiData;
    state: VisualState;
    layout: KpiLayout;
    /** dataView.metadata.columns – may be undefined during tests */
    metadataColumns?: DataViewMetadataColumn[];
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
    const { kpiData, state, layout, metadataColumns } = input;
    const result = new Map<InteractionTarget, KpiTooltipModel>();
    const hidden = new Set(layout.hiddenByResponsive);

    // ── card ──────────────────────────────────────────────────────────────────
    {
        const items: VisualTooltipDataItem[] = [];

        if (layout.showTitle && state.title && !hidden.has("title")) {
            push(items, "Título", state.title.text);
        }
        push(items, "Valor actual", state.actual.formattedValue);
        
        if (layout.showComparison && state.comparison && !hidden.has("comparison")) {
            push(items, "Variación", state.comparison.formattedVariation);
        }
        if (layout.showTarget && state.target && !hidden.has("target")) {
            push(items, "Meta", state.target.formattedValue);
        }
        if (layout.showProgress && state.achievement && !hidden.has("progress")) {
            push(items, "Cumplimiento", state.achievement.formattedValue);
        }
        if (layout.showStatus && validStr(state.calculatedStatusText) && !hidden.has("statusCircle")) {
            push(items, "Estado", state.calculatedStatusText);
        }

        const visible = layout.showTitle || layout.showComparison || layout.showTarget
            || layout.showProgress || layout.showStatus || !!state.actual.formattedValue;

        result.set("card", { target: "card", items, selectionId: null, visible: visible && items.length > 0 });
    }

    // ── actualValue ───────────────────────────────────────────────────────────
    {
        const items: VisualTooltipDataItem[] = [];
        push(items, "Valor actual", state.actual.formattedValue);

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
            push(items, "Período", period);

            // Previous value (raw number from kpiData — already validated, format it simply)
            if (validNum(kpiData.previousValue)) {
                push(items, "Valor anterior", String(kpiData.previousValue));
            }

            // Variation
            push(items, "Variación", comp.formattedVariation);

            // Trend
            const tl = trendLabel(comp.trend, comp.isFavorable);
            push(items, "Tendencia", tl);
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
            let label = "Meta";
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
            push(items, "Cumplimiento", state.achievement.formattedValue);
            // Target, when present
            if (state.target && layout.showTarget) {
                push(items, "Meta", state.target.formattedValue);
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
            push(items, "Estado", state.calculatedStatusText);
            const catLabel = semanticCategoryLabel(state.statusCategory);
            push(items, "Categoría", catLabel);
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
