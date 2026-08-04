/**
 * Explicit classification of each DataView update received by the visual.
 *
 * NoActualValueRole   – The actualValue role is absent from metadata.
 *                       Show the landing page and clear stable state.
 *
 * StableValue         – The actualValue role exists, rows are present, and
 *                       the value is a finite number. Render and save as
 *                       last stable state.
 *
 * StableBlank         – The actualValue role exists, a full row is present,
 *                       but the value is null/BLANK. Render the dash and
 *                       save as last stable state.
 *
 * TransientIncomplete – The actualValue role exists in metadata but rows
 *                       are not yet available (e.g. Power BI is still
 *                       merging a newly added role). Preserve the previous
 *                       stable render; do NOT clear SVG groups.
 */
export enum DataViewReadStatus {
    NoActualValueRole = "NoActualValueRole",
    StableValue = "StableValue",
    StableBlank = "StableBlank",
    TransientIncomplete = "TransientIncomplete"
}
