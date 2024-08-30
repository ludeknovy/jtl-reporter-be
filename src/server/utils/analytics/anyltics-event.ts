import { analytics } from "../analytics"

export class AnalyticsEvent {

    static isAnalyticEnabled(): boolean {
        return !(process.env.OPT_OUT_ANALYTICS === "true")
    }

    static reportProcessingStarted() {
        if (this.isAnalyticEnabled()) {
            analytics.track("reportProcessingStarted", {
                // eslint-disable-next-line camelcase
                distinct_id: process.env.ANALYTICS_IDENTIFIER,
            })
        }
    }

    static reportProcessingFinished() {
        if (this.isAnalyticEnabled()) {
            analytics.track("reportProcessingFinished", {
                // eslint-disable-next-line camelcase
                distinct_id: process.env.ANALYTICS_IDENTIFIER,
            })
        }
    }

    static reportDetails(labelCount, duration) {
        if (this.isAnalyticEnabled()) {
            analytics.track("reportInformation", {
                // eslint-disable-next-line camelcase
                distinct_id: process.env.ANALYTICS_IDENTIFIER,
                labelCount,
                duration,
            })
        }
    }

    static reportUnexpectedError(error) {
        if (this.isAnalyticEnabled()) {
            analytics.track("unexpectedError", {
                distinct_id: process.env.ANALYTICS_IDENTIFIER,
                error,
            })
        }
    }
}
