import { SVGConstants } from "../constants/svg";
import { Size } from "../models/layout";
import { SvgFactory } from "./svgFactory";
import { TextUtils } from "../utils/textUtils";

export class LandingPageRenderer {
    public static render(svgRoot: SVGElement, viewport: Size): void {
        const group = SvgFactory.ensureGroup(svgRoot, SVGConstants.classes.landingPageGroup);
        SvgFactory.clearGroup(group);

        const centerX = viewport.width / 2;
        let centerY = viewport.height / 2;

        const titleText = SvgFactory.createText(SVGConstants.classes.landingTitle);
        titleText.setAttribute("x", centerX.toString());
        titleText.setAttribute("y", (centerY - 10).toString());
        titleText.setAttribute("text-anchor", "middle");
        titleText.textContent = "Executive KPI Card";
        group.appendChild(titleText);

        const subtitleText = SvgFactory.createText(SVGConstants.classes.landingSubtitle);
        subtitleText.setAttribute("x", centerX.toString());
        subtitleText.setAttribute("y", (centerY + 15).toString());
        subtitleText.setAttribute("text-anchor", "middle");
        subtitleText.textContent = "Agrega una medida en \"Valor actual\" para comenzar.";
        group.appendChild(subtitleText);

        if (viewport.height > 150) {
            const hintText = SvgFactory.createText(SVGConstants.classes.landingHint);
            hintText.setAttribute("x", centerX.toString());
            hintText.setAttribute("y", (centerY + 40).toString());
            hintText.setAttribute("text-anchor", "middle");
            hintText.textContent = "Campos opcionales: Meta · Variación · Cumplimiento · Estado";
            group.appendChild(hintText);
        }
    }

    public static clear(svgRoot: SVGElement): void {
        const group = svgRoot.querySelector(`g.${SVGConstants.classes.landingPageGroup}`);
        if (group) {
            SvgFactory.clearGroup(group as SVGGElement);
        }
    }
}
