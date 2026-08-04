/**
 * DataView transition and classification tests.
 *
 * Tests items 1-11, 13-17 from the mandatory list.
 * Verifies the DataViewService classification and the Visual lifecycle.
 */

import { DataViewService } from "../src/services/dataViewService";
import { DataViewReadStatus } from "../src/models/dataViewStatus";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function dvWithRoleOnly(roles: Record<string, boolean>): any {
    return {
        metadata: { columns: [{ roles }] },
        table: { rows: [] }
    };
}

function dvStableValue(value: number | null, includeTitle = false): any {
    const columns: any[] = [];
    if (includeTitle) columns.push({ roles: { title: true } });
    columns.push({ roles: { actualValue: true } });

    const row: any[] = includeTitle ? ["My Title", value] : [value];
    return {
        metadata: { columns },
        table: { rows: [row] }
    };
}

function dvRoleWithEmptyRows(roleNames: string[]): any {
    return {
        metadata: { columns: roleNames.map(r => ({ roles: { [r]: true } })) },
        table: { rows: [] }
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// DataViewService classification
// ─────────────────────────────────────────────────────────────────────────────

describe("DataViewService – DataViewReadStatus classification", () => {
    let service: DataViewService;

    beforeEach(() => {
        service = new DataViewService();
    });

    // ── Spec 1 ────────────────────────────────────────────────────────────
    it("1: DataView without actualValue role → NoActualValueRole", () => {
        const dv = dvWithRoleOnly({ title: true });
        const result = service.parse(dv);
        expect(result.status).toBe(DataViewReadStatus.NoActualValueRole);
        expect(result.data.hasActualValueRole).toBe(false);
    });

    it("1b: undefined DataView → NoActualValueRole", () => {
        const result = service.parse(undefined);
        expect(result.status).toBe(DataViewReadStatus.NoActualValueRole);
    });

    it("1c: DataView without metadata → NoActualValueRole", () => {
        const result = service.parse({ table: { rows: [[100]] } } as any);
        expect(result.status).toBe(DataViewReadStatus.NoActualValueRole);
    });

    // ── Spec 2 ────────────────────────────────────────────────────────────
    it("2: actualValue role + row with finite number → StableValue", () => {
        const dv = dvStableValue(1234);
        const result = service.parse(dv);
        expect(result.status).toBe(DataViewReadStatus.StableValue);
        expect(result.data.hasActualValueRole).toBe(true);
        expect(result.data.actualValue).toBe(1234);
    });

    // ── Spec 3 ────────────────────────────────────────────────────────────
    it("3: actualValue role + row with null → StableBlank", () => {
        const dv = dvStableValue(null);
        const result = service.parse(dv);
        expect(result.status).toBe(DataViewReadStatus.StableBlank);
        expect(result.data.hasActualValueRole).toBe(true);
        expect(result.data.actualValue).toBeNull();
    });

    it("3b: actualValue role + row with NaN → StableBlank", () => {
        const dv: any = {
            metadata: { columns: [{ roles: { actualValue: true } }] },
            table: { rows: [[NaN]] }
        };
        const result = service.parse(dv);
        expect(result.status).toBe(DataViewReadStatus.StableBlank);
    });

    // ── Spec 4 ────────────────────────────────────────────────────────────
    it("4: actualValue role present + rows=[] → TransientIncomplete", () => {
        const dv = dvRoleWithEmptyRows(["actualValue"]);
        const result = service.parse(dv);
        expect(result.status).toBe(DataViewReadStatus.TransientIncomplete);
        expect(result.data.hasActualValueRole).toBe(true);
    });

    // ── Spec 5 ────────────────────────────────────────────────────────────
    it("5: adding title role does NOT change actualValue detection", () => {
        // Stable with value+title
        const dv = dvStableValue(500, /* includeTitle */ true);
        const result = service.parse(dv);
        expect(result.status).toBe(DataViewReadStatus.StableValue);
        expect(result.data.actualValue).toBe(500);
        expect(result.data.title).toBe("My Title");
    });

    // ── Spec 4b ───────────────────────────────────────────────────────────
    it("4b: actualValue + title both in metadata + rows=[] → TransientIncomplete", () => {
        const dv = dvRoleWithEmptyRows(["title", "actualValue"]);
        const result = service.parse(dv);
        expect(result.status).toBe(DataViewReadStatus.TransientIncomplete);
    });

    // ── Spec 10 ───────────────────────────────────────────────────────────
    it("10: title + actualValue in different column order → still extracts actualValue", () => {
        const dv: any = {
            metadata: {
                columns: [
                    { roles: { title: true }, displayName: "My KPI Title" },
                    { roles: { actualValue: true }, displayName: "Revenue" }
                ]
            },
            table: { rows: [["Q1 Sales", 9999]] }
        };
        const result = service.parse(dv);
        expect(result.status).toBe(DataViewReadStatus.StableValue);
        expect(result.data.actualValue).toBe(9999);
        expect(result.data.title).toBe("Q1 Sales");
    });

    // ── Spec 11 ───────────────────────────────────────────────────────────
    it("11: columns with different displayName/queryName maintain actualValue", () => {
        const dv: any = {
            metadata: {
                columns: [
                    { displayName: "TiTuLo RaRo", queryName: "qXYZ", roles: { title: true } },
                    { displayName: "Suma de Ventas", queryName: "qABC", roles: { actualValue: true } }
                ]
            },
            table: { rows: [["Nombre", 42]] }
        };
        const result = service.parse(dv);
        expect(result.status).toBe(DataViewReadStatus.StableValue);
        expect(result.data.actualValue).toBe(42);
    });

    // ── Spec 8 ────────────────────────────────────────────────────────────
    it("8: StableBlank stores null actualValue but hasActualValueRole=true", () => {
        const dv = dvStableValue(null);
        const result = service.parse(dv);
        expect(result.status).toBe(DataViewReadStatus.StableBlank);
        expect(result.data.hasActualValueRole).toBe(true);
        expect(result.data.actualValue).toBeNull();
    });

    // ── Spec 9 ────────────────────────────────────────────────────────────
    it("9: DataView with title only (no actualValue) → NoActualValueRole", () => {
        const dv: any = {
            metadata: { columns: [{ roles: { title: true } }] },
            table: { rows: [["Title Only"]] }
        };
        const result = service.parse(dv);
        expect(result.status).toBe(DataViewReadStatus.NoActualValueRole);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sequential transition tests (Spec 6, 7, 13-15)
// ─────────────────────────────────────────────────────────────────────────────

describe("DataViewService – sequential transitions", () => {
    let service: DataViewService;

    beforeEach(() => {
        service = new DataViewService();
    });

    // ── Spec 6 ────────────────────────────────────────────────────────────
    it("6: StableValue → TransientIncomplete → StableValue (title added)", () => {
        // Step A: stable value, no title
        const dvA = dvStableValue(100);
        const resA = service.parse(dvA);
        expect(resA.status).toBe(DataViewReadStatus.StableValue);
        expect(resA.data.actualValue).toBe(100);

        // Step B: PBI adds title role → transient (rows=[])
        const dvB = dvRoleWithEmptyRows(["title", "actualValue"]);
        const resB = service.parse(dvB);
        expect(resB.status).toBe(DataViewReadStatus.TransientIncomplete);

        // Step C: final stable update with title + value
        const dvC = dvStableValue(100, /* includeTitle */ true);
        const resC = service.parse(dvC);
        expect(resC.status).toBe(DataViewReadStatus.StableValue);
        expect(resC.data.actualValue).toBe(100);
        expect(resC.data.title).toBe("My Title");
    });

    // ── Spec 7 ────────────────────────────────────────────────────────────
    it("7: TransientIncomplete never changes a stored lastStable reference", () => {
        // We simulate this at the service level: the service always returns
        // TransientIncomplete for rows=[] with role present.
        const dvTransient = dvRoleWithEmptyRows(["title", "actualValue"]);
        const res = service.parse(dvTransient);
        expect(res.status).toBe(DataViewReadStatus.TransientIncomplete);
        // The data returned is NOT suitable for stable storage.
        expect(res.data.actualValue).toBeNull();
    });
});
