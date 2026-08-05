import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import { ContextMenuController } from "../src/interactions/contextMenuController";
import { Visual } from "../src/visual";
import { SvgFactory } from "../src/rendering/svgFactory";
import { KpiData } from "../src/models/kpiData";

describe("ContextMenuController", () => {
    let svgRoot: SVGSVGElement;
    let mockSelectionManager: jest.Mocked<ISelectionManager>;
    let controller: ContextMenuController;
    let onBeforeOpenMock: jest.Mock;

    beforeEach(() => {
        svgRoot = SvgFactory.createElement("svg");
        document.body.appendChild(svgRoot);

        mockSelectionManager = {
            select: jest.fn(),
            clear: jest.fn(),
            getSelectionIds: jest.fn(),
            hasSelection: jest.fn(),
            registerOnSelectCallback: jest.fn(),
            showContextMenu: jest.fn(),
            toggleExpandCollapse: jest.fn()
        };

        onBeforeOpenMock = jest.fn();

        controller = new ContextMenuController(svgRoot, mockSelectionManager, {
            onBeforeOpen: onBeforeOpenMock
        });
    });

    afterEach(() => {
        if (controller) {
            controller.destroy();
        }
        if (svgRoot && svgRoot.parentNode) {
            svgRoot.parentNode.removeChild(svgRoot);
        }
        jest.clearAllMocks();
    });

    // 1. registra contextmenu una sola vez.
    it("1. registra contextmenu una sola vez", () => {
        const addSpy = jest.spyOn(svgRoot, "addEventListener");
        const newController = new ContextMenuController(svgRoot, mockSelectionManager);
        expect(addSpy).toHaveBeenCalledWith("contextmenu", expect.any(Function));
        expect(addSpy).toHaveBeenCalledTimes(1);
        newController.destroy();
    });

    // 2. clic derecho llama showContextMenu una vez.
    it("2. clic derecho llama showContextMenu una vez", () => {
        const event = new MouseEvent("contextmenu", { clientX: 100, clientY: 200 });
        svgRoot.dispatchEvent(event);
        expect(mockSelectionManager.showContextMenu).toHaveBeenCalledTimes(1);
    });

    // 3. pasa un objeto vacío como selección.
    it("3. pasa un objeto vacío como selección", () => {
        const event = new MouseEvent("contextmenu", { clientX: 10, clientY: 20 });
        svgRoot.dispatchEvent(event);
        expect(mockSelectionManager.showContextMenu).toHaveBeenCalledWith({}, expect.anything());
    });

    // 4. usa clientX.
    it("4. usa clientX", () => {
        const event = new MouseEvent("contextmenu", { clientX: 123, clientY: 200 });
        svgRoot.dispatchEvent(event);
        expect(mockSelectionManager.showContextMenu).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ x: 123 }));
    });

    // 5. usa clientY.
    it("5. usa clientY", () => {
        const event = new MouseEvent("contextmenu", { clientX: 100, clientY: 456 });
        svgRoot.dispatchEvent(event);
        expect(mockSelectionManager.showContextMenu).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ y: 456 }));
    });

    // 6. llama preventDefault.
    it("6. llama preventDefault", () => {
        const event = new MouseEvent("contextmenu", { clientX: 100, clientY: 200 });
        const preventSpy = jest.spyOn(event, "preventDefault");
        svgRoot.dispatchEvent(event);
        expect(preventSpy).toHaveBeenCalledTimes(1);
    });

    // 7. no llama select().
    it("7. no llama select()", () => {
        const event = new MouseEvent("contextmenu");
        svgRoot.dispatchEvent(event);
        expect(mockSelectionManager.select).not.toHaveBeenCalled();
    });

    // 8. no llama clear().
    it("8. no llama clear()", () => {
        const event = new MouseEvent("contextmenu");
        svgRoot.dispatchEvent(event);
        expect(mockSelectionManager.clear).not.toHaveBeenCalled();
    });

    // 9. no registra OnSelectCallback.
    it("9. no registra OnSelectCallback", () => {
        const event = new MouseEvent("contextmenu");
        svgRoot.dispatchEvent(event);
        expect(mockSelectionManager.registerOnSelectCallback).not.toHaveBeenCalled();
    });

    // 19. apertura puede ocultar tooltip activo.
    it("19. apertura puede ocultar tooltip activo", () => {
        const event = new MouseEvent("contextmenu");
        svgRoot.dispatchEvent(event);
        expect(onBeforeOpenMock).toHaveBeenCalledTimes(1);
    });

    // 22. destroy elimina listener.
    it("22. destroy elimina listener", () => {
        const removeSpy = jest.spyOn(svgRoot, "removeEventListener");
        controller.destroy();
        expect(removeSpy).toHaveBeenCalledWith("contextmenu", expect.any(Function));
    });

    // 23. después de destroy no llama showContextMenu.
    it("23. después de destroy no llama showContextMenu", () => {
        controller.destroy();
        const event = new MouseEvent("contextmenu");
        svgRoot.dispatchEvent(event);
        expect(mockSelectionManager.showContextMenu).not.toHaveBeenCalled();
    });
});

