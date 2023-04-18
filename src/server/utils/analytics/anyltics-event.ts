import { analytics } from "../analytics"

export class AnalyticsEvent {

    static isAnalyticEnabled(): boolean {
        return !(process.env.OPT_OUT_ANALYTICS === "true")
    }

    static reportProcessingFinished() {
        if (this.isAnalyticEnabled()) {
            analytics.track("reportProcessingFinished", {
                // eslint-disable-next-line camelcase
                distinct_id: process.env.ANALYTICS_IDENTIFIER,
            })
        }
    }

    static reportLabelCount(labelCount) {
        if (this.isAnalyticEnabled()) {
            analytics.track("reportInformation", {
                // eslint-disable-next-line camelcase
                distinct_id: process.env.ANALYTICS_IDENTIFIER,
                labelCount,
            })
        }
    }
}
