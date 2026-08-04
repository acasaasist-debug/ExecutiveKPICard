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



    public isVariationFavorable(variation: number | null, invertLogic: boolean): boolean {
        if (variation === null || variation === undefined || variation === 0) return false;
        if (variation > 0) {
            return !invertLogic;
        }
        return invertLogic;
    }
}
