import powerbi from "powerbi-visuals-api";

export function getColumnIndexByRole(columns: powerbi.DataViewMetadataColumn[], roleName: string): number {
    if (!columns) return -1;
    for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        if (col && col.roles && col.roles[roleName] === true) {
            return i;
        }
    }
    return -1;
}

export function getFormatStringByRole(columns: powerbi.DataViewMetadataColumn[], roleName: string): string | undefined {
    const index = getColumnIndexByRole(columns, roleName);
    if (index !== -1 && columns[index].format) {
        return columns[index].format;
    }
    return undefined;
}
