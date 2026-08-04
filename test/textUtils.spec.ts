/**
 * @jest-environment jsdom
 */

import { TextUtils } from "../src/utils/textUtils";

describe("TextUtils", () => {
    beforeEach(() => {
        // Mock canvas context
        const mockContext = {
            measureText: jest.fn().mockImplementation((text: string) => {
                // Mock width as 10 pixels per character for simplicity in testing
                return { width: text.length * 10 };
            }),
            font: ""
        };
        
        HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext) as any;
    });

    describe("measureTextWidth", () => {
        it("returns 0 for empty text", () => {
            expect(TextUtils.measureTextWidth("", 12, "Arial")).toBe(0);
        });

        it("measures text length properly", () => {
            // "Hello" is 5 chars => 50px
            expect(TextUtils.measureTextWidth("Hello", 12, "Arial")).toBe(50);
        });
    });

    describe("truncateText", () => {
        it("returns original text if it fits", () => {
            // 5 chars = 50px. Max width 100.
            expect(TextUtils.truncateText("Hello", 100, 12, "Arial")).toBe("Hello");
        });

        it("truncates text and adds ellipsis if it exceeds max width", () => {
            // "Hello World" is 11 chars => 110px. 
            // Max width 80.
            // Ellipsis "..." is 3 chars => 30px.
            // Available for text: 80 - 30 = 50px (5 chars).
            // So it should keep "Hello" and add "..." -> "Hello..."
            expect(TextUtils.truncateText("Hello World", 80, 12, "Arial")).toBe("Hello...");
        });

        it("returns empty string if max width cannot even fit ellipsis", () => {
            // max width 20, ellipsis is 30.
            expect(TextUtils.truncateText("Hello", 20, 12, "Arial")).toBe("");
        });
    });

    describe("fitFontSize", () => {
        it("keeps preferred size if it fits", () => {
            // "Hello" = 50px at any font size since our mock doesn't scale by fontSize.
            // But wait, the fitFontSize method reduces fontSize until measureTextWidth <= maxWidth.
            // In a real canvas, measureTextWidth changes when context.font changes.
            // Since our mock is naive, we'll just test the loop logic. 
            // Wait, if measureTextWidth ALWAYS returns 50, then if maxWidth is 40, it will loop until minSize!
            expect(TextUtils.fitFontSize("Hello", 100, 20, 10, "Arial")).toBe(20);
            expect(TextUtils.fitFontSize("Hello", 40, 20, 10, "Arial")).toBe(10);
        });
    });

    describe("sanitizeSvgText", () => {
        it("escapes malicious characters", () => {
            const input = "<script>alert('xss')</script> & \"value\"";
            const expected = "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt; &amp; &quot;value&quot;";
            expect(TextUtils.sanitizeSvgText(input)).toBe(expected);
        });
        
        it("handles empty input", () => {
            expect(TextUtils.sanitizeSvgText("")).toBe("");
        });
    });
});
