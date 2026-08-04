import { SVGConstants } from "../constants/svg";

export class SvgFactory {
    public static createElement<K extends keyof SVGElementTagNameMap>(tagName: K): SVGElementTagNameMap[K] {
        return document.createElementNS(SVGConstants.namespaces.svg, tagName) as any;
    }

    public static ensureGroup(parent: SVGElement, className: string): SVGGElement {
        let group = parent.querySelector(`g.${className}`) as SVGGElement | null;
        if (!group) {
            group = this.createElement("g");
            group.classList.add(className);
            parent.appendChild(group);
        }
        return group;
    }

    public static clearGroup(group: SVGGElement): void {
        while (group.firstChild) {
            group.removeChild(group.firstChild);
        }
    }

    public static createRect(className: string): SVGRectElement {
        const rect = this.createElement("rect");
        rect.classList.add(className);
        return rect;
    }

    public static createText(className: string): SVGTextElement {
        const text = this.createElement("text");
        text.classList.add(className);
        return text;
    }

    public static createPath(className: string): SVGPathElement {
        const path = this.createElement("path");
        path.classList.add(className);
        return path;
    }

    public static createCircle(className: string): SVGCircleElement {
        const circle = this.createElement("circle");
        circle.classList.add(className);
        return circle;
    }
}
