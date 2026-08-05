import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import IPoint = powerbi.extensibility.IPoint;

export interface ContextMenuControllerOptions {
    onBeforeOpen?: () => void;
}

export class ContextMenuController {
    private readonly root: SVGSVGElement;
    private readonly selectionManager: ISelectionManager;
    private readonly options?: ContextMenuControllerOptions;

    constructor(
        root: SVGSVGElement,
        selectionManager: ISelectionManager,
        options?: ContextMenuControllerOptions
    ) {
        this.root = root;
        this.selectionManager = selectionManager;
        this.options = options;

        this.root.addEventListener("contextmenu", this.handleContextMenu);
    }

    private readonly handleContextMenu = (event: MouseEvent): void => {
        event.preventDefault();
        event.stopPropagation();

        if (this.options && this.options.onBeforeOpen) {
            this.options.onBeforeOpen();
        }

        const position: IPoint = {
            x: event.clientX,
            y: event.clientY
        };

        // En fase 6C se usa un objeto vacío para el menú contextual básico
        this.selectionManager.showContextMenu({}, position);
    };

    public destroy(): void {
        this.root.removeEventListener("contextmenu", this.handleContextMenu);
    }
}
