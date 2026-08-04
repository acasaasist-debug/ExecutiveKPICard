import { safeDivide, clamp } from "../utils/mathUtils";
import { normalizeHexColor } from "../utils/validationUtils";
import { StatusType } from "../models/enums";

export class KpiCalculationService {
    public calculateVariation(actual: number | null, previous: number | null, explicitVariation: number | null): number | null {
        if (explicitVariation !== null && explicitVariation !== undefined) {
            return explicitVariation;
        }
        if (actual !== null && previous !== null && previous !== 0) {
            return safeDivide((actual - previous), Math.abs(previous));
        }
        return null;
    }

    public calculateAchievement(actual: number | null, target: number | null, explicitAchievement: number | null): number | null {
        if (explicitAchievement !== null && explicitAchievement !== undefined) {
            return explicitAchievement;
        }
        if (actual !== null && target !== null && target !== 0) {
            return safeDivide(actual, target);
        }
        return null;
    }

    public calculateTrend(variation: number | null): "up" | "down" | "neutral" | "unavailable" {
        if (variation === null || variation === undefined) {
            return "unavailable";
        }
        if (variation > 0) return "up";
        if (variation < 0) return "down";
        return "neutral";
    }

    public getProgressRatio(achievement: number | null): number {
        if (achievement === null || achievement === undefined) return 0;
        return clamp(achievement, 0, 1);
    }

    public calculateStatus(
        achievement: number | null,
        mode: "auto" | "data" | "custom",
        successThreshold: number = 1.00,
        warningThreshold: number = 0.90,
        dataStatus?: string,
        customStatus?: string
    ): { statusType: StatusType; text: string; autoColor: string } {
        
        let validSuccess = successThreshold;
        let validWarning = warningThreshold;

        if (validWarning > validSuccess) {
            validSuccess = 1.00;
            validWarning = 0.90;
        }

        const autoResult = this.getAutoStatus(achievement, validSuccess, validWarning);

        if (mode === "data") {
            if (dataStatus && dataStatus.trim() !== "") {
                return {
                    statusType: autoResult.statusType,
                    text: dataStatus.trim(),
                    autoColor: autoResult.color
                };
            }
            return {
                statusType: autoResult.statusType,
                text: autoResult.text,
                autoColor: autoResult.color
            };
        }

        if (mode === "custom") {
            return {
                statusType: autoResult.statusType,
                text: customStatus || autoResult.text,
                autoColor: autoResult.color
            };
        }

        // Default auto
        return {
            statusType: autoResult.statusType,
            text: autoResult.text,
            autoColor: autoResult.color
        };
    }

    private getAutoStatus(achievement: number | null, successThreshold: number, warningThreshold: number): { statusType: StatusType; text: string; color: string } {
        if (achievement === null || achievement === undefined) {
            return { statusType: StatusType.Neutral, text: "Sin información", color: "#6B7280" };
        }
        if (achievement >= successThreshold) {
            return { statusType: StatusType.Success, text: "Cumpliendo", color: "#16A34A" };
        }
        if (achievement >= warningThreshold) {
            return { statusType: StatusType.Warning, text: "En camino", color: "#F59E0B" };
        }
        return { statusType: StatusType.Danger, text: "En riesgo", color: "#DC2626" };
    }

    public isVariationFavorable(variation: number | null, invertLogic: boolean): boolean {
        if (variation === null || variation === undefined || variation === 0) return false;
        if (variation > 0) {
            return !invertLogic;
        }
        return invertLogic;
    }
}
