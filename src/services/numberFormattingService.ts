import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import { isFiniteNumber } from "../utils/validationUtils";

export interface FormatOptions {
    formatString?: string;
    useModelFormat?: boolean;
    displayUnits?: number;
    decimalPlaces?: number;
    prefix?: string;
    suffix?: string;
    thousandsSeparator?: boolean;
    showDashIfNull?: boolean;
}

export class NumberFormattingService {
    public format(value: number | null, options: FormatOptions = {}): string {
        if (!isFiniteNumber(value)) {
            return options.showDashIfNull !== false ? "—" : "";
        }
        
        const useModelFormat = options.useModelFormat !== false;
        
        let formatterOptions: any = {
            format: options.formatString || "0",
            allowFormatBeautification: true
        };

        if (!useModelFormat) {
            // Apply manual format options
            formatterOptions.value = options.displayUnits !== undefined && options.displayUnits !== 0 ? options.displayUnits : undefined;
            if (options.decimalPlaces !== undefined && options.decimalPlaces !== null) {
                formatterOptions.precision = options.decimalPlaces;
            }
            // For thousands separator, powerbi-visuals-utils-formattingutils relies on format string mostly, 
            // but we can manipulate the string format or use it dynamically if needed.
            // Since we override model format, we might need a generic format string.
            // "0" or "0.00" vs "#,0" or "#,0.00"
            let genericFormat = options.thousandsSeparator ? "#,0" : "0";
            if (options.decimalPlaces && options.decimalPlaces > 0) {
                // Formattingutils uses precision, but providing a base string helps.
            }
            formatterOptions.format = genericFormat;
        } else {
            // Original format string behavior with optional value override
            formatterOptions.value = options.displayUnits !== undefined && options.displayUnits !== 0 ? options.displayUnits : undefined;
        }
        
        const formatter = valueFormatter.create(formatterOptions);
        let formattedText = formatter.format(value);

        if (!useModelFormat) {
            if (options.prefix) {
                formattedText = options.prefix + formattedText;
            }
            if (options.suffix) {
                formattedText = formattedText + options.suffix;
            }
        }

        return formattedText;
    }

    public formatTarget(
        target: number | null,
        targetFormat: string | undefined,
        actualValueFormat: string | undefined,
        inheritValueFormat: boolean,
        actualValueOptions: {
            useModelFormat: boolean;
            displayUnits: number;
            decimalPlaces: number;
            prefix: string;
            suffix: string;
            thousandsSeparator: boolean;
        },
        targetOptions: {
            displayUnits: number;
            decimalPlaces: number;
            prefix: string;
            suffix: string;
        }
    ): string {
        if (!isFiniteNumber(target)) {
            return "";
        }

        if (inheritValueFormat) {
            if (actualValueOptions.useModelFormat) {
                return this.format(target, { 
                    formatString: targetFormat || actualValueFormat 
                });
            } else {
                return this.format(target, {
                    useModelFormat: false,
                    displayUnits: actualValueOptions.displayUnits,
                    decimalPlaces: actualValueOptions.decimalPlaces,
                    prefix: actualValueOptions.prefix,
                    suffix: actualValueOptions.suffix,
                    thousandsSeparator: actualValueOptions.thousandsSeparator
                });
            }
        } else {
            return this.format(target, {
                useModelFormat: false,
                displayUnits: targetOptions.displayUnits,
                decimalPlaces: targetOptions.decimalPlaces,
                prefix: targetOptions.prefix,
                suffix: targetOptions.suffix
            });
        }
    }

    public formatPercentage(value: number | null, decimals: number): string {
        if (!isFiniteNumber(value)) {
            return "";
        }
        const formatString = "0" + (decimals > 0 ? "." + "0".repeat(decimals) : "") + " %";
        return this.format(value, { formatString });
    }
}
