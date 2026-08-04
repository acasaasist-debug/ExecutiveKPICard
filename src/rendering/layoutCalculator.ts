import { KpiLayout, LayoutMode, Size } from "../models/layout";
import { VisualState } from "../models/visualState";
import { VisualDefaults } from "../constants/defaults";
import { SVGConstants } from "../constants/svg";
import { TextUtils } from "../utils/textUtils";

type LayoutBlockKey = "title" | "value" | "comparison" | "target" | "progress" | "status";

interface VerticalBlock {
    key: LayoutBlockKey;
    height: number;
    minGapAfter: number;
    maxGapAfter: number;
    weight: number;
}

const GapsByMode = {
    [LayoutMode.NORMAL]: { min: 6, pref: 14, max: 24, weights: { title: 1.0, value: 1.3, comparison: 0.8, target: 0.6, progress: 1.5, status: 0 } },
    [LayoutMode.COMPACT]: { min: 3, pref: 6, max: 12, weights: { title: 1.0, value: 1.0, comparison: 1.0, target: 1.0, progress: 1.0, status: 0 } },
    [LayoutMode.MINIMUM]: { min: 2, pref: 2, max: 6, weights: { title: 1.0, value: 1.0, comparison: 1.0, target: 1.0, progress: 1.0, status: 0 } }
};

