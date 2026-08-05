/**
 * @jest-environment jsdom
 */

import { LandingPageRenderer, LocalizeFn } from "../src/rendering/landingPageRenderer";
import { SVGConstants } from "../src/constants/svg";
import { SvgFactory } from "../src/rendering/svgFactory";

const esLocalize: LocalizeFn = (key, fallback) => {
    const map: Record<string, string> = {
        "Landing_Title":    "Executive KPI Card",
        "Landing_Subtitle": "Agrega una medida en \"Valor actual\" para comenzar.",
        "Landing_Hint":     "Campos opcionales: Meta · Variación · Cumplimiento · Estado",
    };
    return map[key] ?? fallback;
};

describe("LandingPageRenderer", () => {
    let svgRoot: SVGElement;

    beforeEach(() => {
        svgRoot = SvgFactory.createElement("svg");
        document.body.appendChild(svgRoot);
    });

    afterEach(() => {
        document.body.removeChild(svgRoot);
    });

    it("renders landing page elements safely without innerHTML (English fallback)", () => {
        LandingPageRenderer.render(svgRoot, { width: 300, height: 220 });

        const group = svgRoot.querySelector(`g.${SVGConstants.classes.landingPageGroup}`);
        expect(group).not.toBeNull();
        
        const title = group?.querySelector(`text.${SVGConstants.classes.landingTitle}`);
        expect(title?.textContent).toBe("Executive KPI Card");

        const subtitle = group?.querySelector(`text.${SVGConstants.classes.landingSubtitle}`);
        expect(subtitle?.textContent).toContain("Actual Value");
    });

    it("renders landing page elements with es-ES localize fn", () => {
        LandingPageRenderer.render(svgRoot, { width: 300, height: 220 }, esLocalize);

        const group = svgRoot.querySelector(`g.${SVGConstants.classes.landingPageGroup}`);
        expect(group).not.toBeNull();
        
        const title = group?.querySelector(`text.${SVGConstants.classes.landingTitle}`);
        expect(title?.textContent).toBe("Executive KPI Card");

        const subtitle = group?.querySelector(`text.${SVGConstants.classes.landingSubtitle}`);
        expect(subtitle?.textContent).toContain("Valor actual");

        const hint = group?.querySelector(`text.${SVGConstants.classes.landingHint}`);
        expect(hint?.textContent).toContain("Meta");
    });

    it("clears landing page safely", () => {
        LandingPageRenderer.render(svgRoot, { width: 300, height: 220 });
        LandingPageRenderer.clear(svgRoot);

        const group = svgRoot.querySelector(`g.${SVGConstants.classes.landingPageGroup}`);
        expect(group?.children.length).toBe(0);
    });

    it("hides hint on small viewports", () => {
        LandingPageRenderer.render(svgRoot, { width: 300, height: 100 });

        const group = svgRoot.querySelector(`g.${SVGConstants.classes.landingPageGroup}`);
        const hint = group?.querySelector(`text.${SVGConstants.classes.landingHint}`);
        
        expect(hint).toBeNull();
    });
});
