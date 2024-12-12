/* eslint-disable complexity */
import { db } from "../../../../db/db"
import { logger } from "../../../../logger"
import {
    prepareDataForSavingToDb,
    prepareChartDataForSaving, prepareHistogramDataForSaving,
} from "../../../data-stats/prepare-data"
import { chartQueryOptionInterval } from "../../../data-stats/helper/duration"
import {
    saveThresholdsResult,
    saveItemStats,
    savePlotData,
    updateItem,
    aggOverviewQuery,
    aggLabelQuery,
    chartOverviewQuery,
    charLabelQuery,
    sutOverviewQuery,
    distributedThreadsQuery,
    responseCodeDistribution,
    responseMessageFailures,
    deleteSamples,
    calculateApdexValues,
    updateItemApdexSettings,
    chartOverviewStatusCodesQuery,
    responseTimePerLabelHistogram,
    getBaselineItemWithStats,
    findGroupedErrors,
    findTop5ErrorsByLabel,
    threadsPerThreadGroup, getDownsampledRawData,
} from "../../../queries/items"
import { ReportStatus } from "../../../queries/items.model"
import { getScenarioSettings } from "../../../queries/scenario"
import { sendDegradationNotifications, sendReportNotifications } from "../../../utils/notifications/send-notification"
import { scenarioThresholdsCalc } from "../utils/scenario-thresholds-calc"
import { extraIntervalMilliseconds } from "./extra-intervals-mapping"
import { AnalyticsEvent } from "../../../utils/analytics/anyltics-event"
import { DataProcessingException } from "../../../errors/data-processing-exceptions"

