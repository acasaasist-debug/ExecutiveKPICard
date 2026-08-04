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
import { KpiCalculationService } from "./services/kpiCalculationService";
import { NumberFormattingService } from "./services/numberFormattingService";
import { ColorService } from "./services/colorService";

import { VisualState } from "./models/visualState";
import { LayoutCalculator } from "./rendering/layoutCalculator";
import { KpiRenderer } from "./rendering/kpiRenderer";
import { LandingPageRenderer } from "./rendering/landingPageRenderer";
import { SVGConstants } from "./constants/svg";
import { SvgFactory } from "./rendering/svgFactory";

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

        // Create root SVG
        this.svgRoot = SvgFactory.createElement("svg");
        this.svgRoot.classList.add(SVGConstants.classes.root);
        this.target.appendChild(this.svgRoot);
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        
        try {
            const dataView = options.dataViews?.[0];
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView);
            
            // 4. Parsear DataView
            const kpiData = this.dataViewService.parse(dataView);

            if (kpiData.actualValue === null) {
                // 7. Landing Page
                KpiRenderer.clear(this.svgRoot);
                LandingPageRenderer.render(this.svgRoot, options.viewport);
                this.events.renderingFinished(options);
                return;
            }

            // Hide landing page if it was shown
            LandingPageRenderer.clear(this.svgRoot);

            // 5. Calcular variación
            const calculatedVariation = this.kpiCalculationService.calculateVariation(
                kpiData.actualValue, 
                kpiData.previousValue !== undefined ? kpiData.previousValue : null,
                kpiData.variation !== undefined ? kpiData.variation : null
            );

            // 6. Calcular cumplimiento
            const calculatedAchievement = this.kpiCalculationService.calculateAchievement(
                kpiData.actualValue,
                kpiData.target !== undefined ? kpiData.target : null,
                kpiData.achievement !== undefined ? kpiData.achievement : null
            );
            const progressRatio = this.kpiCalculationService.getProgressRatio(calculatedAchievement);

            // 7. Calcular estado (Texto y Base Color)
            const statusMode = (kpiData.status && kpiData.status.trim() !== "") || kpiData.statusColor ? "data" : "auto";
            
            const statusResult = this.kpiCalculationService.calculateStatus(
                calculatedAchievement,
                statusMode as "auto" | "data" | "custom", 
                1.00, 
                0.90,
                kpiData.status
            );

            // Determinar color de estado final
            const finalStatusColor = this.colorService.getStatusColor(kpiData.statusColor, statusResult.autoColor);

            // Determinar tendencia y lógica de color
            const trend = this.kpiCalculationService.calculateTrend(calculatedVariation);
            let finalTrendIcon: string | null = null;
            if (kpiData.trendIcon && kpiData.trendIcon.trim() !== "") {
                finalTrendIcon = kpiData.trendIcon.trim();
            } else if (trend !== "unavailable") {
                finalTrendIcon = trend === "up" ? "▲" : (trend === "down" ? "▼" : "■");
            }

            const invertLogic = false; // from formatting settings later
            const isFavorable = this.kpiCalculationService.isVariationFavorable(calculatedVariation, invertLogic);
            const variationColor = this.colorService.getVariationColor(kpiData.variationColor, calculatedVariation, invertLogic, "#16A34A", "#DC2626", "#6B7280");

            // Formatear cadenas
            const actualStr = this.numberFormattingService.format(kpiData.actualValue, kpiData.actualValueFormat);
            const targetStr = kpiData.target !== null && kpiData.target !== undefined ? this.numberFormattingService.format(kpiData.target, kpiData.targetFormat) : "";
            const varStr = calculatedVariation !== null ? this.numberFormattingService.format(calculatedVariation, "0.0 %") : "";
            const achStr = calculatedAchievement !== null ? this.numberFormattingService.format(calculatedAchievement, "0.0 %") : "";

            // 8. Construir VisualState
            const state: VisualState = {
                hasData: true,
                title: kpiData.title ? { text: kpiData.title } : undefined,
                actual: {
                    formattedValue: actualStr
                },
                comparison: calculatedVariation !== null ? {
                    period: kpiData.comparisonPeriod || null,
                    formattedVariation: varStr,
                    trend: trend,
                    trendIcon: finalTrendIcon,
                    isFavorable: isFavorable,
                    color: variationColor
                } : undefined,
                target: targetStr ? { formattedValue: targetStr } : undefined,
                achievement: calculatedAchievement !== null ? {
                    formattedValue: achStr,
                    progressRatio: progressRatio
                } : undefined,
                status: {
                    text: statusResult.text,
                    color: finalStatusColor
                }
            };

            // 6. Obtener KpiLayout
            const layout = this.layoutCalculator.calculate(options.viewport, state);

            // 8. KpiRenderer
            KpiRenderer.render(this.svgRoot, layout, state);

            // 9. Accesibilidad básica (opcional en esta fase, el root puede llevar aria-label)
            this.svgRoot.setAttribute("aria-label", "Executive KPI Card");
            this.svgRoot.setAttribute("role", "figure");
            
            this.events.renderingFinished(options);
        } catch (e) {
            KpiRenderer.clear(this.svgRoot);
            LandingPageRenderer.clear(this.svgRoot);
            this.events.renderingFailed(options, typeof e === 'string' ? e : (e as Error).message);
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}