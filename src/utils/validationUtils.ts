export function isFiniteNumber(value: any): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

export function safeText(value: any): string | undefined {
    if (value === null || value === undefined) {
        return undefined;
    }
    return String(value);
}

export function isValidHexColor(value: any): boolean {
    if (typeof value !== "string") {
        return false;
    }
    const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
    return hexPattern.test(value);
}

export function normalizeHexColor(value: string, fallback: string): string {
    if (isValidHexColor(value)) {
        return value;
    }
    return fallback;
}
