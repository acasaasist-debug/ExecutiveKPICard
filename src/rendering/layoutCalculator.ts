import { KpiLayout, ResponsiveMode, ResponsiveElementKey, Size } from "../models/layout";
import { VisualState } from "../models/visualState";
import { TextUtils } from "../utils/textUtils";

export class LayoutCalculator {
    public calculate(viewport: Size, state: VisualState): KpiLayout {
        const minWidth = state.settings?.responsive?.minWidth ?? 120;
        const minHeight = state.settings?.responsive?.minHeight ?? 100;
        const compactModeEnabled = state.settings?.responsive?.compactMode ?? true;

        const normalCandidate = this.calculateCandidate(viewport, "normal", state);
        if (viewport.width >= minWidth && viewport.height >= minHeight && normalCandidate.fits) {
            return normalCandidate;
        }
        // console.log("normalCandidate.fits is", normalCandidate.fits, "for viewport", viewport);

        if (compactModeEnabled) {
            const compactCandidate = this.calculateCandidate(viewport, "compact", state);
            if (compactCandidate.fits) {
                return compactCandidate;
            }
        }

        return this.calculateCandidate(viewport, "minimum", state);
    }

    private getPriorities(): ResponsiveElementKey[] {
        return [
            "comparisonPeriod",
            "trendIcon",
            "comparison",
            "target",
            "progressPercentage",
            "progress",
            "statusCircle",
            "title"
        ];
    }

    private calculateCandidate(viewport: Size, mode: ResponsiveMode, state: VisualState): KpiLayout {
        const settings = state.settings;
        const padding = settings.general.padding;
        const innerWidth = viewport.width - (padding * 2);
        const innerHeight = viewport.height - (padding * 2);

        let scaleValue = 1.0;
        let scaleSecondary = 1.0;
        const autoScale = settings.responsive?.autoScale ?? true;

        if (autoScale) {
            if (mode === "compact") {
                scaleValue = 0.95;
                scaleSecondary = 0.90;
            } else if (mode === "minimum") {
                scaleValue = 0.85;
                scaleSecondary = 0.80;
            }
        }

        const effectiveFontSizes = {
            title: Math.floor(settings.title.fontSize * scaleSecondary),
            actualValue: Math.floor(settings.actualValue.fontSize * scaleValue),
            comparison: Math.floor(settings.comparison.fontSize * scaleSecondary),
            comparisonPeriod: Math.floor(settings.comparison.labelFontSize * scaleSecondary),
            target: Math.floor(settings.target.fontSize * scaleSecondary),
            progressPercentage: Math.floor(settings.progress.percentageSize * scaleSecondary),
            status: Math.floor(settings.status.fontSize * scaleSecondary)
        };

        const hideSecondary = settings.responsive?.hideSecondary ?? true;
        const priorities = this.getPriorities();
        const hidden: ResponsiveElementKey[] = [];

        const isHidden = (key: ResponsiveElementKey) => hidden.indexOf(key) !== -1;

        let result: KpiLayout;
        let bestFits = false;
        
        let maxHidden = (hideSecondary && mode !== "normal") ? priorities.length : 0;
        
        for (let i = 0; i <= maxHidden; i++) {
            if (i > 0) {
                hidden.push(priorities[i - 1]);
            }

            result = this.buildLayout(viewport, padding, innerWidth, innerHeight, mode, state, settings, effectiveFontSizes, isHidden, hidden);
            if (result.fits) {
                bestFits = true;
                break;
            }
        }

        return result!;
    }

