import { SVGConstants } from "../constants/svg";
import { VisualDefaults } from "../constants/defaults";
import { KpiLayout, LayoutMode } from "../models/layout";
import { VisualState } from "../models/visualState";
import { SvgFactory } from "./svgFactory";
import { TextUtils } from "../utils/textUtils";

export class KpiRenderer {
    public static render(svgRoot: SVGElement, layout: KpiLayout, state: VisualState): void {
        this.renderBackground(svgRoot, layout, state);
        this.renderTitle(svgRoot, layout, state);
        this.renderValue(svgRoot, layout, state);
        this.renderComparison(svgRoot, layout, state);
        this.renderTarget(svgRoot, layout, state);
        this.renderProgress(svgRoot, layout, state);
        this.renderStatus(svgRoot, layout, state);
    }

    public static clear(svgRoot: SVGElement): void {
        const classNames = [
            SVGConstants.classes.backgroundGroup,
            SVGConstants.classes.accentGroup,
            SVGConstants.classes.titleGroup,
            SVGConstants.classes.valueGroup,
            SVGConstants.classes.comparisonGroup,
            SVGConstants.classes.targetGroup,
            SVGConstants.classes.progressGroup,
            SVGConstants.classes.statusGroup,
            SVGConstants.classes.focusGroup
        ];
        
        classNames.forEach(className => {
            const group = svgRoot.querySelector(`g.${className}`);
            if (group) {
                SvgFactory.clearGroup(group as SVGGElement);
            }
        });
    }

    private static renderBackground(svgRoot: SVGElement, layout: KpiLayout, state: VisualState): void {
        const bgGroup = SvgFactory.ensureGroup(svgRoot, SVGConstants.classes.backgroundGroup);
        SvgFactory.clearGroup(bgGroup);
        
        const generalCard = state.settings.general;
        const cornerRadius = generalCard.cornerRadius;
        const backgroundColor = generalCard.backgroundColor;
        const transparency = generalCard.transparency;
        const opacity = Math.max(0, Math.min(1, 1 - transparency / 100));
        
        const borderOn = generalCard.borderOn;
        const borderColor = generalCard.borderColor;
        const borderThickness = generalCard.borderThickness;

        const rect = SvgFactory.createRect(SVGConstants.classes.backgroundRect);
        rect.setAttribute("x", "0");
        rect.setAttribute("y", "0");
        rect.setAttribute("width", layout.viewport.width.toString());
        rect.setAttribute("height", layout.viewport.height.toString());
        rect.setAttribute("rx", cornerRadius.toString());
        rect.setAttribute("ry", cornerRadius.toString());
        
        rect.style.fill = backgroundColor;
        rect.style.fillOpacity = opacity.toString();
        
        if (borderOn) {
            rect.style.stroke = borderColor;
            rect.style.strokeWidth = borderThickness.toString();
        } else {
            rect.style.stroke = "none";
        }
        
        bgGroup.appendChild(rect);

        // Accent line at the top
        const accentGroup = SvgFactory.ensureGroup(svgRoot, SVGConstants.classes.accentGroup);
        SvgFactory.clearGroup(accentGroup);
        
        const topLineOn = generalCard.topLineOn;
        
        if (topLineOn) {
            const topLineUseStatusColor = generalCard.topLineUseStatusColor;
            const customTopLineColor = generalCard.topLineColor;
            const lineColor = topLineUseStatusColor && state.status ? state.status.color : customTopLineColor;
            
            const w = layout.viewport.width;
            const h = layout.accent.height;
            const r = cornerRadius;
            
            const pathData = `M 0,${r} ` + 
                             `A ${r},${r} 0 0,1 ${r},0 ` + 
                             `L ${w - r},0 ` + 
                             `A ${r},${r} 0 0,1 ${w},${r} ` + 
                             `L ${w},${h} ` + 
                             `L 0,${h} Z`;
                             
            const accentPath = SvgFactory.createPath(SVGConstants.classes.accentLine);
            accentPath.setAttribute("d", pathData);
            accentPath.style.fill = lineColor;
            accentGroup.appendChild(accentPath);
        }
    }

    private static renderTitle(svgRoot: SVGElement, layout: KpiLayout, state: VisualState): void {
        const group = SvgFactory.ensureGroup(svgRoot, SVGConstants.classes.titleGroup);
        SvgFactory.clearGroup(group);

        if (!layout.showTitle || !layout.title || !state.title) return;

        const titleCard = state.settings.title;
        const fontFamily = titleCard.fontFamily;
        const fontWeight = titleCard.bold ? SVGConstants.fontWeights.bold : SVGConstants.fontWeights.normal;
        const fontColor = titleCard.color;

        const text = SvgFactory.createText(SVGConstants.classes.titleText);
        text.setAttribute("x", layout.title.x.toString());
        text.setAttribute("y", layout.title.y.toString());
        text.setAttribute("text-anchor", layout.title.textAnchor || "start");
        
        const fontSize = layout.title.fontSize || 14;
        
        const truncated = TextUtils.truncateText(state.title.text, layout.title.width || layout.viewport.width, fontSize, fontFamily, fontWeight);
        text.textContent = truncated;
        
        text.style.fontSize = `${fontSize}px`;
        text.style.fontFamily = fontFamily;
        text.style.fontWeight = fontWeight.toString();
        text.style.fill = fontColor;
        
        group.appendChild(text);
    }

