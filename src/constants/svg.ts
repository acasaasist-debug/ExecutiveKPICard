export const SVGConstants = {
    namespaces: {
        svg: "http://www.w3.org/2000/svg"
    },
    classes: {
        root: "executive-kpi-card-svg",
        backgroundGroup: "background-group",
        accentGroup: "accent-group",
        titleGroup: "title-group",
        valueGroup: "value-group",
        comparisonGroup: "comparison-group",
        targetGroup: "target-group",
        progressGroup: "progress-group",
        statusGroup: "status-group",
        focusGroup: "focus-group",
        landingPageGroup: "landing-page-group",
        
        // Element specific classes
        backgroundRect: "bg-rect",
        accentLine: "accent-line",
        titleText: "title-text",
        valueText: "value-text",
        periodText: "period-text",
        variationText: "variation-text",
        variationIcon: "variation-icon",
        targetText: "target-text",
        progressTrack: "progress-track",
        progressFill: "progress-fill",
        overperformanceMarker: "overperformance-marker",
        achievementText: "achievement-text",
        statusCircle: "status-indicator",
        statusText: "status-text",
        
        landingTitle: "landing-title",
        landingSubtitle: "landing-subtitle",
        landingHint: "landing-hint"
    },
    fontSizes: {
        NORMAL: {
            title: 14,
            value: 32,
            period: 12,
            variation: 12,
            target: 12,
            achievement: 12,
            status: 12
        },
        COMPACT: {
            title: 12,
            value: 24,
            period: 10,
            variation: 11,
            target: 10,
            achievement: 10,
            status: 10
        },
        MINIMUM: {
            title: 11,
            value: 18,
            period: 9,
            variation: 9,
            target: 9,
            achievement: 9,
            status: 9
        }
    },
    fontFamilies: {
        primary: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif'
    },
    fontWeights: {
        normal: "400",
        semibold: "600",
        bold: "700"
    }
};
