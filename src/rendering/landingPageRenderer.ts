import { SVGConstants } from "../constants/svg";
import { Size } from "../models/layout";
import { SvgFactory } from "./svgFactory";

/** Minimal localize function signature — accepts a key + English fallback. */
export type LocalizeFn = (key: string, fallback: string) => string;

export class LandingPageRenderer {
    public static render(svgRoot: SVGElement, viewport: Size, localize?: LocalizeFn): void {
        const group = SvgFactory.ensureGroup(svgRoot, SVGConstants.classes.landingPageGroup);
        SvgFactory.clearGroup(group);

        const L = localize ?? ((_key: string, fallback: string) => fallback);

        const centerX = viewport.width / 2;
        const centerY = viewport.height / 2;

        const titleText = SvgFactory.createText(SVGConstants.classes.landingTitle);
        titleText.setAttribute("x", centerX.toString());
        titleText.setAttribute("y", (centerY - 10).toString());
        titleText.setAttribute("text-anchor", "middle");
        titleText.textContent = L("Landing_Title", "Executive KPI Card");
        group.appendChild(titleText);

        const subtitleText = SvgFactory.createText(SVGConstants.classes.landingSubtitle);
        subtitleText.setAttribute("x", centerX.toString());
        subtitleText.setAttribute("y", (centerY + 15).toString());
        subtitleText.setAttribute("text-anchor", "middle");
        subtitleText.textContent = L(
            "Landing_Subtitle",
            "Add a measure to \"Actual Value\" to begin."
        );
        group.appendChild(subtitleText);

        if (viewport.height > 150) {
            const hintText = SvgFactory.createText(SVGConstants.classes.landingHint);
            hintText.setAttribute("x", centerX.toString());
            hintText.setAttribute("y", (centerY + 40).toString());
            hintText.setAttribute("text-anchor", "middle");
            hintText.textContent = L(
                "Landing_Hint",
                "Optional fields: Target · Variation · Achievement · Status"
            );
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