    private static renderValue(svgRoot: SVGElement, layout: KpiLayout, state: VisualState): void {
        const group = SvgFactory.ensureGroup(svgRoot, SVGConstants.classes.valueGroup);
        SvgFactory.clearGroup(group);

        if (!layout.value || !state.actual.formattedValue) return;

        const actualValueCard = state.settings.actualValue;
        const fontFamily = actualValueCard.fontFamily;
        const fontWeight = actualValueCard.bold ? SVGConstants.fontWeights.bold : SVGConstants.fontWeights.normal;
        const fontColor = actualValueCard.color;

        const text = SvgFactory.createText(SVGConstants.classes.valueText);
        text.setAttribute("x", layout.value.x.toString());
        text.setAttribute("y", layout.value.y.toString());
        text.setAttribute("text-anchor", layout.value.textAnchor || "start");
        
        let fontSize = layout.value.fontSize || 32;
        const valueStr = state.actual.formattedValue;

        // Auto-scale font size if needed
        const maxWidth = layout.value.width || layout.viewport.width;
        fontSize = TextUtils.fitFontSize(valueStr, maxWidth, fontSize, 12, fontFamily, fontWeight);

        text.style.fontSize = `${fontSize}px`;
        text.style.fontFamily = fontFamily;
        text.style.fontWeight = fontWeight.toString();
        text.style.fill = fontColor;
        text.textContent = valueStr;
        
        group.appendChild(text);
    }

    private static renderComparison(svgRoot: SVGElement, layout: KpiLayout, state: VisualState): void {
        const group = SvgFactory.ensureGroup(svgRoot, SVGConstants.classes.comparisonGroup);
        SvgFactory.clearGroup(group);

        if (!layout.showComparison || !layout.comparisonPeriod || !layout.variation || !state.comparison) return;

        // Period
        const periodText = SvgFactory.createText(SVGConstants.classes.periodText);
        periodText.setAttribute("x", layout.comparisonPeriod.x.toString());
        periodText.setAttribute("y", layout.comparisonPeriod.y.toString());
        periodText.setAttribute("text-anchor", layout.comparisonPeriod.textAnchor || "start");
        periodText.style.fontSize = `${layout.comparisonPeriod.fontSize}px`;
        
        const truncatedPeriod = TextUtils.truncateText(state.comparison.period || "", layout.comparisonPeriod.width || 50, layout.comparisonPeriod.fontSize || 12, SVGConstants.fontFamilies.primary);
        periodText.textContent = truncatedPeriod;
        group.appendChild(periodText);

        // Variation
        const varGroup = SvgFactory.createElement("g");
        const variationStr = state.comparison.formattedVariation || "";
        
        const varText = SvgFactory.createText(SVGConstants.classes.variationText);
        varText.setAttribute("x", layout.variation.x.toString());
        varText.setAttribute("y", layout.variation.y.toString());
        varText.setAttribute("text-anchor", layout.variation.textAnchor || "end");
        varText.style.fontSize = `${layout.variation.fontSize}px`;
        varText.textContent = variationStr;
        
        if (state.comparison.color) {
            varText.style.fill = state.comparison.color;
        }

        varGroup.appendChild(varText);
        
        // Icon (trend)
        if (state.comparison.trendIcon) {
            const varTextWidth = TextUtils.measureTextWidth(variationStr, layout.variation.fontSize || 12, SVGConstants.fontFamilies.primary, SVGConstants.fontWeights.semibold);
            
            const iconX = layout.variation.x - varTextWidth - 8; 
            const iconY = layout.variation.y; 
            
            const iconText = SvgFactory.createText(SVGConstants.classes.variationIcon);
            iconText.setAttribute("x", iconX.toString());
            iconText.setAttribute("y", iconY.toString());
            iconText.setAttribute("text-anchor", "end");
            iconText.style.fontSize = `${layout.variation.fontSize || 12}px`;
            iconText.textContent = state.comparison.trendIcon;
            
            if (state.comparison.color) {
                iconText.style.fill = state.comparison.color;
            }
            varGroup.appendChild(iconText);
        }

        group.appendChild(varGroup);
    }

