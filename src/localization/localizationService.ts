import powerbi from "powerbi-visuals-api";

/**
 * Wraps ILocalizationManager to provide type-safe key resolution with
 * English fallback strings.
 *
 * Rules:
 * - Never returns undefined or null.
 * - Never returns the raw key string as visible text.
 * - Falls back to the provided English string when the key is missing/invalid.
 * - Does not contain business logic, data, or KPI calculations.
 */
export class LocalizationService {
    private readonly manager: powerbi.extensibility.ILocalizationManager;

    constructor(manager: powerbi.extensibility.ILocalizationManager) {
        this.manager = manager;
    }

    /**
     * Resolve a localization key. If the result is falsy, equal to the key
     * itself (key not found), or contains only whitespace, falls back to
     * the provided English default.
     */
    public get(key: string, fallback: string): string {
        if (!key) return fallback;
        try {
            const result = this.manager.getDisplayName(key);
            if (this.isValidResult(result, key)) {
                return result;
            }
        } catch {
            // API failure – use fallback
        }
        return fallback;
    }

    /**
     * A result is valid when:
     * - It is a non-empty string.
     * - It is not identical to the key itself (key-not-found signal).
     * - It is not pure whitespace.
     */
    private isValidResult(result: string | undefined, key: string): result is string {
        if (!result) return false;
        if (result.trim() === "") return false;
        if (result === key) return false;
        return true;
    }
}
