import { StatusCategory } from "../models/statusCategory";
import { RenderSettings } from "../models/visualState";
import { normalizeHexColor, safeText } from "../utils/validationUtils";

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
        settings: RenderSettings["status"]
    ): ResolvedStatus {
        const category = this.classify(achievement, settings.effectiveSuccessThreshold, settings.effectiveWarningThreshold);
        
        switch (settings.statusSource) {
            case "data":
                return this.resolveDataMode(category, dataStatus, dataStatusColor);
            case "custom":
                return this.resolveCustomMode(category, settings);
            case "auto":
            default:
                return this.resolveAutoMode(category);
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

    private static resolveAutoMode(category: StatusCategory): ResolvedStatus {
        switch (category) {
            case "success": return { category, text: "Cumpliendo", color: "#16A34A" };
            case "warning": return { category, text: "En camino", color: "#F59E0B" };
            case "danger":  return { category, text: "En riesgo", color: "#DC2626" };
            case "neutral": return { category, text: "Sin información", color: "#6B7280" };
        }
    }

    private static resolveDataMode(
        category: StatusCategory,
        dataStatus: string | null,
        dataStatusColor: string | null
    ): ResolvedStatus {
        const auto = this.resolveAutoMode(category);
        
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
        settings: RenderSettings["status"]
    ): ResolvedStatus {
        const auto = this.resolveAutoMode(category);
        
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
