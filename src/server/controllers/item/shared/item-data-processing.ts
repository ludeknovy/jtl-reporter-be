/* eslint-disable complexity */
import { db } from "../../../../db/db"
import { logger } from "../../../../logger"
import {
  prepareDataForSavingToDb,
  prepareChartDataForSaving,
} from "../../../data-stats/prepare-data"
import { chartQueryOptionInterval } from "../../../data-stats/helper/duration"
import {
  saveThresholdsResult, saveItemStats, savePlotData, updateItem,
  aggOverviewQuery, aggLabelQuery, chartOverviewQuery,
  charLabelQuery, sutOverviewQuery, distributedThreadsQuery, responseCodeDistribution, responseMessageFailures,
  deleteSamples,
} from "../../../queries/items"
import { ReportStatus } from "../../../queries/items.model"
import { getScenarioSettings, currentScenarioMetrics } from "../../../queries/scenario"
import { sendNotifications } from "../../../utils/notifications/send-notification"
import { scenarioThresholdsCalc } from "../utils/scenario-thresholds-calc"

export const itemDataProcessing = async ({ projectName, scenarioName, itemId }) => {
  const MAX_LABEL_CHART_LENGTH = 100000
  let distributedThreads = null
  let sutMetrics = []

  try {
    const aggOverview = await db.one(aggOverviewQuery(itemId))
    const aggLabel = await db.many(aggLabelQuery(itemId))
    const statusCodeDistribution = await db.manyOrNone(responseCodeDistribution(itemId))
    const responseFailures = await db.manyOrNone(responseMessageFailures(itemId))
    const scenarioSettings = await db.one(getScenarioSettings(projectName, scenarioName))


    if (aggOverview.number_of_sut_hostnames > 1) {
      sutMetrics = await db.many(sutOverviewQuery(itemId))
    }


    const { overview,
      overview: { duration },
      labelStats, sutOverview } = prepareDataForSavingToDb(aggOverview, aggLabel, sutMetrics,
      statusCodeDistribution, responseFailures)
    const defaultInterval = chartQueryOptionInterval(duration)
    let chartData
    const extraChartData = []

    const intervals = [`${defaultInterval} milliseconds`, "5 seconds", "10 seconds", "30 seconds",
    "1 minute", "5 minute", "10 minutes", "30 minutes", "1 hour"]
    for (const [index, interval] of Object.entries(intervals)) {
      console.log(index)

      // distributed mode
      if (aggOverview?.number_of_hostnames > 1) {
        distributedThreads = await db.manyOrNone(distributedThreadsQuery(`${defaultInterval} milliseconds`, itemId))
      }


      const labelChart = await db.many(charLabelQuery(interval, itemId))
      const overviewChart = await db.many(chartOverviewQuery(interval, itemId))
      if (parseInt(index, 10) === 0) { // default interval
        chartData = prepareChartDataForSaving(
          overviewChart, labelChart, defaultInterval, distributedThreads)
      } else if (overviewChart.length > 1 && labelChart.length < MAX_LABEL_CHART_LENGTH) {
        const extraChart = prepareChartDataForSaving(
          overviewChart, labelChart, defaultInterval, distributedThreads)
        extraChartData.push({ interval, data: extraChart })
      }

      if (!scenarioSettings.extraAggregations) {
        break
      }
    }

    overview.maxVu = Math.max(...chartData.threads.map(([, vu]) => vu))

    if (scenarioSettings.thresholdEnabled) {
      const scenarioMetrics = await db.one(currentScenarioMetrics(projectName, scenarioName, overview.maxVu))
      const thresholdResult = scenarioThresholdsCalc(overview, scenarioMetrics, scenarioSettings)
      if (thresholdResult) {
        await db.none(saveThresholdsResult(projectName, scenarioName, itemId, thresholdResult))
      }
    }

    await sendNotifications(projectName, scenarioName, itemId, overview)

    await db.tx(async t => {
      await t.none(saveItemStats(itemId, JSON.stringify(labelStats), overview, JSON.stringify(sutOverview)))
      await t.none(savePlotData(itemId, JSON.stringify(chartData), JSON.stringify(extraChartData)))
      await t.none(updateItem(itemId, ReportStatus.Ready, overview.startDate))
    })

    logger.info(`Item: ${itemId} processing finished`)

    if (scenarioSettings.deleteSamples) {
      logger.info(`Item: ${itemId} deleting samples data`)
      await db.none(deleteSamples(itemId))
      await db.none("VACUUM FULL jtl.samples")
      logger.info(`Item: ${itemId} samples data deletion done`)
    }

  } catch(error) {
    console.log(error)
    throw new Error(`Error while processing dataId: ${itemId} for item: ${itemId}, error: ${error}`)
  }
}
