import { analytics } from "../../analytics"

(async function () {
    await analytics.track("appAlive", {
        $os: process.platform,
        distinct_id: process.env.ANALYTICS_IDENTIFIER,
    })
}())

