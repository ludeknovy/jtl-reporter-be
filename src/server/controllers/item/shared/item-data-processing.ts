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
        const aggOverview = await db.one(aggOverviewQuery(itemId))
        const aggLabel = await db.many(aggLabelQuery(itemId))
        const statusCodeDistribution = await db.manyOrNone(responseCodeDistribution(itemId))
        const responseTimePerLabelDistribution = await db.manyOrNone(responseTimePerLabelHistogram(itemId))
        const responseFailures = await db.manyOrNone(responseMessageFailures(itemId))
        const scenarioSettings = await db.one(getScenarioSettings(projectName, scenarioName))

        let rawDownsampledData = await db.manyOrNone(getDownsampledRawData(itemId, MAX_SCATTER_CHART_POINTS))
        rawDataArray = rawDownsampledData?.map(row => [row.timestamp, row.value])
        rawDownsampledData = null

        const groupedErrors = await db.manyOrNone(findGroupedErrors(itemId))
        const top5ErrorsByLabel = await db.manyOrNone(findTop5ErrorsByLabel(itemId))

        if (aggOverview.number_of_sut_hostnames > 1) {
            sutMetrics = await db.many(sutOverviewQuery(itemId))
        }

        if (scenarioSettings.apdexSettings.enabled) {
            const { satisfyingThreshold, toleratingThreshold } = scenarioSettings.apdexSettings
            apdex = await db.many(calculateApdexValues(itemId,
                satisfyingThreshold,
                toleratingThreshold))
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
                distributedThreads = await db.manyOrNone(distributedThreadsQuery(interval, itemId))
            }


            const labelChart = await db.many(charLabelQuery(interval, itemId))
            const overviewChart = await db.many(chartOverviewQuery(interval, itemId))
            const statusCodeChart = await db.many(chartOverviewStatusCodesQuery(interval, itemId))
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
