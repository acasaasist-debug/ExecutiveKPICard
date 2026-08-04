import { normalizeHexColor } from "../utils/validationUtils";

export class ColorService {
    public getVariationColor(
        dataVariationColor: string | undefined | null,
        variation: number | null,
        invertLogic: boolean,
        positiveColor: string,
        negativeColor: string,
        neutralColor: string
    ): string {
        // 1. Data-driven color has priority
        if (dataVariationColor) {
            const normalized = normalizeHexColor(dataVariationColor, "");
            if (normalized) {
                return normalized;
            }
        }

        // 2. Automatic color logic
        if (variation === null || variation === undefined) {
            return normalizeHexColor(neutralColor, "#6B7280");
        }
        
        const posColor = normalizeHexColor(positiveColor, "#16A34A");
        const negColor = normalizeHexColor(negativeColor, "#DC2626");
        const neuColor = normalizeHexColor(neutralColor, "#6B7280");

        if (variation > 0) {
            return invertLogic ? negColor : posColor;
        } else if (variation < 0) {
            return invertLogic ? posColor : negColor;
        }
        return neuColor;
    }

    public getStatusColor(dataColor: string | undefined | null, fallbackColor: string): string {
        if (!dataColor) {
            return normalizeHexColor(fallbackColor, "#6B7280");
        }
        return normalizeHexColor(dataColor, fallbackColor);
    }
}
