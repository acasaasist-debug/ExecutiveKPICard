import powerbi from "powerbi-visuals-api";
import { KpiData } from "../models/kpiData";
import { DataViewReadStatus } from "../models/dataViewStatus";
import { getColumnIndexByRole, getFormatStringByRole } from "../utils/dataRoleUtils";
import { isFiniteNumber, safeText } from "../utils/validationUtils";

export interface DataViewParseResult {
    status: DataViewReadStatus;
    data: KpiData;
}

// Default empty KpiData returned when there is no actualValue role.
const EMPTY_KPI_DATA: KpiData = {
    hasActualValueRole: false,
    actualValue: null,
    actualValueFormat: ""
};

export class DataViewService {
    /**
     * Parses a Power BI DataView and returns an explicit classification
     * together with the extracted KPI data.
     *
     * Classification rules
     * ────────────────────
     * NoActualValueRole   – metadata lacks the actualValue role column.
     * TransientIncomplete – actualValue role present in metadata, but
     *                       table.rows is missing or empty. This is the
     *                       transient window while PBI re-queries after a
     *                       new role is added. Do NOT treat as BLANK.
     * StableBlank         – actualValue role present, row exists, value is
     *                       null or BLANK.
     * StableValue         – actualValue role present, row exists, value is
     *                       a finite number.
     */
    public parse(dataView?: powerbi.DataView): DataViewParseResult {
        const noRoleResult: DataViewParseResult = {
            status: DataViewReadStatus.NoActualValueRole,
            data: EMPTY_KPI_DATA
        };

        // ── 1. Guard: need at least metadata.columns ──────────────────
        if (!dataView || !dataView.metadata?.columns) {
            return noRoleResult;
        }

        const columns = dataView.metadata.columns;

        // ── 2. Check whether the actualValue role is bound ────────────
        const actualValueIdx = getColumnIndexByRole(columns, "actualValue");
        if (actualValueIdx === -1) {
            return noRoleResult;
        }

        // Resolve all other column indices now that we know the role exists.
        const titleIdx           = getColumnIndexByRole(columns, "title");
        const previousValueIdx   = getColumnIndexByRole(columns, "previousValue");
        const variationIdx       = getColumnIndexByRole(columns, "variation");
        const targetIdx          = getColumnIndexByRole(columns, "target");
        const achievementIdx     = getColumnIndexByRole(columns, "achievement");
        const statusIdx          = getColumnIndexByRole(columns, "status");
        const comparisonPeriodIdx = getColumnIndexByRole(columns, "comparisonPeriod");
        const statusColorIdx     = getColumnIndexByRole(columns, "statusColor");
        const variationColorIdx  = getColumnIndexByRole(columns, "variationColor");
        const trendIconIdx       = getColumnIndexByRole(columns, "trendIcon");

        // ── 3. Detect TransientIncomplete ─────────────────────────────
        // The table object may be absent or its rows array may be empty.
        // This happens during the brief window after a new role is added
        // while Power BI re-executes the query. It is NOT a BLANK value.
        const table = dataView.table;
        if (!table || !table.rows || table.rows.length === 0) {
            return {
                status: DataViewReadStatus.TransientIncomplete,
                data: {
                    hasActualValueRole: true,
                    actualValue: null,
                    actualValueFormat: getFormatStringByRole(columns, "actualValue") ?? ""
                }
            };
        }

        // ── 4. First processable row ──────────────────────────────────
        const row = table.rows[0];
        const rawActualValue = row[actualValueIdx];
        const actualValue = isFiniteNumber(rawActualValue)
            ? (rawActualValue as number)
            : null;

        // Determine actualValueFormat before building the full result.
        const actualValueFormat = getFormatStringByRole(columns, "actualValue") ?? "";

        const fullData: KpiData = {
            hasActualValueRole: true,
            title:          titleIdx          !== -1 ? safeText(row[titleIdx])          : undefined,
            actualValue,
            previousValue:  previousValueIdx  !== -1 && isFiniteNumber(row[previousValueIdx])
                                ? (row[previousValueIdx] as number) : null,
            variation:      variationIdx      !== -1 && isFiniteNumber(row[variationIdx])
                                ? (row[variationIdx] as number) : null,
            target:         targetIdx         !== -1 && isFiniteNumber(row[targetIdx])
                                ? (row[targetIdx] as number) : null,
            achievement:    achievementIdx    !== -1 && isFiniteNumber(row[achievementIdx])
                                ? (row[achievementIdx] as number) : null,
            status:         statusIdx         !== -1 ? safeText(row[statusIdx])         : undefined,
            comparisonPeriod: comparisonPeriodIdx !== -1 ? safeText(row[comparisonPeriodIdx]) : undefined,
            statusColor:    statusColorIdx    !== -1 ? safeText(row[statusColorIdx])    : undefined,
            variationColor: variationColorIdx !== -1 ? safeText(row[variationColorIdx]) : undefined,
            trendIcon:      trendIconIdx      !== -1 ? safeText(row[trendIconIdx])      : undefined,
            actualValueFormat,
            previousValueFormat: getFormatStringByRole(columns, "previousValue"),
            targetFormat:        getFormatStringByRole(columns, "target")
        };

        // ── 5. StableValue vs StableBlank ─────────────────────────────
        const status = actualValue !== null
            ? DataViewReadStatus.StableValue
            : DataViewReadStatus.StableBlank;

        return { status, data: fullData };
    }
}
