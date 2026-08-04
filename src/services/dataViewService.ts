import powerbi from "powerbi-visuals-api";
import { KpiData } from "../models/kpiData";
import { getColumnIndexByRole, getFormatStringByRole } from "../utils/dataRoleUtils";
import { isFiniteNumber, safeText } from "../utils/validationUtils";

export class DataViewService {
    public parse(dataView?: powerbi.DataView): KpiData {
        const defaultData: KpiData = { actualValue: null };

        if (!dataView || !dataView.table || !dataView.table.rows || dataView.table.rows.length === 0) {
            return defaultData;
        }

        const table = dataView.table;
        const columns = dataView.metadata?.columns;
        if (!columns) return defaultData;

        // Resolve indices by role, avoiding hardcoded display names
        const titleIdx = getColumnIndexByRole(columns, "title");
        const actualValueIdx = getColumnIndexByRole(columns, "actualValue");
        const previousValueIdx = getColumnIndexByRole(columns, "previousValue");
        const variationIdx = getColumnIndexByRole(columns, "variation");
        const targetIdx = getColumnIndexByRole(columns, "target");
        const achievementIdx = getColumnIndexByRole(columns, "achievement");
        const statusIdx = getColumnIndexByRole(columns, "status");
        const comparisonPeriodIdx = getColumnIndexByRole(columns, "comparisonPeriod");
        const statusColorIdx = getColumnIndexByRole(columns, "statusColor");
        const variationColorIdx = getColumnIndexByRole(columns, "variationColor");
        const trendIconIdx = getColumnIndexByRole(columns, "trendIcon");

        if (actualValueIdx === -1 || !table.rows) {
            return defaultData;
        }

        // Find the first valid row (where actualValue is a finite number)
        let validRow: powerbi.DataViewTableRow | null = null;
        for (const row of table.rows) {
            if (isFiniteNumber(row[actualValueIdx])) {
                validRow = row;
                break;
            }
        }

        if (!validRow) {
            return defaultData;
        }

        return {
            title: titleIdx !== -1 ? safeText(validRow[titleIdx]) : undefined,
            actualValue: validRow[actualValueIdx] as number,
            previousValue: previousValueIdx !== -1 && isFiniteNumber(validRow[previousValueIdx]) ? validRow[previousValueIdx] as number : null,
            variation: variationIdx !== -1 && isFiniteNumber(validRow[variationIdx]) ? validRow[variationIdx] as number : null,
            target: targetIdx !== -1 && isFiniteNumber(validRow[targetIdx]) ? validRow[targetIdx] as number : null,
            achievement: achievementIdx !== -1 && isFiniteNumber(validRow[achievementIdx]) ? validRow[achievementIdx] as number : null,
            status: statusIdx !== -1 ? safeText(validRow[statusIdx]) : undefined,
            comparisonPeriod: comparisonPeriodIdx !== -1 ? safeText(validRow[comparisonPeriodIdx]) : undefined,
            statusColor: statusColorIdx !== -1 ? safeText(validRow[statusColorIdx]) : undefined,
            variationColor: variationColorIdx !== -1 ? safeText(validRow[variationColorIdx]) : undefined,
            trendIcon: trendIconIdx !== -1 ? safeText(validRow[trendIconIdx]) : undefined,
            actualValueFormat: getFormatStringByRole(columns, "actualValue"),
            previousValueFormat: getFormatStringByRole(columns, "previousValue"),
            targetFormat: getFormatStringByRole(columns, "target")
        };
    }
}
