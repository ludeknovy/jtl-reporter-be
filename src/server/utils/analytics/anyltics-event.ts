import { analytics } from "../analytics"
import { db } from "../../../db/db"
import { logger } from "../../../logger"

let INSTANCE_ID = null

export class AnalyticsEvent {

    private static async getInstanceId(): Promise<string> {
        if (INSTANCE_ID !== null) {
            return INSTANCE_ID
        }
        try {
            console.info("AnalyticsEvent.getInstanceId() called")
            const result = await db.oneOrNone("SELECT instance FROM jtl.global")
            if (result && result.instance) {
                INSTANCE_ID = result.instance
            }
            return INSTANCE_ID
        } catch(error) {
            logger.info("Instance id could not be loaded " + error)
        }

    }

    static isAnalyticEnabled(): boolean {
        return !(process.env.OPT_OUT_ANALYTICS === "true")
    }

    static async reportProcessingStarted() {
        if (this.isAnalyticEnabled()) {
            analytics.track("reportProcessingStarted", {
                // eslint-disable-next-line camelcase
                distinct_id: await this.getInstanceId(),
            })
        }
    }

    static async reportProcessingFinished() {
        if (this.isAnalyticEnabled()) {
            analytics.track("reportProcessingFinished", {
                // eslint-disable-next-line camelcase
                distinct_id: await this.getInstanceId(),
            })
        }
    }

    static async reportDetails(labelCount, duration) {
        if (this.isAnalyticEnabled()) {
            analytics.track("reportInformation", {
                // eslint-disable-next-line camelcase
                distinct_id: await this.getInstanceId(),
                labelCount,
                duration,
            })
        }
    }

    static async reportUnexpectedError(error) {
        if (this.isAnalyticEnabled()) {
            analytics.track("unexpectedError", {
                distinct_id: await this.getInstanceId(),
                error,
            })
        }
    }
}
