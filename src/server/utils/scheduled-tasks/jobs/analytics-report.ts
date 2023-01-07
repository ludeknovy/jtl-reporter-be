import { analytics } from "../../analytics"
import { config } from "../../../config";


(async function () {
    await analytics.track("appAlive", {
        $os: process.platform,
        distinct_id: config.analyticsIdentifier,
    })
}())

