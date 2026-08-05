/**
 * test/localizationResources.spec.ts
 *
 * Validates structural integrity of all resources.resjson files:
 * - Valid JSON
 * - All keys in en-US exist in es-ES and vice versa
 * - No empty values
 * - Minimum key count guard
 */

import * as fs from "fs";
import * as path from "path";

const RESOURCES_ROOT = path.resolve(__dirname, "..", "stringResources");
const LOCALES = ["en-US", "es-ES"] as const;
const MIN_KEY_COUNT = 90;

function loadResjson(locale: string): Record<string, string> {
    const filePath = path.join(RESOURCES_ROOT, locale, "resources.resjson");
    // eslint-disable-next-line powerbi-visuals/non-literal-fs-path
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Record<string, string>;
}

describe("resources.resjson — structural integrity", () => {
    let resources: Record<string, Record<string, string>>;

    beforeAll(() => {
        resources = {};
        for (const locale of LOCALES) {
            resources[locale] = loadResjson(locale);
        }
    });

    test.each(LOCALES)("%s/resources.resjson is valid JSON and can be loaded", (locale) => {
        expect(resources[locale]).toBeDefined();
        expect(typeof resources[locale]).toBe("object");
    });

    test.each(LOCALES)("%s/resources.resjson has at least %d keys", (locale) => {
        const count = Object.keys(resources[locale]).length;
        expect(count).toBeGreaterThanOrEqual(MIN_KEY_COUNT);
    });

    test("en-US and es-ES have identical key sets", () => {
        const enKeys = new Set(Object.keys(resources["en-US"]));
        const esKeys = new Set(Object.keys(resources["es-ES"]));

        const missingInEs = [...enKeys].filter(k => !esKeys.has(k));
        const missingInEn = [...esKeys].filter(k => !enKeys.has(k));

        expect(missingInEs).toEqual([]);
        expect(missingInEn).toEqual([]);
    });

    test.each(LOCALES)("%s — no key has an empty or whitespace-only value", (locale) => {
        const empty = Object.entries(resources[locale])
            .filter(([, v]) => !v || v.trim() === "")
            .map(([k]) => k);
        expect(empty).toEqual([]);
    });

    test.each(LOCALES)("%s — no value equals its own key (key-not-found signal)", (locale) => {
        const bad = Object.entries(resources[locale])
            .filter(([k, v]) => v.trim() === k)
            .map(([k]) => k);
        expect(bad).toEqual([]);
    });

    // ── Spot-check critical keys ─────────────────────────────────────────────

    test("en-US: Landing_Title is 'Executive KPI Card'", () => {
        expect(resources["en-US"]["Landing_Title"]).toBe("Executive KPI Card");
    });

    test("es-ES: Landing_Title is 'Executive KPI Card'", () => {
        expect(resources["es-ES"]["Landing_Title"]).toBe("Executive KPI Card");
    });

    test("en-US: Status_AutoSuccess is 'On Track'", () => {
        expect(resources["en-US"]["Status_AutoSuccess"]).toBe("On Track");
    });

    test("es-ES: Status_AutoSuccess is 'Cumpliendo'", () => {
        expect(resources["es-ES"]["Status_AutoSuccess"]).toBe("Cumpliendo");
    });

    test("en-US: Tooltip_ActualValue is 'Actual value'", () => {
        expect(resources["en-US"]["Tooltip_ActualValue"]).toBe("Actual value");
    });

    test("es-ES: Tooltip_ActualValue is 'Valor actual'", () => {
        expect(resources["es-ES"]["Tooltip_ActualValue"]).toBe("Valor actual");
    });

    test("en-US: Card_Tooltips is 'Tooltips'", () => {
        expect(resources["en-US"]["Card_Tooltips"]).toBe("Tooltips");
    });

    test("es-ES: Slice_Show is 'Mostrar'", () => {
        expect(resources["es-ES"]["Slice_Show"]).toBe("Mostrar");
    });

    test("en-US: Role_ActualValue is 'Actual Value'", () => {
        expect(resources["en-US"]["Role_ActualValue"]).toBe("Actual Value");
    });

    test("es-ES: Role_ActualValue is 'Valor actual'", () => {
        expect(resources["es-ES"]["Role_ActualValue"]).toBe("Valor actual");
    });
});
