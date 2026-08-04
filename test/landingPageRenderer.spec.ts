/**
 * @jest-environment jsdom
 */

import { LandingPageRenderer } from "../src/rendering/landingPageRenderer";
import { SVGConstants } from "../src/constants/svg";
import { SvgFactory } from "../src/rendering/svgFactory";

describe("LandingPageRenderer", () => {
    let svgRoot: SVGElement;

    beforeEach(() => {
        svgRoot = SvgFactory.createElement("svg");
        document.body.appendChild(svgRoot);
    });

    afterEach(() => {
        document.body.removeChild(svgRoot);
    });

    it("renders landing page elements safely without innerHTML", () => {
        LandingPageRenderer.render(svgRoot, { width: 300, height: 220 });

        const group = svgRoot.querySelector(`g.${SVGConstants.classes.landingPageGroup}`);
        expect(group).not.toBeNull();
        
        const title = group?.querySelector(`text.${SVGConstants.classes.landingTitle}`);
        expect(title?.textContent).toBe("Executive KPI Card");

        const subtitle = group?.querySelector(`text.${SVGConstants.classes.landingSubtitle}`);
        expect(subtitle?.textContent).toContain("Valor actual");
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