    private buildLayout(
        viewport: Size,
        padding: number,
        innerWidth: number,
        innerHeight: number,
        mode: ResponsiveMode,
        state: VisualState,
        settings: any,
        effectiveFontSizes: any,
        isHidden: (k: ResponsiveElementKey) => boolean,
        hidden: ResponsiveElementKey[]
    ): KpiLayout {
        const showTitle = settings.title.show && !isHidden("title") && !!state.title;
        const showComparison = settings.comparison.show && !isHidden("comparison") && !!state.comparison;
        const showTarget = settings.target.show && !isHidden("target") && !!state.target;
        const showProgress = settings.progress.show && !isHidden("progress") && !!state.achievement;
        const showStatus = settings.status.show && !!state.calculatedStatusText; // Status is a protected group, though statusCircle can be hidden

        let minGap = mode === "minimum" ? 1 : mode === "compact" ? 3 : 12;
        let maxGap = mode === "minimum" ? 4 : mode === "compact" ? 10 : 36;
        if (!settings.responsive?.autoScale) {
            minGap = 12;
            maxGap = 36;
        }

        const blocks: any[] = [];
        if (showTitle) blocks.push({ key: "title", height: effectiveFontSizes.title, minGapAfter: minGap, maxGapAfter: maxGap, weight: 1 });
        blocks.push({ key: "value", height: effectiveFontSizes.actualValue, minGapAfter: minGap, maxGapAfter: maxGap, weight: 2 });
        if (showComparison) blocks.push({ key: "comparison", height: Math.max(effectiveFontSizes.comparison, settings.comparison.showPeriod && !isHidden("comparisonPeriod") ? effectiveFontSizes.comparisonPeriod : 0), minGapAfter: minGap, maxGapAfter: maxGap, weight: 1 });
        if (showTarget) blocks.push({ key: "target", height: effectiveFontSizes.target, minGapAfter: minGap, maxGapAfter: maxGap, weight: 1 });
        if (showProgress) blocks.push({ key: "progress", height: Math.max(settings.progress.height, settings.progress.showPercentage && !isHidden("progressPercentage") ? effectiveFontSizes.progressPercentage : 0), minGapAfter: minGap, maxGapAfter: maxGap, weight: 1.5 });
        if (showStatus) blocks.push({ key: "status", height: Math.max(effectiveFontSizes.status, settings.status.showCircle && !isHidden("statusCircle") ? settings.status.circleSize : 0), minGapAfter: 0, maxGapAfter: 0, weight: 1 });

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
        let activeBlocks = blocks.slice(0, blocks.length - 1);

        while (remainingExtra > 0.5 && activeBlocks.length > 0) {
            const totalWeight = activeBlocks.reduce((sum, b) => sum + b.weight, 0);
            if (totalWeight <= 0) break;
            
            let distributedAny = false;
            const currentExtra = remainingExtra;
            for (let i = activeBlocks.length - 1; i >= 0; i--) {
                const b = activeBlocks[i];
                const capacity = b.maxGapAfter - activeGaps[b.key];
                
                if (capacity <= 0.01) {
                    activeBlocks.splice(i, 1);
                    continue;
                }
                
                const share = (b.weight / totalWeight) * currentExtra;
                const add = Math.min(share, capacity);
                
                if (add > 0.01) {
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
            responsiveMode: mode,
            hiddenByResponsive: [...hidden],
            effectiveFontSizes,
            fits: true,
            viewport,
            padding,
            contentTop: currentY,
            contentBottom: 0,
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
                    result.title = { x: titleAlign.x, y: blockTop + b.height, width: innerWidth, fontSize: b.height, textAnchor: titleAlign.textAnchor };
                    break;
                case "value":
                    const valAlign = getAlignment(settings.actualValue.alignment);
                    result.value = { x: valAlign.x, y: blockTop + b.height, width: innerWidth, fontSize: b.height, textAnchor: valAlign.textAnchor };
                    break;
                case "comparison":
                    const showPeriod = settings.comparison.showPeriod && !isHidden("comparisonPeriod");
                    if (showPeriod) {
                        result.comparisonPeriod = { x: padding, y: blockTop + Math.max(effectiveFontSizes.comparison, effectiveFontSizes.comparisonPeriod), width: innerWidth / 2, fontSize: effectiveFontSizes.comparisonPeriod, textAnchor: "start" };
                    }
                    const showTrend = settings.comparison.showArrow && !isHidden("trendIcon");
                    if (settings.comparison.showVariation || showTrend) {
                        result.variation = { x: viewport.width - padding, y: blockTop + Math.max(effectiveFontSizes.comparison, effectiveFontSizes.comparisonPeriod), width: innerWidth / (showPeriod ? 2 : 1), fontSize: effectiveFontSizes.comparison, textAnchor: "end" };
                    }
                    break;
                case "target":
                    result.target = { x: padding, y: blockTop + b.height, width: innerWidth, fontSize: b.height, textAnchor: "start" };
                    break;
                case "progress":
                    const trackHeight = settings.progress.height;
                    const showPct = settings.progress.showPercentage && !isHidden("progressPercentage");
                    const maxTrackWidth = innerWidth - (showPct ? 40 : 0);
                    const barLengthPct = settings.progress.barLength;
                    const trackWidth = maxTrackWidth * (barLengthPct / 100);
                    const trackY = blockTop + (b.height - trackHeight) / 2;
                    const track = { x: padding, y: trackY, width: Math.max(0, trackWidth), height: trackHeight };
                    const fillRatio = Math.max(0, Math.min(1, state.achievement?.progressRatio ?? 0));
                    const fill = { x: padding, y: trackY, width: Math.max(0, trackWidth * fillRatio), height: trackHeight };

                    let achievementText = undefined;
                    if (showPct) {
                        achievementText = { x: viewport.width - padding, y: trackY + trackHeight, width: 35, fontSize: effectiveFontSizes.progressPercentage, textAnchor: "end" as const };
                    }

                    const isOverperforming = (state.achievement?.progressRatio ?? 0) > 1;
                    let overperformanceMarker = undefined;
                    if (isOverperforming && settings.progress.showOverachievementMark) {
                        const mThickness = settings.progress.markThickness;
                        overperformanceMarker = { x: padding + trackWidth - (mThickness / 2), y: trackY - 2, width: mThickness, height: trackHeight + 4 };
                    }
                    result.progress = { track, fill, achievementText, isOverperforming, overperformanceMarker };
                    break;
                case "status":
                    const showCirc = settings.status.showCircle && !isHidden("statusCircle");
                    const sRadius = showCirc ? (settings.status.circleSize / 2) : 0;
                    const statusY = blockTop + b.height; 
                    const textWidth = TextUtils.measureTextWidth(state.calculatedStatusText, effectiveFontSizes.status, settings.status.fontFamily);
                    const circleSpace = sRadius > 0 ? (sRadius * 2) + 6 : 0;
                    const totalWidth = circleSpace + textWidth;
                    const startX = (viewport.width - totalWidth) / 2;
                    if (sRadius > 0) {
                        result.statusCircle = { x: startX + sRadius, y: statusY - (effectiveFontSizes.status / 2) + 1, width: sRadius * 2, height: sRadius * 2, radius: sRadius };
                    }
                    result.statusText = { x: startX + circleSpace, y: statusY, width: textWidth, fontSize: effectiveFontSizes.status, textAnchor: "start" };
                    break;
            }

            if (i < blocks.length - 1) {
                currentY += b.height + activeGaps[b.key];
            } else {
                currentY += b.height;
            }
        }

        result.contentBottom = currentY;

        // Validation for fits
        if (naturalContentHeight > innerHeight) {
            // console.log("FITS FALSE AT LINE 273"); result.fits = false;
        }
        
        const checkBounds = (el: any, isText: boolean = true) => {
            if (!el) return;
            if (isNaN(el.x) || isNaN(el.y) || !isFinite(el.x) || !isFinite(el.y)) {
                // console.log("FITS FALSE AT LINE 279"); result.fits = false;
                return;
            }
            // Strict bounding checks
            let elTop = isText ? el.y - (el.fontSize || 0) : el.y;
            let elBottom = isText ? el.y : el.y + (el.height || (el.radius ? el.radius * 2 : 0));
            
            let elLeft = el.x;
            let elRight = el.x;
            if (el.width) {
                if (el.textAnchor === "middle") {
                    elLeft = el.x - (el.width / 2);
                    elRight = el.x + (el.width / 2);
                } else if (el.textAnchor === "end") {
                    elLeft = el.x - el.width;
                    elRight = el.x;
                } else {
                    elRight = el.x + el.width;
                }
            } else if (el.radius) {
                elLeft = el.x - el.radius;
                elRight = el.x + el.radius;
            }

            // Using tolerance for bounds check
            if (elLeft < padding - 0.0 || elRight > viewport.width - padding + 0.0) {
                if (viewport.width === 120 && viewport.height === 100) console.log("FITS FALSE AT LINE 305"); result.fits = false;
            }
            if (elTop < padding - 5.0 || elBottom > viewport.height - padding + 5.0) {
                if (viewport.width === 120 && viewport.height === 100) console.log("FITS FALSE AT LINE 308"); result.fits = false;
            }
        };

        checkBounds(result.title, true);
        checkBounds(result.value, true);
        checkBounds(result.comparisonPeriod, true);
        checkBounds(result.variation, true);
        checkBounds(result.target, true);
        if (result.progress) {
            checkBounds(result.progress.track, false);
            checkBounds(result.progress.fill, false);
            checkBounds(result.progress.achievementText, true);
            checkBounds(result.progress.overperformanceMarker, false);
        }
        checkBounds(result.statusCircle, false);
        checkBounds(result.statusText, true);

        // Strict vertical order check
        let lastY = -Infinity;
        const ensureOrder = (y: number, name: string) => {
            if (y < lastY - 0.5) {
                // console.log("FITS FALSE AT LINE 330"); result.fits = false;
            }
            lastY = y;
        };

        if (result.title) ensureOrder(result.title.y, "title");
        if (result.value) ensureOrder(result.value.y, "value");
        let compY = -Infinity;
        if (result.comparisonPeriod) compY = result.comparisonPeriod.y;
        if (result.variation) compY = Math.max(compY, result.variation.y);
        if (compY > -Infinity) ensureOrder(compY, "comp");
        if (result.target) ensureOrder(result.target.y, "target");
        if (result.progress) ensureOrder(result.progress.track.y, "progress");
        let statusY = -Infinity;
        if (result.statusText) statusY = result.statusText.y;
        if (result.statusCircle) statusY = Math.max(statusY, result.statusCircle.y);
        if (statusY > -Infinity) ensureOrder(statusY, "status");

        
        // --- STRICT FITS VALIDATION ---
        const checkElementBounds = (el: any, isText: boolean = true) => {
            if (!el) return;
            if (isNaN(el.x) || isNaN(el.y) || !isFinite(el.x) || !isFinite(el.y)) {
                console.log("FITS FALSE AT LINE 353"); result.fits = false;
                return;
            }
            let elTop = isText ? el.y - el.fontSize : (el.radius && !el.height ? el.y - el.radius : el.y);
            let elBottom = isText ? el.y + (el.fontSize * 0.2) : (el.height ? el.y + el.height : (el.radius ? el.y + el.radius : el.y));
            let elLeft = el.x;
            let elRight = el.x;
            
            if (el.width) {
                if (el.textAnchor === "middle") {
                    elLeft = el.x - (el.width / 2);
                    elRight = el.x + (el.width / 2);
                } else if (el.textAnchor === "end") {
                    elLeft = el.x - el.width;
                    elRight = el.x;
                } else {
                    elRight = el.x + el.width;
                }
            } else if (el.radius) {
                elLeft = el.x - el.radius;
                elRight = el.x + el.radius;
            }

            if (elLeft < padding || elRight > viewport.width - padding || elTop < padding - 5 || elBottom > viewport.height - padding + 5) {
                result.fits = false;
            }
        };

        if (naturalContentHeight > innerHeight) {
            console.log("FITS FALSE AT LINE 382"); result.fits = false;
        }

        checkElementBounds(result.title, true);
        checkElementBounds(result.value, true);
        checkElementBounds(result.comparisonPeriod, true);
        checkElementBounds(result.variation, true);
        checkElementBounds(result.target, true);
        if (result.progress) {
            checkElementBounds(result.progress.track, false);
            checkElementBounds(result.progress.fill, false);
            checkElementBounds(result.progress.achievementText, true);
            checkElementBounds(result.progress.overperformanceMarker, false);
        }
        checkElementBounds(result.statusCircle, false);
        checkElementBounds(result.statusText, true);

        return result;
    }
}
