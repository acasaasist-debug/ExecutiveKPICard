import { KpiLayout, LayoutMode, Size } from "../models/layout";
import { VisualState } from "../models/visualState";
import { VisualDefaults } from "../constants/defaults";
import { SVGConstants } from "../constants/svg";
import { TextUtils } from "../utils/textUtils";

export class LayoutCalculator {
    public calculate(viewport: Size, state: VisualState): KpiLayout {
        const mode = this.determineMode(viewport);
        
        const generalCard = state.settings.general;
        const titleCard = state.settings.title;
        const actualValueCard = state.settings.actualValue;

        const padding = generalCard.padding;
        const fontSizes = SVGConstants.fontSizes[mode.toUpperCase() as keyof typeof SVGConstants.fontSizes];
        const innerWidth = Math.max(0, viewport.width - padding * 2);

        const showTitle = titleCard.show && !!state.title;
        const showActualValue = actualValueCard.show;
        const showComparison = !!state.comparison && !!state.comparison.period;
        const showTarget = !!state.target && mode !== LayoutMode.MINIMUM;
        const showProgress = !!state.achievement && mode !== LayoutMode.MINIMUM;
        const showStatus = !!state.status;

        let currentY = padding;

        // Accent line (siempre en la parte superior, ocupa todo el ancho)
        const accentHeight = generalCard.topLineThickness;
        const accent = {
            x: 0,
            y: 0,
            width: viewport.width,
            height: accentHeight
        };

        // Alignment Helper
        const getAlignment = (align: string, defaultAlign: "start" | "middle" | "end" = "middle") => {
            if (align === "left") return { x: padding, textAnchor: "start" as const };
            if (align === "right") return { x: viewport.width - padding, textAnchor: "end" as const };
            if (align === "center") return { x: viewport.width / 2, textAnchor: "middle" as const };
            return { x: viewport.width / 2, textAnchor: defaultAlign };
        };

        // Title
        let titleLayout = undefined;
        if (showTitle) {
            const fontSize = titleCard.fontSize;
            const align = titleCard.alignment;
            const alignProps = getAlignment(align);
            currentY += fontSize; 
            titleLayout = {
                x: alignProps.x,
                y: currentY,
                width: innerWidth,
                fontSize: fontSize,
                textAnchor: alignProps.textAnchor
            };
            const bottomMargin = titleCard.bottomMargin;
            currentY += bottomMargin; 
        }

        // Value
        let valueLayout = undefined;
        if (showActualValue) {
            const fontSize = actualValueCard.fontSize;
            const align = actualValueCard.alignment;
            const alignProps = getAlignment(align);
            currentY += fontSize;
            valueLayout = {
                x: alignProps.x,
                y: currentY,
                width: innerWidth,
                fontSize: fontSize,
                textAnchor: alignProps.textAnchor
            };
            currentY += mode === LayoutMode.COMPACT ? 10 : 16;
        }

        // Comparison Row (Periodo y Variación)
        let comparisonPeriodLayout = undefined;
        let variationLayout = undefined;
        if (showComparison) {
            // En modo minimum no mostramos el periodo ni la variación secundaria, excepto si hubiera espacio
            // La directiva dice: Ocultar periodo y variación secundaria en modo MINIMUM.
            if (mode !== LayoutMode.MINIMUM) {
                currentY += fontSizes.period;
                comparisonPeriodLayout = {
                    x: padding,
                    y: currentY,
                    width: innerWidth / 2,
                    fontSize: fontSizes.period,
                    textAnchor: "start" as const
                };

                variationLayout = {
                    x: viewport.width - padding,
                    y: currentY,
                    width: innerWidth / 2,
                    fontSize: fontSizes.variation,
                    textAnchor: "end" as const
                };
                currentY += mode === LayoutMode.COMPACT ? 6 : 8;
            }
        }

        // Target Row
        let targetLayout = undefined;
        if (showTarget) {
            currentY += fontSizes.target;
            targetLayout = {
                x: padding,
                y: currentY,
                width: innerWidth,
                fontSize: fontSizes.target,
                textAnchor: "start" as const
            };
            currentY += mode === LayoutMode.COMPACT ? 6 : 8;
        }

        // Progress Bar
        let progressLayout = undefined;
        if (showProgress && state.achievement) {
            const trackHeight = VisualDefaults.Layout.ProgressTrackHeight;
            const trackWidth = innerWidth - 40; // Dejar espacio para el texto del porcentaje
            const track = {
                x: padding,
                y: currentY,
                width: Math.max(0, trackWidth),
                height: trackHeight
            };

            const fillWidth = Math.min(trackWidth, Math.max(0, trackWidth * state.achievement.progressRatio));
            const fill = {
                x: padding,
                y: currentY,
                width: Math.max(0, fillWidth),
                height: trackHeight
            };

            const achievementText = {
                x: viewport.width - padding,
                y: currentY + trackHeight - 1, // Align with track
                width: 35,
                fontSize: fontSizes.achievement,
                textAnchor: "end" as const
            };

            progressLayout = {
                track,
                fill,
                achievementText,
                isOverperforming: state.achievement.progressRatio >= 1,
                overperformanceMarker: state.achievement.progressRatio >= 1 ? {
                    x: padding + trackWidth - 2,
                    y: currentY - 2,
                    width: 4,
                    height: trackHeight + 4
                } : undefined
            };
            currentY += trackHeight + (mode === LayoutMode.COMPACT ? 10 : 16);
        }

        // Status Row (En la parte inferior)
        let statusIndicatorLayout = undefined;
        let statusTextLayout = undefined;
        if (showStatus) {
            // El estado debe ir preferiblemente al fondo. Si currentY excede el viewport, igual calculamos pero podría recortarse.
            // Para mantenerlo siempre visible en el fondo, forzaremos su Y basándonos en la altura total, o usamos un flow top-down.
            // La directiva: "Indicador circular y texto del estado centrados en la parte inferior."
            const statusY = Math.max(currentY + fontSizes.status, viewport.height - padding);
            const radius = VisualDefaults.Layout.StatusIndicatorRadius;
            
            // Calculamos el ancho del texto para centrar todo el bloque (indicador + espacio + texto)
            const textWidth = TextUtils.measureTextWidth(state.status!.text, fontSizes.status, SVGConstants.fontFamilies.primary);
            const totalStatusWidth = (radius * 2) + 6 + textWidth; // 6px gap
            
            const startX = (viewport.width - totalStatusWidth) / 2;

            statusIndicatorLayout = {
                x: startX + radius,
                y: statusY - (fontSizes.status / 2) + 1, // Alineación óptica con el texto
                width: radius * 2,
                height: radius * 2,
                radius: radius
            };

            statusTextLayout = {
                x: startX + (radius * 2) + 6,
                y: statusY,
                width: textWidth,
                fontSize: fontSizes.status,
                textAnchor: "start" as const
            };
        }

        return {
            mode,
            viewport,
            padding,
            showTitle,
            showComparison: !!comparisonPeriodLayout,
            showTarget: !!targetLayout,
            showProgress: !!progressLayout,
            showStatus,
            accent,
            title: titleLayout,
            value: valueLayout,
            comparisonPeriod: comparisonPeriodLayout,
            variation: variationLayout,
            target: targetLayout,
            progress: progressLayout,
            statusIndicator: statusIndicatorLayout,
            statusText: statusTextLayout
        };
    }

    private determineMode(viewport: Size): LayoutMode {
        const { Width, Height } = VisualDefaults.Size;
        const { CompactWidth, CompactHeight, MinWidth, MinHeight } = VisualDefaults.Responsive;

        if (viewport.width < MinWidth || viewport.height < MinHeight) {
            return LayoutMode.MINIMUM;
        }

        if (viewport.width < CompactWidth || viewport.height < CompactHeight) {
            return LayoutMode.COMPACT;
        }

        return LayoutMode.NORMAL;
    }

    private getPadding(mode: LayoutMode): number {
        switch (mode) {
            case LayoutMode.MINIMUM:
                return VisualDefaults.Layout.PaddingMinimum;
            case LayoutMode.COMPACT:
                return VisualDefaults.Layout.PaddingCompact;
            case LayoutMode.NORMAL:
            default:
                return VisualDefaults.Layout.PaddingNormal;
        }
    }
}