describe("ContextMenu integration in Visual", () => {
    let element: HTMLElement;
    let mockHost: powerbi.extensibility.visual.IVisualHost;
    let mockSelectionManager: jest.Mocked<ISelectionManager>;
    let visual: Visual;

    beforeEach(() => {
        element = document.createElement("div");
        mockSelectionManager = {
            select: jest.fn(),
            clear: jest.fn(),
            getSelectionIds: jest.fn(),
            hasSelection: jest.fn(),
            registerOnSelectCallback: jest.fn(),
            showContextMenu: jest.fn(),
            toggleExpandCollapse: jest.fn()
        };

        mockHost = {
            createSelectionIdBuilder: jest.fn(),
            createSelectionManager: jest.fn(() => mockSelectionManager),
            colorPalette: { getColor: jest.fn() },
            tooltipService: {
                enabled: () => true,
                show: jest.fn(),
                move: jest.fn(),
                hide: jest.fn()
            },
            eventService: {
                renderingStarted: jest.fn(),
                renderingFinished: jest.fn(),
                renderingFailed: jest.fn()
            },
            createLocalizationManager: jest.fn(() => ({
                getDisplayName: (key: string) => key
            }))
        } as unknown as powerbi.extensibility.visual.IVisualHost;

        visual = new Visual({
            element,
            host: mockHost
        } as any);
    });

    afterEach(() => {
        if (visual) {
            visual.destroy();
        }
    });

    // 10. varios update no duplican listener.
    it("10. varios update no duplican listener", () => {
        const svg = element.querySelector("svg");
        if (!svg) throw new Error("no svg");
        
        const addSpy = jest.spyOn(svg, "addEventListener");
        
        visual.update({
            viewport: { width: 300, height: 200 },
            dataViews: []
        } as any);

        visual.update({
            viewport: { width: 300, height: 200 },
            dataViews: []
        } as any);

        // event is added in constructor, update should not add it
        expect(addSpy).not.toHaveBeenCalled();
    });

    // 11. Resize no duplica listener.
    it("11. Resize no duplica listener", () => {
        const svg = element.querySelector("svg");
        if (!svg) throw new Error("no svg");
        
        const addSpy = jest.spyOn(svg, "addEventListener");
        
        visual.update({
            viewport: { width: 300, height: 200 },
            dataViews: []
        } as any);

        // resize
        visual.update({
            viewport: { width: 400, height: 300 },
            dataViews: []
        } as any);

        expect(addSpy).not.toHaveBeenCalled();
    });

    // 12. filtro no duplica listener.
    it("12. filtro no duplica listener", () => {
        const svg = element.querySelector("svg");
        if (!svg) throw new Error("no svg");
        
        const addSpy = jest.spyOn(svg, "addEventListener");
        
        visual.update({
            viewport: { width: 300, height: 200 },
            type: powerbi.VisualUpdateType.Data,
            dataViews: []
        } as any);

        expect(addSpy).not.toHaveBeenCalled();
    });

    // 13. Normal permite menú.
    it("13. Normal permite menú", () => {
        visual.update({
            viewport: { width: 400, height: 300 },
            dataViews: []
        } as any);
        const svg = element.querySelector("svg");
        svg?.dispatchEvent(new MouseEvent("contextmenu"));
        expect(mockSelectionManager.showContextMenu).toHaveBeenCalled();
    });

    // 14. Compact permite menú.
    it("14. Compact permite menú", () => {
        visual.update({
            viewport: { width: 200, height: 100 },
            dataViews: []
        } as any);
        const svg = element.querySelector("svg");
        svg?.dispatchEvent(new MouseEvent("contextmenu"));
        expect(mockSelectionManager.showContextMenu).toHaveBeenCalled();
    });

    // 15. Minimum permite menú.
    it("15. Minimum permite menú", () => {
        visual.update({
            viewport: { width: 100, height: 50 },
            dataViews: []
        } as any);
        const svg = element.querySelector("svg");
        svg?.dispatchEvent(new MouseEvent("contextmenu"));
        expect(mockSelectionManager.showContextMenu).toHaveBeenCalled();
    });

    // 16. clic sobre title permite menú.
    it("16. clic sobre title permite menú", () => {
        visual.update({
            viewport: { width: 300, height: 200 },
            dataViews: [{
                metadata: { columns: [] },
                single: { value: 100 } // dummy
            }]
        } as any);

        // Add dummy target element to mock title
        const svg = element.querySelector("svg");
        const titleTarget = document.createElementNS("http://www.w3.org/2000/svg", "text");
        svg?.appendChild(titleTarget);
        
        titleTarget.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));
        expect(mockSelectionManager.showContextMenu).toHaveBeenCalled();
    });

    // 17. clic sobre actualValue permite menú.
    it("17. clic sobre actualValue permite menú", () => {
        const svg = element.querySelector("svg");
        const valTarget = document.createElementNS("http://www.w3.org/2000/svg", "text");
        svg?.appendChild(valTarget);
        
        valTarget.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));
        expect(mockSelectionManager.showContextMenu).toHaveBeenCalled();
    });

    // 18. clic sobre fondo permite menú.
    it("18. clic sobre fondo permite menú", () => {
        const svg = element.querySelector("svg");
        const bgTarget = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        svg?.appendChild(bgTarget);
        
        bgTarget.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));
        expect(mockSelectionManager.showContextMenu).toHaveBeenCalled();
    });

    // 20. tooltipSettings.show=false permanece false.
    it("20. tooltipSettings.show=false permanece false", () => {
        const dataView = {
            metadata: {
                columns: [],
                objects: { tooltipSettings: { show: false } }
            }
        };
        visual.update({
            viewport: { width: 300, height: 200 },
            dataViews: [dataView]
        } as any);

        const svg = element.querySelector("svg");
        svg?.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));

        // test that the underlying model remained false
        const currentSettings = (visual as any).formattingSettings;
        expect(currentSettings.tooltipSettings.show.value).toBe(false);
    });

    // 21. abrir menú no modifica FormattingSettings.
    it("21. abrir menú no modifica FormattingSettings", () => {
        visual.update({
            viewport: { width: 300, height: 200 },
            dataViews: []
        } as any);

        const before = JSON.stringify(visual.getFormattingModel());

        const svg = element.querySelector("svg");
        svg?.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));

        const after = JSON.stringify(visual.getFormattingModel());
        expect(before).toBe(after);
    });

    // 24. menú no requiere TooltipModel.
    it("24. menú no requiere TooltipModel", () => {
        const event = new MouseEvent("contextmenu", { bubbles: true });
        const svg = element.querySelector("svg");
        svg?.dispatchEvent(event);
        expect(mockSelectionManager.showContextMenu).toHaveBeenCalled();
        // Didn't throw when TooltipModel was not present because menu doesn't need it
    });

    // 25. visual sin datos puede mostrar menú básico.
    it("25. visual sin datos puede mostrar menú básico", () => {
        visual.update({
            viewport: { width: 300, height: 200 },
            dataViews: []
        } as any);

        const event = new MouseEvent("contextmenu", { bubbles: true });
        const svg = element.querySelector("svg");
        svg?.dispatchEvent(event);
        expect(mockSelectionManager.showContextMenu).toHaveBeenCalled();
    });
});