    private static renderTarget(svgRoot: SVGElement, layout: KpiLayout, state: VisualState): void {
        const group = SvgFactory.ensureGroup(svgRoot, SVGConstants.classes.targetGroup);
        SvgFactory.clearGroup(group);

        if (!layout.showTarget || !layout.target || !state.target) return;

        const text = SvgFactory.createText(SVGConstants.classes.targetText);
        text.setAttribute("x", layout.target.x.toString());
        text.setAttribute("y", layout.target.y.toString());
        text.setAttribute("text-anchor", layout.target.textAnchor || "start");
        text.style.fontSize = `${layout.target.fontSize}px`;
        
        const targetStr = `Meta: ${state.target.formattedValue}`;
        const truncated = TextUtils.truncateText(targetStr, layout.target.width || layout.viewport.width, layout.target.fontSize || 12, SVGConstants.fontFamilies.primary);
        text.textContent = truncated;
        
        group.appendChild(text);
    }

    private static renderProgress(svgRoot: SVGElement, layout: KpiLayout, state: VisualState): void {
        const group = SvgFactory.ensureGroup(svgRoot, SVGConstants.classes.progressGroup);
        SvgFactory.clearGroup(group);

        if (!layout.showProgress || !layout.progress || !state.achievement) return;

        // Track
        const track = SvgFactory.createRect(SVGConstants.classes.progressTrack);
        track.setAttribute("x", layout.progress.track.x.toString());
        track.setAttribute("y", layout.progress.track.y.toString());
        track.setAttribute("width", layout.progress.track.width.toString());
        track.setAttribute("height", layout.progress.track.height.toString());
        track.setAttribute("rx", (layout.progress.track.height / 2).toString());
        track.setAttribute("ry", (layout.progress.track.height / 2).toString());
        group.appendChild(track);

        // Fill
        if (layout.progress.fill.width > 0) {
            const fill = SvgFactory.createRect(SVGConstants.classes.progressFill);
            fill.setAttribute("x", layout.progress.fill.x.toString());
            fill.setAttribute("y", layout.progress.fill.y.toString());
            fill.setAttribute("width", layout.progress.fill.width.toString());
            fill.setAttribute("height", layout.progress.fill.height.toString());
            fill.setAttribute("rx", (layout.progress.fill.height / 2).toString());
            fill.setAttribute("ry", (layout.progress.fill.height / 2).toString());
            if (state.status && state.status.color) {
                fill.style.fill = state.status.color;
            }
            group.appendChild(fill);
        }

        // Overperformance marker
        if (layout.progress.isOverperforming && layout.progress.overperformanceMarker) {
            const marker = SvgFactory.createRect(SVGConstants.classes.overperformanceMarker);
            marker.setAttribute("x", layout.progress.overperformanceMarker.x.toString());
            marker.setAttribute("y", layout.progress.overperformanceMarker.y.toString());
            marker.setAttribute("width", layout.progress.overperformanceMarker.width.toString());
            marker.setAttribute("height", layout.progress.overperformanceMarker.height.toString());
            if (state.status && state.status.color) {
                marker.style.fill = state.status.color;
            }
            group.appendChild(marker);
        }

        // Achievement Text
        const text = SvgFactory.createText(SVGConstants.classes.achievementText);
        text.setAttribute("x", layout.progress.achievementText.x.toString());
        text.setAttribute("y", layout.progress.achievementText.y.toString());
        text.setAttribute("text-anchor", layout.progress.achievementText.textAnchor || "end");
        text.style.fontSize = `${layout.progress.achievementText.fontSize}px`;
        text.textContent = state.achievement.formattedValue;
        
        group.appendChild(text);
    }

    private static renderStatus(svgRoot: SVGElement, layout: KpiLayout, state: VisualState): void {
        const group = SvgFactory.ensureGroup(svgRoot, SVGConstants.classes.statusGroup);
        SvgFactory.clearGroup(group);

        if (!layout.showStatus || !layout.statusIndicator || !layout.statusText || !state.status) return;

        // Indicator
        const circle = SvgFactory.createCircle(SVGConstants.classes.statusIndicator);
        circle.setAttribute("cx", layout.statusIndicator.x.toString());
        circle.setAttribute("cy", layout.statusIndicator.y.toString());
        circle.setAttribute("r", layout.statusIndicator.radius.toString());
        if (state.status.color) {
            circle.style.fill = state.status.color;
        }
        group.appendChild(circle);

        // Text
        const text = SvgFactory.createText(SVGConstants.classes.statusText);
        text.setAttribute("x", layout.statusText.x.toString());
        text.setAttribute("y", layout.statusText.y.toString());
        text.setAttribute("text-anchor", layout.statusText.textAnchor || "start");
        text.style.fontSize = `${layout.statusText.fontSize}px`;
        
        const truncated = TextUtils.truncateText(state.status.text, layout.statusText.width || 100, layout.statusText.fontSize || 12, SVGConstants.fontFamilies.primary);
        text.textContent = truncated;
        if (state.status.color) {
            text.style.fill = state.status.color;
        }

        group.appendChild(text);
    }
}
