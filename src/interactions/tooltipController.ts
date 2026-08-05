import powerbi from "powerbi-visuals-api";
import ITooltipService = powerbi.extensibility.ITooltipService;
import ISelectionId = powerbi.visuals.ISelectionId;

import { InteractionTarget, KpiTooltipModel } from "../models/interactionModel";

/**
 * TooltipController
 *
 * Registers pointer events ONCE on svgRoot via event delegation.
 * Uses [data-interaction-target] attributes to resolve which model to show.
 * Never re-registers listeners on update(). Never modifies VisualState.
 */
export class TooltipController {
    private readonly tooltipService: ITooltipService;
    private readonly svgRoot: Element;
    private enabledBySettings: boolean = true;

    /** Current tooltip models — updated via updateModels(), never re-bound */
    private models: ReadonlyMap<InteractionTarget, KpiTooltipModel> = new Map();

    /** Currently hovered target (for move/hide tracking) */
    private activeTarget: InteractionTarget | null = null;

    // Bound handler references for removal in destroy()
    private readonly boundPointerOver: (e: PointerEvent) => void;
    private readonly boundPointerMove: (e: PointerEvent) => void;
    private readonly boundPointerOut: (e: PointerEvent) => void;
    private readonly boundPointerCancel: (e: PointerEvent) => void;

    constructor(tooltipService: ITooltipService, svgRoot: Element) {
        this.tooltipService = tooltipService;
        this.svgRoot = svgRoot;

        this.boundPointerOver = this.handlePointerOver.bind(this);
        this.boundPointerMove = this.handlePointerMove.bind(this);
        this.boundPointerOut = this.handlePointerOut.bind(this);
        this.boundPointerCancel = this.handlePointerCancel.bind(this);

        // Register once — these survive update() and resize cycles
        this.svgRoot.addEventListener("pointerover", this.boundPointerOver as EventListener);
        this.svgRoot.addEventListener("pointermove", this.boundPointerMove as EventListener);
        this.svgRoot.addEventListener("pointerout", this.boundPointerOut as EventListener);
        this.svgRoot.addEventListener("pointercancel", this.boundPointerCancel as EventListener);
    }

    /**
     * Called from visual.update() on every stable update.
     * Replaces tooltip content WITHOUT re-registering any listeners.
     */
    public updateModels(models: ReadonlyMap<InteractionTarget, KpiTooltipModel>): void {
        this.models = models;

        if (!this.enabledBySettings) {
            this.hideTooltip(true);
            return;
        }

        // If the active target no longer exists, became invisible, or lost items, hide immediately.
        if (this.activeTarget) {
            const m = this.models.get(this.activeTarget);
            if (!m || !m.visible || m.items.length === 0) {
                this.hideTooltip(true);
            }
        }
    }

    public hide(): void {
        this.tooltipService.hide({
            isTouchEvent: false,
            immediately: true
        });
    }

    /**
     * Remove all listeners and hide any active tooltip.
     * Call from visual.destroy().
     */
    public destroy(): void {
        this.hideTooltip(true);
        this.svgRoot.removeEventListener("pointerover", this.boundPointerOver as EventListener);
        this.svgRoot.removeEventListener("pointermove", this.boundPointerMove as EventListener);
        this.svgRoot.removeEventListener("pointerout", this.boundPointerOut as EventListener);
        this.svgRoot.removeEventListener("pointercancel", this.boundPointerCancel as EventListener);
    }

    /** Set enable/disable status from settings */
    public setEnabled(enabled: boolean): void {
        this.enabledBySettings = enabled;
        if (!enabled) {
            this.hideTooltip(true);
        }
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private resolveTarget(event: PointerEvent): InteractionTarget | null {
        const el = (event.target as Element | null)?.closest?.("[data-interaction-target]");
        if (!el) return null;
        const attr = el.getAttribute("data-interaction-target");
        if (!attr) return null;
        return attr as InteractionTarget;
    }

    private getCoordinates(event: PointerEvent): number[] {
        const rect = this.svgRoot.getBoundingClientRect?.();
        if (rect) {
            return [event.clientX - rect.left, event.clientY - rect.top];
        }
        return [event.clientX, event.clientY];
    }

    private getIdentities(model: KpiTooltipModel): ISelectionId[] {
        return model.selectionId ? [model.selectionId] : [];
    }

    private handlePointerOver(event: PointerEvent): void {
        if (!this.enabledBySettings || !this.tooltipService.enabled()) return;

        const target = this.resolveTarget(event);
        if (!target) return;

        const model = this.models.get(target);
        if (!model || !model.visible || model.items.length === 0) return;

        this.activeTarget = target;
        this.tooltipService.show({
            dataItems: model.items,
            identities: this.getIdentities(model),
            coordinates: this.getCoordinates(event),
            isTouchEvent: event.pointerType === "touch"
        });
    }

    private handlePointerMove(event: PointerEvent): void {
        if (!this.enabledBySettings) {
            this.hideTooltip(true);
            return;
        }
        if (!this.tooltipService.enabled() || !this.activeTarget) return;

        const model = this.models.get(this.activeTarget);
        // Ensure it's still valid
        if (!model || !model.visible || model.items.length === 0) return;

        this.tooltipService.move({
            dataItems: model.items,
            identities: this.getIdentities(model),
            coordinates: this.getCoordinates(event),
            isTouchEvent: event.pointerType === "touch"
        });
    }

    private handlePointerOut(event: PointerEvent): void {
        // If relatedTarget is still within the same interactive element, do not hide.
        const currentTargetElement = (event.target as Element | null)?.closest?.("[data-interaction-target]");
        const relatedTargetElement = (event.relatedTarget as Element | null)?.closest?.("[data-interaction-target]");

        if (currentTargetElement && relatedTargetElement && currentTargetElement === relatedTargetElement) {
            return;
        }

        this.hideTooltip(false);
    }

    private handlePointerCancel(event: PointerEvent): void {
        this.hideTooltip(true);
    }

    private hideTooltip(immediately: boolean): void {
        if (this.activeTarget === null) return;
        this.activeTarget = null;
        try {
            this.tooltipService.hide({ isTouchEvent: false, immediately });
        } catch {
            // Swallow errors during destroy when host may already be gone
        }
    }
}
