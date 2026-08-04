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

import { VisualState, Phase5ARenderSettings } from "./models/visualState";
import { KpiData } from "./models/kpiData";
import { KpiLayout } from "./models/layout";
import { LayoutCalculator } from "./rendering/layoutCalculator";
import { KpiRenderer } from "./rendering/kpiRenderer";
import { LandingPageRenderer } from "./rendering/landingPageRenderer";
import { SVGConstants } from "./constants/svg";
import { SvgFactory } from "./rendering/svgFactory";

// ── Build version stamp (update when packaging) ────────────────────────────
const BUILD_VERSION = "1.0.0.2";

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
            // ── A. Parse the DataView ─────────────────────────────────
            const dataView = options.dataViews?.[0];

            // Populate formatting settings safely even when dataView is undefined.
            // If dataView is absent, populateFormattingSettingsModel falls back to
            // defaults, which is the correct behaviour for viewport-only updates.
            this.formattingSettings = this.formattingSettingsService
                .populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView);

            const parseResult = this.dataViewService.parse(dataView);
            const { status, data: kpiData } = parseResult;

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

            // Status
            const statusMode = (kpiData.status && kpiData.status.trim() !== "") || kpiData.statusColor
                ? "data" : "auto";
            const statusResult = this.kpiCalculationService.calculateStatus(
                calculatedAchievement,
                statusMode as "auto" | "data" | "custom",
                1.00,
                0.90,
                kpiData.status
            );
            const finalStatusColor = this.colorService.getStatusColor(
                kpiData.statusColor, statusResult.autoColor
            );

            // Trend / variation color
            const trend = this.kpiCalculationService.calculateTrend(calculatedVariation);
            let finalTrendIcon: string | null = null;
            if (kpiData.trendIcon && kpiData.trendIcon.trim() !== "") {
                finalTrendIcon = kpiData.trendIcon.trim();
            } else if (trend !== "unavailable") {
                finalTrendIcon = trend === "up" ? "▲" : (trend === "down" ? "▼" : "■");
            }
            const invertLogic = false;
            const isFavorable = this.kpiCalculationService.isVariationFavorable(
                calculatedVariation, invertLogic
            );
            const variationColor = this.colorService.getVariationColor(
                kpiData.variationColor, calculatedVariation, invertLogic,
                "#16A34A", "#DC2626", "#6B7280"
            );

            // Build render settings from formatting cards
            const generalCard     = this.formattingSettings.generalCard;
            const titleCard       = this.formattingSettings.titleCard;
            const actualValueCard = this.formattingSettings.actualValueCard;

            const renderSettings: Phase5ARenderSettings = {
                general: {
                    backgroundColor:      generalCard.backgroundColor.value.value,
                    transparency:         generalCard.transparency.value,
                    borderOn:             generalCard.borderOn.value,
                    borderColor:          generalCard.borderColor.value.value,
                    borderThickness:      generalCard.borderThickness.value,
                    cornerRadius:         generalCard.cornerRadius.value,
                    padding:              generalCard.padding.value,
                    topLineOn:            generalCard.topLineOn.value,
                    topLineUseStatusColor: generalCard.topLineUseStatusColor.value,
                    topLineThickness:     generalCard.topLineThickness.value,
                    topLineColor:         generalCard.topLineColor.value.value
                },
                title: {
                    show:        titleCard.show.value,
                    fontFamily:  titleCard.fontFamily.value,
                    fontSize:    titleCard.fontSize.value,
                    bold:        titleCard.bold.value,
                    color:       titleCard.color.value.value,
                    alignment:   titleCard.alignment.value as string,
                    bottomMargin: titleCard.bottomMargin.value
                },
                actualValue: {
                    show:             actualValueCard.show.value,
                    useModelFormat:   actualValueCard.useModelFormat.value,
                    fontFamily:       actualValueCard.fontFamily.value,
                    fontSize:         actualValueCard.fontSize.value,
                    bold:             actualValueCard.bold.value,
                    color:            actualValueCard.color.value.value,
                    alignment:        actualValueCard.alignment.value as string,
                    displayUnits:     actualValueCard.displayUnits.value as number,
                    decimalPlaces:    actualValueCard.decimalPlaces.value,
                    prefix:           actualValueCard.prefix.value,
                    suffix:           actualValueCard.suffix.value,
                    thousandsSeparator: actualValueCard.thousandsSeparator.value,
                    showDashIfNull:   actualValueCard.showDashIfNull.value
                }
            };

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
            const targetStr = kpiData.target !== null && kpiData.target !== undefined
                ? this.numberFormattingService.format(kpiData.target, { formatString: kpiData.targetFormat })
                : "";
            const varStr = calculatedVariation !== null
                ? this.numberFormattingService.format(calculatedVariation, { formatString: "0.0 %" })
                : "";
            const achStr = calculatedAchievement !== null
                ? this.numberFormattingService.format(calculatedAchievement, { formatString: "0.0 %" })
                : "";

            // Build VisualState
            const state: VisualState = {
                hasData:           true,
                hasActualValueRole: kpiData.hasActualValueRole,
                settings:           renderSettings,
                title:              kpiData.title ? { text: kpiData.title } : undefined,
                actual:             { formattedValue: actualStr },
                comparison: calculatedVariation !== null ? {
                    period:             kpiData.comparisonPeriod || null,
                    formattedVariation: varStr,
                    trend,
                    trendIcon:          finalTrendIcon,
                    isFavorable,
                    color:              variationColor
                } : undefined,
                target:      targetStr  ? { formattedValue: targetStr } : undefined,
                achievement: calculatedAchievement !== null ? {
                    formattedValue: achStr,
                    progressRatio
                } : undefined,
                status: {
                    text:  statusResult.text,
                    color: finalStatusColor
                }
            };

            const layout = this.layoutCalculator.calculate(options.viewport, state);

            // ── E. Render ─────────────────────────────────────────────
            KpiRenderer.render(this.svgRoot, layout, state);

            this.svgRoot.setAttribute("aria-label", "Executive KPI Card");
            this.svgRoot.setAttribute("role", "figure");

            // ── F. Persist stable state ───────────────────────────────
            this.lastStableData   = kpiData;
            this.lastStableState  = state;
            this.lastStableLayout = layout;

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