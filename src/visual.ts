"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualEventService = powerbi.extensibility.IVisualEventService;

import { VisualFormattingSettingsModel } from "./settings/formattingSettings";
import { DataViewService } from "./services/dataViewService";
import { DataViewReadStatus } from "./models/dataViewStatus";
import { KpiCalculationService } from "./services/kpiCalculationService";
import { NumberFormattingService } from "./services/numberFormattingService";
import { ColorService } from "./services/colorService";
import { StatusService } from "./services/statusService";

import { VisualState, RenderSettings } from "./models/visualState";
import { normalizeRenderSettings } from "./utils/renderSettingsNormalizer";
import { KpiData } from "./models/kpiData";
import { KpiLayout } from "./models/layout";
import { LayoutCalculator } from "./rendering/layoutCalculator";
import { KpiRenderer } from "./rendering/kpiRenderer";
import { LandingPageRenderer } from "./rendering/landingPageRenderer";
import { SVGConstants } from "./constants/svg";
import { SvgFactory } from "./rendering/svgFactory";

// ── Build version stamp (update when packaging) ────────────────────────────
const BUILD_VERSION = "1.0.0.4";

export class Visual implements IVisual {
    private target!: HTMLElement;
    private svgRoot!: SVGElement;
    private formattingSettings!: VisualFormattingSettingsModel;
    private formattingSettingsService!: FormattingSettingsService;
    private events!: IVisualEventService;

    private dataViewService!: DataViewService;
    private kpiCalculationService!: KpiCalculationService;
    private numberFormattingService!: NumberFormattingService;
    private colorService!: ColorService;
    private layoutCalculator!: LayoutCalculator;

    // ── Last-stable-state cache ───────────────────────────────────────────
    // These are only replaced by StableValue / StableBlank updates.
    // TransientIncomplete updates leave them untouched so the SVG is preserved.
    private lastStableData: KpiData | null = null;
    private lastStableState: VisualState | null = null;
    private lastStableLayout: KpiLayout | null = null;

    // Monotonic counter for the structured update log.
    private updateSequence = 0;

