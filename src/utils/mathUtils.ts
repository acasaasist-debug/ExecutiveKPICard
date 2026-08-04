import { isFiniteNumber } from "./validationUtils";

export function clamp(value: number, min: number, max: number): number {
    if (!isFiniteNumber(value)) return min;
    return Math.max(min, Math.min(value, max));
}

export function safeDivide(numerator: number, denominator: number): number | null {
    if (!isFiniteNumber(numerator) || !isFiniteNumber(denominator)) {
        return null;
    }
    if (denominator === 0) {
        return null;
    }
    return numerator / denominator;
}
