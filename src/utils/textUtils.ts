export class TextUtils {
    private static canvas: HTMLCanvasElement;
    private static context: CanvasRenderingContext2D | null;

    private static getContext(): CanvasRenderingContext2D {
        if (!this.canvas) {
            this.canvas = document.createElement("canvas");
            this.context = this.canvas.getContext("2d");
        }
        if (!this.context) {
            throw new Error("Unable to create canvas context");
        }
        return this.context;
    }

    public static measureTextWidth(text: string, fontSize: number, fontFamily: string, fontWeight: string = "normal"): number {
        if (!text) return 0;
        const context = this.getContext();
        context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        return context.measureText(text).width;
    }

    public static truncateText(text: string, maxWidth: number, fontSize: number, fontFamily: string, fontWeight: string = "normal"): string {
        if (!text || maxWidth <= 0) return "";
        
        const currentWidth = this.measureTextWidth(text, fontSize, fontFamily, fontWeight);
        if (currentWidth <= maxWidth) {
            return text;
        }

        const ellipsis = "...";
        const ellipsisWidth = this.measureTextWidth(ellipsis, fontSize, fontFamily, fontWeight);
        
        if (maxWidth <= ellipsisWidth) {
            return ""; // Not enough space even for ellipsis
        }

        let truncated = text;
        let width = currentWidth;
        let length = text.length;

        // Binary search for exact truncation point could be faster, but for short strings this is safe and reliable.
        while (width + ellipsisWidth > maxWidth && length > 0) {
            length--;
            truncated = text.substring(0, length);
            width = this.measureTextWidth(truncated, fontSize, fontFamily, fontWeight);
        }

        return truncated + ellipsis;
    }

    public static fitFontSize(text: string, maxWidth: number, preferredSize: number, minSize: number, fontFamily: string, fontWeight: string = "normal"): number {
        if (!text || maxWidth <= 0) return minSize;

        let currentSize = preferredSize;
        while (currentSize > minSize) {
            const width = this.measureTextWidth(text, currentSize, fontFamily, fontWeight);
            if (width <= maxWidth) {
                return currentSize;
            }
            currentSize--;
        }
        
        return Math.max(0, currentSize);
    }

    public static sanitizeSvgText(text: string): string {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
