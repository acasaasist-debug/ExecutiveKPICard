import { StatusCategory } from "../models/statusCategory";
import { RenderSettings } from "../models/visualState";
import { normalizeHexColor, safeText } from "../utils/validationUtils";
import { LocalizationKeys as LK } from "../localization/localizationKeys";

/** Minimal localize function signature — accepts a key + English fallback. */
export type LocalizeFn = (key: string, fallback: string) => string;

export interface ResolvedStatus {
    category: StatusCategory;
    text: string;
    color: string;
}

export class StatusService {
    public static resolve(
        achievement: number | null,
        dataStatus: string | null,
        dataStatusColor: string | null,
        settings: RenderSettings["status"],
        localize?: LocalizeFn
    ): ResolvedStatus {
        const category = this.classify(achievement, settings.effectiveSuccessThreshold, settings.effectiveWarningThreshold);
        
        switch (settings.statusSource) {
            case "data":
                return this.resolveDataMode(category, dataStatus, dataStatusColor, localize);
            case "custom":
                return this.resolveCustomMode(category, settings, localize);
            case "auto":
            default:
                return this.resolveAutoMode(category, localize);
        }
    }

    private static classify(
        achievement: number | null,
        effectiveSuccessThreshold: number,
        effectiveWarningThreshold: number
    ): StatusCategory {
        if (achievement === null || !isFinite(achievement)) {
            return "neutral";
        }
        if (achievement >= effectiveSuccessThreshold) {
            return "success";
        }
        if (achievement >= effectiveWarningThreshold) {
            return "warning";
        }
        return "danger";
    }

    private static resolveAutoMode(category: StatusCategory, localize?: LocalizeFn): ResolvedStatus {
        const L = localize ?? ((_key: string, fallback: string) => fallback);
        switch (category) {
            case "success": return { category, text: L(LK.Status.AutoSuccess, "On Track"),  color: "#16A34A" };
            case "warning": return { category, text: L(LK.Status.AutoWarning, "At Risk"),    color: "#F59E0B" };
            case "danger":  return { category, text: L(LK.Status.AutoDanger,  "Off Track"),  color: "#DC2626" };
            case "neutral": return { category, text: L(LK.Status.AutoNeutral, "No Data"),    color: "#6B7280" };
        }
    }

    private static resolveDataMode(
        category: StatusCategory,
        dataStatus: string | null,
        dataStatusColor: string | null,
        localize?: LocalizeFn
    ): ResolvedStatus {
        const auto = this.resolveAutoMode(category, localize);
        
        const cleanText = safeText(dataStatus)?.trim();
        const text = cleanText ? cleanText : auto.text;

        const cleanColor = normalizeHexColor(dataStatusColor || "", auto.color);
        
        return {
            category,
            text,
            color: cleanColor
        };
    }

    private static resolveCustomMode(
        category: StatusCategory,
        settings: RenderSettings["status"],
        localize?: LocalizeFn
    ): ResolvedStatus {
        const auto = this.resolveAutoMode(category, localize);
        
        switch (category) {
            case "success":
                return {
                    category,
                    text: safeText(settings.successText)?.trim() || auto.text,
                    color: normalizeHexColor(settings.successColor, auto.color)
                };
            case "warning":
                return {
                    category,
                    text: safeText(settings.warningText)?.trim() || auto.text,
                    color: normalizeHexColor(settings.warningColor, auto.color)
                };
            case "danger":
                return {
                    category,
                    text: safeText(settings.dangerText)?.trim() || auto.text,
                    color: normalizeHexColor(settings.dangerColor, auto.color)
                };
            case "neutral":
                return {
                    category,
                    text: safeText(settings.noDataText)?.trim() || auto.text,
                    color: normalizeHexColor(settings.neutralColor, auto.color)
                };
        }
    }
}
