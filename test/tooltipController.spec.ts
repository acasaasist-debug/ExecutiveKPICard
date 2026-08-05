import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;
import { TooltipController } from "../src/interactions/tooltipController";
import { InteractionTarget, KpiTooltipModel } from "../src/models/interactionModel";
import ITooltipService = powerbi.extensibility.ITooltipService;

describe("TooltipController", () => {
    let tooltipServiceMock: jest.Mocked<ITooltipService>;
    let svgRoot: SVGElement;
    let controller: TooltipController;

    beforeEach(() => {
        tooltipServiceMock = {
            enabled: jest.fn().mockReturnValue(true),
            show: jest.fn(),
            move: jest.fn(),
            hide: jest.fn()
        };

        svgRoot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgRoot.getBoundingClientRect = jest.fn().mockReturnValue({ left: 10, top: 10, width: 100, height: 100 });
        
        controller = new TooltipController(tooltipServiceMock, svgRoot);
    });

    afterEach(() => {
        controller.destroy();
    });

    function createPointerEvent(type: string, targetEl: Element | null, relatedTargetEl?: Element | null): PointerEvent {
        const ev = new Event(type, { bubbles: true, cancelable: true }) as any;
        ev.clientX = 50;
        ev.clientY = 50;
        ev.pointerType = "mouse";
        if (targetEl) {
            Object.defineProperty(ev, "target", { value: targetEl });
        }
        if (relatedTargetEl !== undefined) {
            Object.defineProperty(ev, "relatedTarget", { value: relatedTargetEl });
        }
        return ev;
    }

    it("enabled=false no muestra tooltip", () => {
        tooltipServiceMock.enabled.mockReturnValue(false);
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("data-interaction-target", "card");
        svgRoot.appendChild(g);

        const models = new Map<InteractionTarget, KpiTooltipModel>([
            ["card", { target: "card", items: [{ displayName: "T", value: "V" }], selectionId: null, visible: true }]
        ]);
        controller.updateModels(models);

        const ev = createPointerEvent("pointerover", g);
        svgRoot.dispatchEvent(ev);

        expect(tooltipServiceMock.show).not.toHaveBeenCalled();
    });

    it("pointerover llama show con coordenadas correctas", () => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("data-interaction-target", "actualValue");
        svgRoot.appendChild(g);

        const models = new Map<InteractionTarget, KpiTooltipModel>([
            ["actualValue", { target: "actualValue", items: [{ displayName: "A", value: "B" }], selectionId: null, visible: true }]
        ]);
        controller.updateModels(models);

        const ev = createPointerEvent("pointerover", g);
        svgRoot.dispatchEvent(ev);

        expect(tooltipServiceMock.show).toHaveBeenCalledWith(expect.objectContaining({
            dataItems: [{ displayName: "A", value: "B" }],
            coordinates: [40, 40], // 50 - 10
            isTouchEvent: false
        }));
    });

    it("pointermove llama move solo si hay activeTarget", () => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("data-interaction-target", "card");
        svgRoot.appendChild(g);

        const models = new Map<InteractionTarget, KpiTooltipModel>([
            ["card", { target: "card", items: [{ displayName: "A", value: "1" }], selectionId: null, visible: true }]
        ]);
        controller.updateModels(models);

        // Move sin over no hace nada
        let moveEv = createPointerEvent("pointermove", g);
        svgRoot.dispatchEvent(moveEv);
        expect(tooltipServiceMock.move).not.toHaveBeenCalled();

        // over -> move
        svgRoot.dispatchEvent(createPointerEvent("pointerover", g));
        
        moveEv = createPointerEvent("pointermove", g);
        svgRoot.dispatchEvent(moveEv);
        expect(tooltipServiceMock.move).toHaveBeenCalled();
    });

    it("pointerout real llama hide", () => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("data-interaction-target", "card");
        svgRoot.appendChild(g);

        const models = new Map<InteractionTarget, KpiTooltipModel>([
            ["card", { target: "card", items: [{ displayName: "A", value: "1" }], selectionId: null, visible: true }]
        ]);
        controller.updateModels(models);

        svgRoot.dispatchEvent(createPointerEvent("pointerover", g));
        expect(tooltipServiceMock.show).toHaveBeenCalled();

        // pointerout to something outside the target
        const outEv = createPointerEvent("pointerout", g, svgRoot);
        svgRoot.dispatchEvent(outEv);
        
        expect(tooltipServiceMock.hide).toHaveBeenCalledWith(expect.objectContaining({
            immediately: false
        }));
    });

    it("movimiento entre hijos del mismo target no oculta", () => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("data-interaction-target", "card");
        const rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        const rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        g.appendChild(rect1);
        g.appendChild(rect2);
        svgRoot.appendChild(g);

        const models = new Map<InteractionTarget, KpiTooltipModel>([
            ["card", { target: "card", items: [{ displayName: "A", value: "1" }], selectionId: null, visible: true }]
        ]);
        controller.updateModels(models);

        svgRoot.dispatchEvent(createPointerEvent("pointerover", rect1));
        
        // pointerout from rect1 to rect2 (both inside "card")
        const outEv = createPointerEvent("pointerout", rect1, rect2);
        svgRoot.dispatchEvent(outEv);

        expect(tooltipServiceMock.hide).not.toHaveBeenCalled();
    });

    it("pointercancel oculta inmediatamente", () => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("data-interaction-target", "card");
        svgRoot.appendChild(g);

        const models = new Map<InteractionTarget, KpiTooltipModel>([
            ["card", { target: "card", items: [{ displayName: "A", value: "1" }], selectionId: null, visible: true }]
        ]);
        controller.updateModels(models);

        svgRoot.dispatchEvent(createPointerEvent("pointerover", g));
        
        const cancelEv = createPointerEvent("pointercancel", g);
        svgRoot.dispatchEvent(cancelEv);

        expect(tooltipServiceMock.hide).toHaveBeenCalledWith(expect.objectContaining({
            immediately: true
        }));
    });

    it("updateModels oculta si activeTarget pasa a visible=false", () => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("data-interaction-target", "card");
        svgRoot.appendChild(g);

        let models = new Map<InteractionTarget, KpiTooltipModel>([
            ["card", { target: "card", items: [{ displayName: "A", value: "1" }], selectionId: null, visible: true }]
        ]);
        controller.updateModels(models);

        svgRoot.dispatchEvent(createPointerEvent("pointerover", g));
        expect(tooltipServiceMock.show).toHaveBeenCalled();

        models = new Map<InteractionTarget, KpiTooltipModel>([
            ["card", { target: "card", items: [{ displayName: "A", value: "1" }], selectionId: null, visible: false }]
        ]);
        controller.updateModels(models); // Should trigger hide immediately

        expect(tooltipServiceMock.hide).toHaveBeenCalledWith(expect.objectContaining({
            immediately: true
        }));
    });

    it("updateModels oculta si activeTarget es eliminado", () => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("data-interaction-target", "card");
        svgRoot.appendChild(g);

        let models = new Map<InteractionTarget, KpiTooltipModel>([
            ["card", { target: "card", items: [{ displayName: "A", value: "1" }], selectionId: null, visible: true }]
        ]);
        controller.updateModels(models);

        svgRoot.dispatchEvent(createPointerEvent("pointerover", g));
        
        models = new Map<InteractionTarget, KpiTooltipModel>();
        controller.updateModels(models); // Card target removed

        expect(tooltipServiceMock.hide).toHaveBeenCalledWith(expect.objectContaining({
            immediately: true
        }));
    });

    it("destroy oculta y elimina listeners", () => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("data-interaction-target", "card");
        svgRoot.appendChild(g);

        const models = new Map<InteractionTarget, KpiTooltipModel>([
            ["card", { target: "card", items: [{ displayName: "A", value: "1" }], selectionId: null, visible: true }]
        ]);
        controller.updateModels(models);

        svgRoot.dispatchEvent(createPointerEvent("pointerover", g));
        
        jest.spyOn(svgRoot, "removeEventListener");
        controller.destroy();

        expect(tooltipServiceMock.hide).toHaveBeenCalledWith(expect.objectContaining({
            immediately: true
        }));
        expect(svgRoot.removeEventListener).toHaveBeenCalledWith("pointerover", expect.any(Function));
        expect(svgRoot.removeEventListener).toHaveBeenCalledWith("pointermove", expect.any(Function));
        expect(svgRoot.removeEventListener).toHaveBeenCalledWith("pointerout", expect.any(Function));
        expect(svgRoot.removeEventListener).toHaveBeenCalledWith("pointercancel", expect.any(Function));
    });

    it("no muestra tooltip para target invisible", () => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("data-interaction-target", "card");
        svgRoot.appendChild(g);

        const models = new Map<InteractionTarget, KpiTooltipModel>([
            ["card", { target: "card", items: [{ displayName: "A", value: "1" }], selectionId: null, visible: false }]
        ]);
        controller.updateModels(models);

        svgRoot.dispatchEvent(createPointerEvent("pointerover", g));
        expect(tooltipServiceMock.show).not.toHaveBeenCalled();
    });

    describe("Tooltip settings toggle", () => {
        let g: SVGGElement;
        let models: Map<InteractionTarget, KpiTooltipModel>;

        beforeEach(() => {
            g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("data-interaction-target", "card");
            svgRoot.appendChild(g);

            models = new Map<InteractionTarget, KpiTooltipModel>([
                ["card", { target: "card", items: [{ displayName: "A", value: "1" }], selectionId: null, visible: true }]
            ]);
            controller.updateModels(models);
        });

        it("show=true permite tooltip (por defecto es true)", () => {
            controller.setEnabled(true);
            svgRoot.dispatchEvent(createPointerEvent("pointerover", g));
            expect(tooltipServiceMock.show).toHaveBeenCalled();
        });

        it("show=false impide tooltipService.show()", () => {
            controller.setEnabled(false);
            svgRoot.dispatchEvent(createPointerEvent("pointerover", g));
            expect(tooltipServiceMock.show).not.toHaveBeenCalled();
        });

        it("show=false impide tooltipService.move()", () => {
            controller.setEnabled(false);
            svgRoot.dispatchEvent(createPointerEvent("pointerover", g)); // intentará over, pero lo ignora
            svgRoot.dispatchEvent(createPointerEvent("pointermove", g)); // intentará move, pero lo ignora
            expect(tooltipServiceMock.move).not.toHaveBeenCalled();
        });

        it("cambiar true -> false oculta un tooltip activo", () => {
            controller.setEnabled(true);
            svgRoot.dispatchEvent(createPointerEvent("pointerover", g));
            expect(tooltipServiceMock.show).toHaveBeenCalled();

            controller.setEnabled(false);
            expect(tooltipServiceMock.hide).toHaveBeenCalledWith(expect.objectContaining({
                immediately: true
            }));
        });

        it("setEnabled no registra listeners nuevamente", () => {
            jest.spyOn(svgRoot, "addEventListener");
            controller.setEnabled(false);
            controller.setEnabled(true);
            expect(svgRoot.addEventListener).not.toHaveBeenCalled();
        });

        it("updateModels con show=false oculta un tooltip activo", () => {
            controller.setEnabled(true);
            svgRoot.dispatchEvent(createPointerEvent("pointerover", g));
            expect(tooltipServiceMock.show).toHaveBeenCalled();

            controller.setEnabled(false);
            controller.updateModels(models);
            expect(tooltipServiceMock.hide).toHaveBeenCalledWith(expect.objectContaining({
                immediately: true
            }));
        });
    });
});
