"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualEventService = powerbi.extensibility.IVisualEventService;

import { VisualFormattingSettingsModel } from "./settings/formattingSettings";

export class Visual implements IVisual {
    private target!: HTMLElement;
    private formattingSettings!: VisualFormattingSettingsModel;
    private formattingSettingsService!: FormattingSettingsService;
    private events!: IVisualEventService;

    constructor(options: VisualConstructorOptions | undefined) {
        if (!options) return;
        this.target = options.element;
        this.events = options.host.eventService;
        this.formattingSettingsService = new FormattingSettingsService();
        
        const div = document.createElement("div");
        div.style.padding = "20px";
        div.appendChild(document.createTextNode("Executive KPI Card Initialized"));
        this.target.appendChild(div);
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        
        try {
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews?.[0]);
            
            this.events.renderingFinished(options);
        } catch (e) {
            this.events.renderingFailed(options, typeof e === 'string' ? e : (e as Error).message);
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}