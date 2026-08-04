import { Size } from "./layout";

export interface RenderingOptions {
    viewport: Size;
    isResponsive: boolean; // Future expansion to disable responsive scaling if user requests it via formatting panel
    // Add additional formatting panel properties here if needed later
}
