import { DataViewService } from "../src/services/dataViewService";
import powerbi from "powerbi-visuals-api";

describe("DataViewService", () => {
    let service: DataViewService;

    beforeEach(() => {
        service = new DataViewService();
    });

    // 1. Identifica actualValue mediante metadata.columns[].roles.
    // 2. No depende de displayName ni queryName.
    // 3. Funciona con nombres de medidas completamente diferentes.
    it("identifies actualValue via roles, regardless of displayName or queryName", () => {
        const dv: any = {
            metadata: {
                columns: [
                    { displayName: "CrazyName1", queryName: "q1", roles: { actualValue: true } },
                    { displayName: "CrazyName2", queryName: "q2", roles: { title: true } }
                ]
            },
            table: {
                rows: [[100, "Title"]]
            }
        };
        const result = service.parse(dv);
        expect(result.actualValue).toBe(100);
        expect(result.title).toBe("Title");
    });

    // 4. Tabla presente pero sin filas.
    it("handles table present but without rows", () => {
        const dv: any = {
            metadata: { columns: [{ roles: { actualValue: true } }] },
            table: { rows: [] }
        };
        const result = service.parse(dv);
        expect(result.actualValue).toBeNull();
    });

    // 5. Rechaza NaN.
    // 6. Rechaza Infinity.
    it("rejects NaN and Infinity", () => {
        const dv: any = {
            metadata: { columns: [{ roles: { actualValue: true } }] },
            table: { rows: [[NaN], [Infinity], [-Infinity]] }
        };
        const result = service.parse(dv);
        expect(result.actualValue).toBeNull();
    });

    // 7. Extrae todos los roles disponibles.
    it("extracts all available roles", () => {
        const dv: any = {
            metadata: {
                columns: [
                    { roles: { title: true } },
                    { roles: { actualValue: true } },
                    { roles: { previousValue: true } },
                    { roles: { variation: true } },
                    { roles: { target: true } },
                    { roles: { achievement: true } },
                    { roles: { status: true } },
                    { roles: { comparisonPeriod: true } },
                    { roles: { statusColor: true } },
                    { roles: { variationColor: true } },
                    { roles: { trendIcon: true } },
                ]
            },
            table: {
                rows: [
                    [
                        "Title", 100, 80, 0.25, 120, 0.83,
                        "Status", "Period", "#FFFFFF", "#000000", "Icon"
                    ]
                ]
            }
        };
        const result = service.parse(dv);
        expect(result.title).toBe("Title");
        expect(result.actualValue).toBe(100);
        expect(result.previousValue).toBe(80);
        expect(result.variation).toBe(0.25);
        expect(result.target).toBe(120);
        expect(result.achievement).toBe(0.83);
        expect(result.status).toBe("Status");
        expect(result.comparisonPeriod).toBe("Period");
        expect(result.statusColor).toBe("#FFFFFF");
        expect(result.variationColor).toBe("#000000");
        expect(result.trendIcon).toBe("Icon");
    });

    // 8. Conserva los format strings de actualValue, previousValue y target.
    it("preserves format strings of actualValue, previousValue, and target", () => {
        const dv: any = {
            metadata: {
                columns: [
                    { roles: { actualValue: true }, format: "0.0" },
                    { roles: { previousValue: true }, format: "0.00" },
                    { roles: { target: true }, format: "0.000" },
                ]
            },
            table: {
                rows: [[1, 2, 3]]
            }
        };
        const result = service.parse(dv);
        expect(result.actualValueFormat).toBe("0.0");
        expect(result.previousValueFormat).toBe("0.00");
        expect(result.targetFormat).toBe("0.000");
    });
});
