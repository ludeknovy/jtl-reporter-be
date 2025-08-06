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
    let sutMetricsPromise = null
    let apdex = []
    let rawDataArray = null

    try {

        logger.debug("Loading scenario settings")
        const scenarioSettings = await db.one(getScenarioSettings(projectName, scenarioName))

        logger.debug("Loading overview aggregation")
        let aggOverviewPromise = db.one(aggOverviewQuery(itemId))

        logger.debug("Loading label aggregation")
        logger.debug("Loading status code distribution")
        logger.debug("Loading response time per label distribution")
        logger.debug("Loading response failures")
        logger.debug("Loading raw downsampled data")
        logger.debug("Loading grouped errors")
        logger.debug("Loading top 5 errors by label")

        let dbPromises = [
            db.many(aggLabelQuery(itemId)),
            db.manyOrNone(responseCodeDistribution(itemId)),
            db.manyOrNone(responseTimePerLabelHistogram(itemId)),
            db.manyOrNone(responseMessageFailures(itemId)),
            db.manyOrNone(getDownsampledRawData(itemId, MAX_SCATTER_CHART_POINTS)),
            db.manyOrNone(findGroupedErrors(itemId)),
            db.manyOrNone(findTop5ErrorsByLabel(itemId))
        ]

        let conditionalIndex = dbPromises.length
        
        if (scenarioSettings.apdexSettings.enabled) {
            const { satisfyingThreshold, toleratingThreshold } = scenarioSettings.apdexSettings
            dbPromises.push(db.many(calculateApdexValues(itemId, satisfyingThreshold, toleratingThreshold)))
        }
        
        const aggOverview = await aggOverviewPromise

        if (aggOverview.number_of_sut_hostnames > 1) {
            logger.debug("Loading SUT overview")
            sutMetricsPromise = db.many(sutOverviewQuery(itemId))
        }

        let dbResults = await Promise.all(dbPromises)

        if (aggOverview.number_of_sut_hostnames > 1) {
            sutMetrics = await sutMetricsPromise
        }

        if (scenarioSettings.apdexSettings.enabled) {
            apdex = dbResults[conditionalIndex++]
            const { satisfyingThreshold, toleratingThreshold } = scenarioSettings.apdexSettings
            await db.none(updateItemApdexSettings(itemId, {
                satisfyingThreshold,
                toleratingThreshold,
            }))
        }

        const [
            aggLabel,
            statusCodeDistribution,
            responseTimePerLabelDistribution,
            responseFailures,
            rawDownsampledData,
            groupedErrors,
            top5ErrorsByLabel
        ] = dbResults;

        rawDataArray = rawDownsampledData?.map(row => [row.timestamp, row.value])

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

        // First loop: Only DB queries, group promises into arrays
        let charts = []
        let distributedThreadsPromises = []

        for (const [index, interval] of Object.entries(intervals)) {
            logger.debug(`Preparing queries for interval: ${interval}`)
            
            // distributed mode - conditional query
            let distributedThreadsPromise = null
            if (aggOverview?.number_of_hostnames > 1) {
                logger.debug("Preparing distributed threads query")
                distributedThreadsPromise = db.manyOrNone(distributedThreadsQuery(interval, itemId))
            }
            distributedThreadsPromises.push(distributedThreadsPromise)

            // The 4 main queries for each interval
            const intervalPromises = [
                db.many(charLabelQuery(interval, itemId)),           // 0: labelChart
                db.many(chartOverviewQuery(interval, itemId)),       // 1: overviewChart  
                db.many(chartOverviewStatusCodesQuery(interval, itemId)), // 2: statusCodeChart
                db.manyOrNone(threadsPerThreadGroup(interval, itemId))    // 3: threadsPerGroup
            ]
            
            charts.push(intervalPromises)
            
            if (!scenarioSettings.extraAggregations) {
                break
            }
        }

        logger.debug("Executing all chart queries in parallel")
        const allChartResults = await Promise.all(charts.map(promises => Promise.all(promises)))
        const allDistributedThreadsResults = await Promise.all(distributedThreadsPromises.filter(p => p !== null))

        // Second loop: Only data processing
        let distributedThreadsIndex = 0
        for (const [index, interval] of Object.entries(intervals)) {
            const intervalIndex = parseInt(index, 10)
            
            // Get query results for this range
            const [labelChart, overviewChart, statusCodeChart, threadsPerGroup] = allChartResults[intervalIndex]
            
            // Get distributedThreads if applicable
            let distributedThreads = null
            if (aggOverview?.number_of_hostnames > 1) {
                distributedThreads = allDistributedThreadsResults[distributedThreadsIndex++]
            }
            
            logger.debug(`Processing data for interval: ${interval}`)
            
            if (intervalIndex === 0) { // default interval
                chartData = prepareChartDataForSaving({
                    overviewData: overviewChart,
                    labelData: labelChart,
                    interval: defaultInterval,
                    distributedThreads,
                    statusCodeData: statusCodeChart,
                    threadsPerThreadGroup: threadsPerGroup,
                })
            } else if (overviewChart.length > 1 && labelChart.length < MAX_LABEL_CHART_LENGTH) {
                const extraChart = prepareChartDataForSaving({
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