export class LayoutCalculator {
    public calculate(viewport: Size, state: VisualState): KpiLayout {
        const mode = this.determineMode(viewport);
        const settings = state.settings;
        const padding = settings.general.padding;
        const innerWidth = Math.max(0, viewport.width - padding * 2);
        const innerHeight = Math.max(0, viewport.height - padding * 2);

        const showTitle = settings.title.show && !!state.title;
        const showActualValue = settings.actualValue.show;
        const showComparison = settings.comparison.show && !!state.comparison && mode !== LayoutMode.MINIMUM;
        const showTarget = settings.target.show && !!state.target && mode !== LayoutMode.MINIMUM;
        const showProgress = settings.progress.show && !!state.achievement && mode !== LayoutMode.MINIMUM;
        const showStatus = settings.status.show && !!state.calculatedStatusText;

        const blocks: VerticalBlock[] = [];
        const gapsConfig = GapsByMode[mode];

        if (showTitle) {
            blocks.push({
                key: "title",
                height: settings.title.fontSize,
                minGapAfter: gapsConfig.min,
                maxGapAfter: gapsConfig.max,
                weight: gapsConfig.weights.title
            });
        }
        if (showActualValue) {
            blocks.push({
                key: "value",
                height: settings.actualValue.fontSize,
                minGapAfter: gapsConfig.min,
                maxGapAfter: gapsConfig.max,
                weight: gapsConfig.weights.value
            });
        }
        if (showComparison) {
            blocks.push({
                key: "comparison",
                height: settings.comparison.fontSize, // period, variation, icon use same size
                minGapAfter: gapsConfig.min,
                maxGapAfter: gapsConfig.max,
                weight: gapsConfig.weights.comparison
            });
        }
        if (showTarget) {
            blocks.push({
                key: "target",
                height: settings.target.fontSize,
                minGapAfter: gapsConfig.min,
                maxGapAfter: gapsConfig.max,
                weight: gapsConfig.weights.target
            });
        }
        if (showProgress) {
            const progressHeight = settings.progress.showPercentage 
                ? Math.max(settings.progress.height, settings.progress.percentageSize) 
                : settings.progress.height;
            blocks.push({
                key: "progress",
                height: progressHeight,
                minGapAfter: gapsConfig.min,
                maxGapAfter: gapsConfig.max,
                weight: gapsConfig.weights.progress
            });
        }
        if (showStatus) {
            const statusFontSize = settings.status.fontSize;
            const radius = settings.status.showCircle ? (settings.status.circleSize / 2) : 0;
            const statusHeight = Math.max(statusFontSize, radius * 2);
            blocks.push({
                key: "status",
                height: statusHeight,
                minGapAfter: 0,
                maxGapAfter: 0,
                weight: gapsConfig.weights.status
            });
        }

        // Calculate distribution
        let naturalContentHeight = 0;
        const activeGaps: Record<string, number> = {};

        for (let i = 0; i < blocks.length; i++) {
            naturalContentHeight += blocks[i].height;
            if (i < blocks.length - 1) {
                naturalContentHeight += blocks[i].minGapAfter;
                activeGaps[blocks[i].key] = blocks[i].minGapAfter;
            }
        }

        const availableExtraHeight = Math.max(0, innerHeight - naturalContentHeight);
        let remainingExtra = availableExtraHeight;
        let activeBlocks = blocks.slice(0, blocks.length - 1); // Exclude last block as it has no gap after

        while (remainingExtra > 0.5 && activeBlocks.length > 0) {
            const totalWeight = activeBlocks.reduce((sum, b) => sum + b.weight, 0);
            if (totalWeight <= 0) break;
            
            let distributedAny = false;
            
            for (let i = activeBlocks.length - 1; i >= 0; i--) {
                const b = activeBlocks[i];
                const capacity = b.maxGapAfter - activeGaps[b.key];
                
                if (capacity <= 0.01) {
                    activeBlocks.splice(i, 1);
                    continue;
                }
                
                const share = (b.weight / totalWeight) * remainingExtra;
                const add = Math.min(share, capacity);
                
                if (add > 0) {
                    activeGaps[b.key] += add;
                    remainingExtra -= add;
                    distributedAny = true;
                }
            }
            
            if (!distributedAny) break;
        }

        const topOffset = remainingExtra / 2;

        let currentY = padding + topOffset;
        
        const accent = { x: 0, y: 0, width: viewport.width, height: settings.general.topLineThickness };
        
        const getAlignment = (align: string, defaultAlign: "start" | "middle" | "end" = "middle") => {
            if (align === "left") return { x: padding, textAnchor: "start" as const };
            if (align === "right") return { x: viewport.width - padding, textAnchor: "end" as const };
            if (align === "center") return { x: viewport.width / 2, textAnchor: "middle" as const };
            return { x: viewport.width / 2, textAnchor: defaultAlign };
        };

        const result: KpiLayout = {
            mode,
            viewport,
            padding,
            showTitle,
            showComparison,
            showTarget,
            showProgress,
            showStatus,
            accent
        };

        for (let i = 0; i < blocks.length; i++) {
            const b = blocks[i];
            const blockTop = currentY;

            switch (b.key) {
                case "title":
                    const titleAlign = getAlignment(settings.title.alignment);
                    result.title = {
                        x: titleAlign.x,
                        y: blockTop + b.height,
                        width: innerWidth,
                        fontSize: b.height,
                        textAnchor: titleAlign.textAnchor
                    };
                    break;
                    
                case "value":
                    const valAlign = getAlignment(settings.actualValue.alignment);
                    result.value = {
                        x: valAlign.x,
                        y: blockTop + b.height,
                        width: innerWidth,
                        fontSize: b.height,
                        textAnchor: valAlign.textAnchor
                    };
                    break;
                    
                case "comparison":
                    const compFontSize = settings.comparison.fontSize;
                    if (settings.comparison.showPeriod) {
                        result.comparisonPeriod = {
                            x: padding,
                            y: blockTop + compFontSize,
                            width: innerWidth / 2,
                            fontSize: compFontSize,
                            textAnchor: "start"
                        };
                    }
                    if (settings.comparison.showVariation) {
                        result.variation = {
                            x: viewport.width - padding,
                            y: blockTop + compFontSize,
                            width: innerWidth / (settings.comparison.showPeriod ? 2 : 1),
                            fontSize: compFontSize,
                            textAnchor: "end"
                        };
                    }
                    break;
                    
                case "target":
                    result.target = {
                        x: padding,
                        y: blockTop + b.height,
                        width: innerWidth,
                        fontSize: b.height,
                        textAnchor: "start"
                    };
                    break;
                    
                case "progress":
                    const trackHeight = settings.progress.height;
                    const trackWidth = innerWidth - (settings.progress.showPercentage ? 40 : 0);
                    const trackY = blockTop + (b.height - trackHeight) / 2;
                    
                    const track = {
                        x: padding,
                        y: trackY,
                        width: Math.max(0, trackWidth),
                        height: trackHeight
                    };

                    const fillRatio = Math.max(0, Math.min(1, state.achievement!.progressRatio));
                    const fill = {
                        x: padding,
                        y: trackY,
                        width: Math.max(0, trackWidth * fillRatio),
                        height: trackHeight
                    };

                    let achievementText = undefined;
                    if (settings.progress.showPercentage) {
                        achievementText = {
                            x: viewport.width - padding,
                            y: blockTop + b.height - (b.height - settings.progress.percentageSize) / 2, // Center text vertically in block, or just align bottom
                            width: 35,
                            fontSize: settings.progress.percentageSize,
                            textAnchor: "end" as const
                        };
                        // For better visual alignment, align text baseline near the track baseline
                        achievementText.y = trackY + trackHeight; 
                    }

                    const isOverperforming = state.achievement!.progressRatio > 1;
                    let overperformanceMarker = undefined;
                    if (isOverperforming && settings.progress.showOverachievementMark) {
                        const mThickness = settings.progress.markThickness;
                        overperformanceMarker = {
                            x: padding + trackWidth - (mThickness / 2),
                            y: trackY - 2,
                            width: mThickness,
                            height: trackHeight + 4
                        };
                    }

                    result.progress = { track, fill, achievementText, isOverperforming, overperformanceMarker };
                    break;
                    
                case "status":
                    const sFontSize = settings.status.fontSize;
                    const sRadius = settings.status.showCircle ? (settings.status.circleSize / 2) : 0;
                    const statusY = blockTop + b.height; 
                    const textWidth = TextUtils.measureTextWidth(state.calculatedStatusText, sFontSize, settings.status.fontFamily);
                    const circleSpace = sRadius > 0 ? (sRadius * 2) + 6 : 0;
                    const totalWidth = circleSpace + textWidth;
                    const startX = (viewport.width - totalWidth) / 2;

                    if (sRadius > 0) {
                        result.statusIndicator = {
                            x: startX + sRadius,
                            y: statusY - (sFontSize / 2) + 1,
                            width: sRadius * 2,
                            height: sRadius * 2,
                            radius: sRadius
                        };
                    }

                    result.statusText = {
                        x: startX + circleSpace,
                        y: statusY,
                        width: textWidth,
                        fontSize: sFontSize,
                        textAnchor: "start"
                    };
                    break;
            }

            if (i < blocks.length - 1) {
                currentY += b.height + activeGaps[b.key];
            } else {
                currentY += b.height;
            }
        }

        return result;
    }

    private determineMode(viewport: Size): LayoutMode {
        const { MinWidth, MinHeight, CompactWidth, CompactHeight } = VisualDefaults.Responsive;

        if (viewport.width < MinWidth || viewport.height < MinHeight) {
            return LayoutMode.MINIMUM;
        }

        if (viewport.width < CompactWidth || viewport.height < CompactHeight) {
            return LayoutMode.COMPACT;
        }

        return LayoutMode.NORMAL;
    }
}
