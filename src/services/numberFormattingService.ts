import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

export class NumberFormattingService {
    public format(value: number | null, formatString?: string, displayUnit?: number): string {
        if (value === null || value === undefined) {
            return "-";
        }
        
        const formatter = valueFormatter.create({
            format: formatString || "0",
            value: displayUnit !== undefined ? displayUnit : undefined,
            allowFormatBeautification: true
        });

        return formatter.format(value);
    }
}