export const itemDataProcessing = async ({ projectName, scenarioName, itemId }) => {
    const MAX_LABEL_CHART_LENGTH = 100000
    const MAX_SCATTER_CHART_POINTS = 10000
    let distributedThreads = null
    let sutMetrics = []
    let apdex = []
    let rawDataArray = null

    try {
        logger.debug("Loading overview aggregation")
        const aggOverview = await db.one(aggOverviewQuery(itemId))
        logger.debug("Loading label aggregation")
        const aggLabel = await db.many(aggLabelQuery(itemId))
        logger.debug("Loading status code distribution")
        const statusCodeDistribution = await db.manyOrNone(responseCodeDistribution(itemId))
        logger.debug("Loading response time per label distribution")
        const responseTimePerLabelDistribution = await db.manyOrNone(responseTimePerLabelHistogram(itemId))
        logger.debug("Loading response failures")
        const responseFailures = await db.manyOrNone(responseMessageFailures(itemId))
        logger.debug("Loading scenario settings")
        const scenarioSettings = await db.one(getScenarioSettings(projectName, scenarioName))
        logger.debug("Loading raw downsampled data")
        let rawDownsampledData = await db.manyOrNone(getDownsampledRawData(itemId, MAX_SCATTER_CHART_POINTS))
        rawDataArray = rawDownsampledData?.map(row => [row.timestamp, row.value])
        rawDownsampledData = null

        logger.debug("Loading grouped errors")
        const groupedErrors = await db.manyOrNone(findGroupedErrors(itemId))
        logger.debug("Loading top 5 errors by label")
        const top5ErrorsByLabel = await db.manyOrNone(findTop5ErrorsByLabel(itemId))

        if (aggOverview.number_of_sut_hostnames > 1) {
            logger.debug("Loading SUT overview")
            sutMetrics = await db.many(sutOverviewQuery(itemId))
        }

        if (scenarioSettings.apdexSettings.enabled) {
            const { satisfyingThreshold, toleratingThreshold } = scenarioSettings.apdexSettings
            logger.debug("Calculating apdex")
            apdex = await db.many(calculateApdexValues(itemId,
                satisfyingThreshold,
                toleratingThreshold))
            logger.debug("Updating apdex settings")
            await db.none(updateItemApdexSettings(itemId, {
                satisfyingThreshold,
                toleratingThreshold,
            }))
        }

        const {
            overview,
            overview: { duration },
            labelStats, sutOverview, errors,
        } = prepareDataForSavingToDb(aggOverview, aggLabel, sutMetrics,
            statusCodeDistribution, responseFailures, apdex, groupedErrors, top5ErrorsByLabel)
        const responseTimeHistogram = prepareHistogramDataForSaving(responseTimePerLabelDistribution)
        const defaultInterval = chartQueryOptionInterval(duration)
        let chartData
        const extraChartData = []

        const intervals = [`${defaultInterval} milliseconds`, "5 seconds", "10 seconds", "30 seconds",
            "1 minute", "5 minute", "10 minutes", "30 minutes", "1 hour"]
        for (const [index, interval] of Object.entries(intervals)) {

            // distributed mode
            if (aggOverview?.number_of_hostnames > 1) {
                logger.debug("Loading distributed threads")
                distributedThreads = await db.manyOrNone(distributedThreadsQuery(interval, itemId))
            }


            logger.debug("Loading label chart")
            const labelChart = await db.many(charLabelQuery(interval, itemId))
            logger.debug("Loading overview chart")
            const overviewChart = await db.many(chartOverviewQuery(interval, itemId))
            logger.debug("Loading status code chart")
            const statusCodeChart = await db.many(chartOverviewStatusCodesQuery(interval, itemId))
            logger.debug("Loading threads per group")
            const threadsPerGroup = await db.manyOrNone(threadsPerThreadGroup(interval, itemId))
            if (parseInt(index, 10) === 0) { // default interval
                chartData = prepareChartDataForSaving(
                    {
                        overviewData: overviewChart,
                        labelData: labelChart,
                        interval: defaultInterval,
                        distributedThreads,
                        statusCodeData: statusCodeChart,
                        threadsPerThreadGroup: threadsPerGroup,
                    })
            } else if (overviewChart.length > 1 && labelChart.length < MAX_LABEL_CHART_LENGTH) {
                const extraChart = prepareChartDataForSaving(
                    {
                        overviewData: overviewChart,
                        labelData: labelChart,
                        interval: extraIntervalMilliseconds.get(interval),
                        distributedThreads,
                        statusCodeData: statusCodeChart,
                        threadsPerThreadGroup: threadsPerGroup,
                    })
                extraChartData.push({ interval, data: extraChart })
            }

            if (!scenarioSettings.extraAggregations) {
                break
            }
        }

        overview.maxVu = Math.max(...chartData.threads.map(([, vu]) => vu))

        if (scenarioSettings.thresholdEnabled) {
            logger.info("threshold comparison enabled, fetching baseline report")
            const baselineReport = await db.oneOrNone(getBaselineItemWithStats(projectName, scenarioName))
            if (baselineReport) {
                const thresholdResult = scenarioThresholdsCalc(labelStats, baselineReport.stats, scenarioSettings)
                if (thresholdResult) {
                    await db.none(saveThresholdsResult(projectName, scenarioName, itemId, thresholdResult))
                    if (!thresholdResult.passed) {
                        await sendDegradationNotifications(projectName, scenarioName, itemId)
                    }
                }
            }
        }

        await sendReportNotifications(projectName, scenarioName, itemId, overview)

        await db.tx(async t => {
            await t.none(saveItemStats(itemId, JSON.stringify(labelStats),
                overview, JSON.stringify(sutOverview), JSON.stringify(errors)))
            await t.none(savePlotData(itemId, JSON.stringify(chartData), JSON.stringify(extraChartData),
                JSON.stringify(responseTimeHistogram), JSON.stringify(rawDataArray)))
            await t.none(updateItem(itemId, ReportStatus.Ready, overview.startDate))
        })

        logger.info(`Item: ${itemId} processing finished`)
        AnalyticsEvent.reportProcessingFinished()
        AnalyticsEvent.reportDetails(labelStats.length, overview.duration)

        if (scenarioSettings.deleteSamples) {
            logger.info(`Purging samples data, item_id: ${itemId}`)
            await db.none(deleteSamples(itemId))
            logger.info(`Samples purge completed, item_id: ${itemId} `)
        }

    } catch(error) {
        throw new DataProcessingException(
            `Error while processing dataId: ${itemId} for item: ${itemId}, error: ${error}`)
    } finally {
        rawDataArray = []
    }
}
