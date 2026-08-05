import { RenderSettings } from "../models/visualState";
import { clamp } from "./mathUtils";
import { normalizeHexColor, safeText, normalizeBoolean } from "./validationUtils";

export function normalizeRenderSettings(
    generalCard: any,
    titleCard: any,
    actualValueCard: any,
    comparisonCard: any,
    targetCard: any,
    progressCard: any,
    statusCard: any,
    responsiveCard: any,
    tooltipSettingsCard: any
): RenderSettings {
    const height = clamp(progressCard.height.value, 4, 40);
    const configuredRadius = clamp(progressCard.radius.value, 0, 20);
    const effectiveRadius = Math.min(configuredRadius, height / 2);

    const rawSuccess = clamp(statusCard.successThreshold.value, 0, 5);
    const rawWarning = clamp(statusCard.warningThreshold.value, 0, 5);
    const effectiveSuccessThreshold = Math.max(rawSuccess, rawWarning);
    const effectiveWarningThreshold = Math.min(rawSuccess, rawWarning);

    let rawStatusSource = statusCard.statusSource.value?.value || "auto";
    if (rawStatusSource !== "auto" && rawStatusSource !== "data" && rawStatusSource !== "custom") {
        rawStatusSource = "auto";
    }

    const responsiveSettings = responsiveCard || ({} as any);
    const minWidthRaw = Number(responsiveSettings.minWidth?.value);
    const minWidth = isNaN(minWidthRaw) ? 180 : Math.min(Math.max(minWidthRaw, 100), 500);
    
    const minHeightRaw = Number(responsiveSettings.minHeight?.value);
    const minHeight = isNaN(minHeightRaw) ? 140 : Math.min(Math.max(minHeightRaw, 80), 500);

    return {
        general: {
            backgroundColor: normalizeHexColor(generalCard.backgroundColor.value.value, "#FFFFFF"),
            transparency: clamp(generalCard.transparency.value, 0, 100),
            borderOn: normalizeBoolean(generalCard.borderOn?.value, false),
            borderColor: normalizeHexColor(generalCard.borderColor.value.value, "#D7DDE5"),
            borderThickness: clamp(generalCard.borderThickness.value, 0, Infinity),
            cornerRadius: clamp(generalCard.cornerRadius.value, 0, Infinity),
            padding: clamp(generalCard.padding.value, 0, Infinity),
            topLineOn: normalizeBoolean(generalCard.topLineOn?.value, false),
            topLineUseStatusColor: normalizeBoolean(generalCard.topLineUseStatusColor?.value, true),
            topLineThickness: clamp(generalCard.topLineThickness.value, 0, Infinity),
            topLineColor: normalizeHexColor(generalCard.topLineColor.value.value, "#3B82F6")
        },
        title: {
            show: normalizeBoolean(titleCard.show?.value, true),
            fontFamily: safeText(titleCard.fontFamily.value) ?? "Segoe UI",
            fontSize: clamp(titleCard.fontSize.value, 8, Infinity),
            bold: normalizeBoolean(titleCard.bold?.value, false),
            color: normalizeHexColor(titleCard.color.value.value, "#111827"),
            alignment: safeText(titleCard.alignment.value)?.trim() || "center",
            bottomMargin: clamp(titleCard.bottomMargin.value, 0, Infinity)
        },
        actualValue: {
            show: normalizeBoolean(actualValueCard.show?.value, true),
            useModelFormat: normalizeBoolean(actualValueCard.useModelFormat?.value, true),
            fontFamily: safeText(actualValueCard.fontFamily.value) ?? "Segoe UI",
            fontSize: clamp(actualValueCard.fontSize.value, 8, Infinity),
            bold: normalizeBoolean(actualValueCard.bold?.value, true),
            color: normalizeHexColor(actualValueCard.color.value.value, "#111827"),
            alignment: safeText(actualValueCard.alignment.value)?.trim() || "center",
            displayUnits: clamp(actualValueCard.displayUnits.value, 0, Infinity),
            decimalPlaces: clamp(actualValueCard.decimalPlaces.value, 0, 10),
            prefix: safeText(actualValueCard.prefix.value) ?? "",
            suffix: safeText(actualValueCard.suffix.value) ?? "",
            thousandsSeparator: normalizeBoolean(actualValueCard.thousandsSeparator?.value, true),
            showDashIfNull: normalizeBoolean(actualValueCard.showDashIfNull?.value, false)
        },
        comparison: {
            show: normalizeBoolean(comparisonCard.show?.value, true),
            showPeriod: normalizeBoolean(comparisonCard.showPeriod?.value, true),
            defaultPeriodText: safeText(comparisonCard.defaultPeriodText.value) ?? "vs período anterior",
            showVariation: normalizeBoolean(comparisonCard.showVariation?.value, true),
            showArrow: normalizeBoolean(comparisonCard.showArrow?.value, true),
            fontFamily: safeText(comparisonCard.fontFamily.value) ?? "Segoe UI",
            fontSize: clamp(comparisonCard.fontSize.value, 8, 36),
            positiveColor: normalizeHexColor(comparisonCard.positiveColor.value.value, "#16A34A"),
            negativeColor: normalizeHexColor(comparisonCard.negativeColor.value.value, "#DC2626"),
            neutralColor: normalizeHexColor(comparisonCard.neutralColor.value.value, "#6B7280"),
            invertLogic: normalizeBoolean(comparisonCard.invertLogic?.value, false),
            percentageDecimals: clamp(comparisonCard.percentageDecimals.value, 0, 5),
            noComparisonText: safeText(comparisonCard.noComparisonText.value)?.trim() || "-"
        },
        target: {
            show: normalizeBoolean(targetCard.show?.value, true),
            inheritValueFormat: normalizeBoolean(targetCard.inheritValueFormat?.value, false),
            label: safeText(targetCard.label.value) ?? "Meta: ",
            fontFamily: safeText(targetCard.fontFamily.value) ?? "Segoe UI",
            fontSize: clamp(targetCard.fontSize.value, 8, 36),
            color: normalizeHexColor(targetCard.color.value.value, "#6B7280"),
            displayUnits: clamp(targetCard.displayUnits.value, 0, Infinity),
            decimalPlaces: clamp(targetCard.decimalPlaces.value, 0, 10),
            prefix: safeText(targetCard.prefix.value) ?? "",
            suffix: safeText(targetCard.suffix.value) ?? ""
        },
        progress: {
            show: normalizeBoolean(progressCard.show?.value, true),
            height: height,
            effectiveRadius: effectiveRadius,
            backgroundColor: normalizeHexColor(progressCard.backgroundColor.value.value, "#E5E7EB"),
            useStatusColor: normalizeBoolean(progressCard.useStatusColor?.value, true),
            customColor: normalizeHexColor(progressCard.customColor.value.value, "#3B82F6"),
            showPercentage: normalizeBoolean(progressCard.showPercentage?.value, false),
            percentageSize: clamp(progressCard.percentageSize.value, 8, 36),
            percentageColor: normalizeHexColor(progressCard.percentageColor.value.value, "#6B7280"),
            decimalPlaces: clamp(progressCard.decimalPlaces.value, 0, 5),
            showOverachievementMark: normalizeBoolean(progressCard.showOverachievementMark?.value, true),
            markColor: normalizeHexColor(progressCard.markColor.value.value, "#111827"),
            markThickness: clamp(progressCard.markThickness.value, 1, 10)
        },
        status: {
            show: normalizeBoolean(statusCard.show?.value, true),
            statusSource: rawStatusSource as "auto" | "data" | "custom",
            showCircle: normalizeBoolean(statusCard.showCircle?.value, true),
            circleSize: clamp(statusCard.circleSize.value, 2, 24),
            fontFamily: safeText(statusCard.fontFamily.value) ?? "Segoe UI",
            fontSize: clamp(statusCard.fontSize.value, 8, 36),
            textColor: normalizeHexColor(statusCard.color.value.value, "#6B7280"),
            effectiveSuccessThreshold,
            effectiveWarningThreshold,
            successText: safeText(statusCard.successText.value)?.trim() || "Cumpliendo",
            warningText: safeText(statusCard.warningText.value)?.trim() || "En camino",
            dangerText: safeText(statusCard.dangerText.value)?.trim() || "En riesgo",
            noDataText: safeText(statusCard.noDataText.value)?.trim() || "Sin información",
            successColor: normalizeHexColor(statusCard.successColor.value.value, "#16A34A"),
            warningColor: normalizeHexColor(statusCard.warningColor.value.value, "#F59E0B"),
            dangerColor: normalizeHexColor(statusCard.dangerColor.value.value, "#DC2626"),
            neutralColor: normalizeHexColor(statusCard.neutralColor.value.value, "#6B7280")
        },
        responsive: {
            autoScale: normalizeBoolean(responsiveSettings.autoScale?.value, true),
            minWidth: minWidth,
            minHeight: minHeight,
            hideSecondary: normalizeBoolean(responsiveSettings.hideSecondary?.value, true),
            compactMode: normalizeBoolean(responsiveSettings.compactMode?.value, true)
        },
        tooltip: {
            show: normalizeBoolean(tooltipSettingsCard?.show?.value, true)
        }
    };
}