    constructor(options: VisualConstructorOptions | undefined) {
        if (!options) return;
        this.target = options.element;
        this.events = options.host.eventService;
        this.formattingSettingsService = new FormattingSettingsService();

        this.dataViewService = new DataViewService();
        this.kpiCalculationService = new KpiCalculationService();
        this.numberFormattingService = new NumberFormattingService();
        this.colorService = new ColorService();
        this.layoutCalculator = new LayoutCalculator();

        // Create root SVG once in the constructor – never recreated.
        this.svgRoot = SvgFactory.createElement("svg");
        this.svgRoot.classList.add(SVGConstants.classes.root);
        this.target.appendChild(this.svgRoot);
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        this.updateSequence++;

        try {
            // ── 0. Update SVG dimensions ────────────────────────────────
            const width = Math.max(0, options.viewport.width);
            const height = Math.max(0, options.viewport.height);
            this.svgRoot.setAttribute("width", String(width));
            this.svgRoot.setAttribute("height", String(height));
            this.svgRoot.setAttribute("viewBox", `0 0 ${width} ${height}`);

            // ── A. Parse the DataView or use last stable state ────────
            const dataViews = options.dataViews;
            const hasDataView = dataViews && dataViews.length > 0;
            let dataView = hasDataView ? dataViews[0] : undefined;
            
            const formattingDataView = dataView ? dataView : { metadata: {} } as powerbi.DataView;
            this.formattingSettings = this.formattingSettingsService
                .populateFormattingSettingsModel(VisualFormattingSettingsModel, formattingDataView);

            let status: DataViewReadStatus;
            let kpiData: KpiData;
            
            if (hasDataView) {
                const parseResult = this.dataViewService.parse(dataView);
                status = parseResult.status;
                kpiData = parseResult.data;
            } else if (this.lastStableData && this.lastStableState) {
                // Resize without DataView, reuse last stable data
                status = DataViewReadStatus.StableValue; // or StableBlank, but both proceed
                kpiData = this.lastStableData;
            } else {
                status = DataViewReadStatus.NoActualValueRole;
                kpiData = { hasActualValueRole: false, actualValue: null, actualValueFormat: "" };
            }

            // ── B. Structured diagnostic log (REMOVE before production) ─
            console.log(JSON.stringify({
                buildVersion:           BUILD_VERSION,
                updateSequence:         this.updateSequence,
                updateType:             options.type,
                dataViewCount:          options.dataViews?.length ?? 0,
                columnCount:            dataView?.metadata?.columns?.length ?? 0,
                rowCount:               dataView?.table?.rows?.length ?? 0,
                actualValueRolePresent: kpiData.hasActualValueRole,
                titleRolePresent:       (dataView?.metadata?.columns ?? [])
                                            .some(c => c.roles?.["title"] === true),
                readStatus:             status,
                parsedActualValue:      kpiData.actualValue,
                parsedTitle:            kpiData.title ?? null,
                hasLastStableState:     this.lastStableState !== null,
                actionTaken:            this.resolveAction(status)
            }));

            // ── C. Route by classification ────────────────────────────
            switch (status) {

                case DataViewReadStatus.NoActualValueRole:
                    // Role genuinely absent – clear stable cache and show landing.
                    this.lastStableData  = null;
                    this.lastStableState = null;
                    this.lastStableLayout = null;
                    KpiRenderer.clear(this.svgRoot);
                    LandingPageRenderer.render(this.svgRoot, options.viewport);
                    this.events.renderingFinished(options);
                    return;

                case DataViewReadStatus.TransientIncomplete:
                    // The actualValue role is registered but PBI hasn't delivered
                    // the query results yet (rows=[]).  Preserve the current SVG.
                    // Do NOT call LandingPageRenderer. Do NOT call KpiRenderer.clear.
                    // Do NOT replace lastStableState.
                    this.events.renderingFinished(options);
                    return;

                case DataViewReadStatus.StableValue:
                case DataViewReadStatus.StableBlank:
                    // Fall through to the full render pipeline below.
                    break;
            }

            // ── D. Full render pipeline (StableValue | StableBlank) ───
            LandingPageRenderer.clear(this.svgRoot);

            // Calculate variation
            const calculatedVariation = this.kpiCalculationService.calculateVariation(
                kpiData.actualValue,
                kpiData.previousValue !== undefined ? kpiData.previousValue : null,
                kpiData.variation     !== undefined ? kpiData.variation     : null
            );

            // Calculate achievement
            const calculatedAchievement = this.kpiCalculationService.calculateAchievement(
                kpiData.actualValue,
                kpiData.target      !== undefined ? kpiData.target      : null,
                kpiData.achievement !== undefined ? kpiData.achievement : null
            );
            const progressRatio = this.kpiCalculationService.getProgressRatio(calculatedAchievement);

            // Build render settings from formatting cards
            const renderSettings: RenderSettings = normalizeRenderSettings(
                this.formattingSettings.generalCard,
                this.formattingSettings.titleCard,
                this.formattingSettings.actualValueCard,
                this.formattingSettings.comparisonCard,
                this.formattingSettings.targetCard,
                this.formattingSettings.progressCard,
                this.formattingSettings.statusCard
            );

            // Status
            const resolvedStatus = StatusService.resolve(
                calculatedAchievement,
                kpiData.status !== undefined ? kpiData.status : null,
                kpiData.statusColor !== undefined ? kpiData.statusColor : null,
                renderSettings.status
            );

            // Trend / variation color
            const trend = this.kpiCalculationService.calculateTrend(calculatedVariation);
            let finalTrendIcon: string | null = null;
            if (kpiData.trendIcon && kpiData.trendIcon.trim() !== "") {
                finalTrendIcon = kpiData.trendIcon.trim();
            } else if (trend !== "unavailable") {
                finalTrendIcon = trend === "up" ? "▲" : (trend === "down" ? "▼" : "■");
            }
            const invertLogic = renderSettings.comparison.invertLogic;
            const isFavorable = this.kpiCalculationService.isVariationFavorable(
                calculatedVariation, invertLogic
            );
            const variationColor = this.colorService.getVariationColor(
                kpiData.variationColor, 
                calculatedVariation, 
                invertLogic,
                renderSettings.comparison.positiveColor, 
                renderSettings.comparison.negativeColor, 
                renderSettings.comparison.neutralColor
            );

            // Format strings
            const actualStr = this.numberFormattingService.format(kpiData.actualValue, {
                formatString:       kpiData.actualValueFormat,
                useModelFormat:     renderSettings.actualValue.useModelFormat,
                displayUnits:       renderSettings.actualValue.displayUnits,
                decimalPlaces:      renderSettings.actualValue.decimalPlaces,
                prefix:             renderSettings.actualValue.prefix,
                suffix:             renderSettings.actualValue.suffix,
                thousandsSeparator: renderSettings.actualValue.thousandsSeparator,
                showDashIfNull:     renderSettings.actualValue.showDashIfNull
            });

            let targetStr = "";
            if (kpiData.target !== null && kpiData.target !== undefined) {
                targetStr = this.numberFormattingService.formatTarget(
                    kpiData.target,
                    kpiData.targetFormat,
                    kpiData.actualValueFormat,
                    renderSettings.target.inheritValueFormat,
                    renderSettings.actualValue,
                    renderSettings.target
                );
            }

            const varStr = this.numberFormattingService.formatPercentage(
                calculatedVariation,
                renderSettings.comparison.percentageDecimals
            );

            const achStr = this.numberFormattingService.formatPercentage(
                calculatedAchievement,
                renderSettings.progress.decimalPlaces
            );

            // Build VisualState
            const state: VisualState = {
                hasData:           true,
                hasActualValueRole: kpiData.hasActualValueRole,
                settings:           renderSettings,
                calculatedVariationColor: variationColor,
                calculatedStatusColor: resolvedStatus.color,
                title:              kpiData.title ? { text: kpiData.title } : undefined,
                actual:             { formattedValue: actualStr },
                comparison: {
                    period:             kpiData.comparisonPeriod || null,
                    formattedVariation: varStr,
                    trend,
                    trendIcon:          finalTrendIcon,
                    isFavorable
                },
                target:      targetStr  ? { formattedValue: targetStr } : undefined,
                achievement: calculatedAchievement !== null ? {
                    formattedValue: achStr,
                    progressRatio
                } : undefined,
                statusCategory: resolvedStatus.category,
                calculatedStatusText: resolvedStatus.text
            };

            const layout = this.layoutCalculator.calculate(options.viewport, state);

            // ── E. Render ─────────────────────────────────────────────
            KpiRenderer.render(this.svgRoot, layout, state);

            this.svgRoot.setAttribute("aria-label", "Executive KPI Card");
            this.svgRoot.setAttribute("role", "figure");

            // ── F. Persist stable state ───────────────────────────────
            this.lastStableData   = kpiData;
            this.lastStableState  = state;
            this.lastStableLayout = layout; // Stored but not reused on resize

            this.events.renderingFinished(options);

        } catch (e) {
            KpiRenderer.clear(this.svgRoot);
            LandingPageRenderer.clear(this.svgRoot);
            this.events.renderingFailed(
                options,
                typeof e === "string" ? e : (e as Error).message
            );
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        this.formattingSettings.populateVisibleProperties();
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    // ── Helper: action label for the diagnostic log ────────────────────────
    private resolveAction(status: DataViewReadStatus): string {
        switch (status) {
            case DataViewReadStatus.NoActualValueRole:   return "showLandingPage";
            case DataViewReadStatus.TransientIncomplete: return "preserveLastStableState";
            case DataViewReadStatus.StableValue:         return "renderStableValue";
            case DataViewReadStatus.StableBlank:         return "renderStableBlank";
        }
    }
}