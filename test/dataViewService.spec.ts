import { DataViewService } from "../src/services/dataViewService";
import { DataViewReadStatus } from "../src/models/dataViewStatus";
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
        const { status, data } = service.parse(dv);
        expect(status).toBe(DataViewReadStatus.StableValue);
        expect(data.actualValue).toBe(100);
        expect(data.title).toBe("Title");
    });

    // 4. Tabla presente pero sin filas → TransientIncomplete (no NoActualValueRole)
    it("returns TransientIncomplete when actualValue role exists but rows are empty", () => {
        const dv: any = {
            metadata: { columns: [{ roles: { actualValue: true } }] },
            table: { rows: [] }
        };
        const { status, data } = service.parse(dv);
        expect(status).toBe(DataViewReadStatus.TransientIncomplete);
        // hasActualValueRole must be true – role IS bound
        expect(data.hasActualValueRole).toBe(true);
        // actualValue is null because there is no row yet
        expect(data.actualValue).toBeNull();
    });

    // 5. Rechaza NaN y null como values pero preserva hasActualValueRole
    // 6. Rechaza Infinity.
    it("rejects NaN and Infinity but keeps hasActualValueRole true if role exists", () => {
        const dv: any = {
            metadata: { columns: [{ roles: { actualValue: true } }] },
            table: { rows: [[NaN]] }
        };
        let { status, data } = service.parse(dv);
        expect(status).toBe(DataViewReadStatus.StableBlank);
        expect(data.hasActualValueRole).toBe(true);
        expect(data.actualValue).toBeNull();

        dv.table.rows = [[Infinity]];
        ({ status, data } = service.parse(dv));
        expect(status).toBe(DataViewReadStatus.StableBlank);
        expect(data.actualValue).toBeNull();
    });

    it("identifies when there is no actualValue role", () => {
        const dv: any = {
            metadata: { columns: [{ roles: { title: true } }] },
            table: { rows: [["Title Only"]] }
        };
        const { status, data } = service.parse(dv);
        expect(status).toBe(DataViewReadStatus.NoActualValueRole);
        expect(data.hasActualValueRole).toBe(false);
    });

    it("identifies when there is an actualValue role but value is null (BLANK)", () => {
        const dv: any = {
            metadata: { columns: [{ roles: { actualValue: true } }] },
            table: { rows: [[null]] }
        };
        const { status, data } = service.parse(dv);
        expect(status).toBe(DataViewReadStatus.StableBlank);
        expect(data.hasActualValueRole).toBe(true);
        expect(data.actualValue).toBeNull();
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
        const { status, data } = service.parse(dv);
        expect(status).toBe(DataViewReadStatus.StableValue);
        expect(data.title).toBe("Title");
        expect(data.actualValue).toBe(100);
        expect(data.previousValue).toBe(80);
        expect(data.variation).toBe(0.25);
        expect(data.target).toBe(120);
        expect(data.achievement).toBe(0.83);
        expect(data.status).toBe("Status");
        expect(data.comparisonPeriod).toBe("Period");
        expect(data.statusColor).toBe("#FFFFFF");
        expect(data.variationColor).toBe("#000000");
        expect(data.trendIcon).toBe("Icon");
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
        const { data } = service.parse(dv);
        expect(data.actualValueFormat).toBe("0.0");
        expect(data.previousValueFormat).toBe("0.00");
        expect(data.targetFormat).toBe("0.000");
    });
});
