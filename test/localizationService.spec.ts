/**
 * test/localizationService.spec.ts
 *
 * Unit tests for LocalizationService wrapper.
 */

import { LocalizationService } from "../src/localization/localizationService";

function makeManager(map: Record<string, string>) {
    return {
        getDisplayName: (key: string): string => map[key] ?? key
    } as any;
}

describe("LocalizationService", () => {
    test("returns the resolved string when key is present", () => {
        const svc = new LocalizationService(makeManager({ "Foo_Bar": "Translated" }));
        expect(svc.get("Foo_Bar", "Fallback")).toBe("Translated");
    });

    test("falls back when manager returns the key itself (key-not-found signal)", () => {
        const svc = new LocalizationService(makeManager({}));
        // manager returns the key unchanged → triggers fallback
        expect(svc.get("Missing_Key", "English fallback")).toBe("English fallback");
    });

    test("falls back when manager returns empty string", () => {
        const svc = new LocalizationService(makeManager({ "Empty": "" }));
        expect(svc.get("Empty", "Default")).toBe("Default");
    });

    test("falls back when manager returns whitespace-only string", () => {
        const svc = new LocalizationService(makeManager({ "Whitespace": "   " }));
        expect(svc.get("Whitespace", "Default")).toBe("Default");
    });

    test("falls back when key is an empty string", () => {
        const svc = new LocalizationService(makeManager({}));
        expect(svc.get("", "Default")).toBe("Default");
    });

    test("falls back when manager throws", () => {
        const badManager = {
            getDisplayName: (_key: string): string => { throw new Error("API failure"); }
        } as any;
        const svc = new LocalizationService(badManager);
        expect(svc.get("Any_Key", "Safe default")).toBe("Safe default");
    });

    test("returns translated string trimmed (no surrounding whitespace)", () => {
        const svc = new LocalizationService(makeManager({ "My_Key": "  value  " }));
        // the manager result is not whitespace-only so it should be returned as-is
        expect(svc.get("My_Key", "Fallback")).toBe("  value  ");
    });

    test("handles multiple calls with different keys correctly", () => {
        const svc = new LocalizationService(makeManager({
            "A": "Alpha",
            "B": "Beta"
        }));
        expect(svc.get("A", "a")).toBe("Alpha");
        expect(svc.get("B", "b")).toBe("Beta");
        expect(svc.get("C", "c")).toBe("c");
    });
});
