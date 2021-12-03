import { db } from '../../../../db/db';
import { logger } from '../../../../logger';
import {
  prepareDataForSavingToDb,
  prepareChartDataForSaving
} from '../../../data-stats/prepare-data';
import { chartQueryOptionInterval } from '../../../data-stats/helper/duration';
import {
  saveThresholdsResult, saveItemStats, savePlotData, updateItem,
  aggOverviewQuery, aggLabelQuery, chartOverviewQuery,
  charLabelQuery, sutOverviewQuery, distributedThreadsQuery, responseCodeDistribution, responseMessageFailures,
  deleteSamples
} from '../../../queries/items';
import { ReportStatus } from '../../../queries/items.model';
import { getScenarioSettings, currentScenarioMetrics } from '../../../queries/scenario';
import { sendNotifications } from '../../../utils/notifications/send-notification';
import { scenarioThresholdsCalc } from '../utils/scenario-thresholds-calc';

export const itemDataProcessing = async ({ projectName, scenarioName, itemId }) => {
  let distributedThreads = null;
  let sutMetrics = [];

  try {
    const aggOverview = await db.one(aggOverviewQuery(itemId));
    const aggLabel = await db.many(aggLabelQuery(itemId));
    const statusCodeDistribution = await db.manyOrNone(responseCodeDistribution(itemId));
    const responseFailures = await db.manyOrNone(responseMessageFailures(itemId));

    if (aggOverview.number_of_sut_hostnames > 1) {
      sutMetrics = await db.many(sutOverviewQuery(itemId));
    }


    const {
      overview,
      overview: { duration },
      labelStats, sutOverview } = prepareDataForSavingToDb(aggOverview, aggLabel, sutMetrics,
      statusCodeDistribution, responseFailures);
    const interval = chartQueryOptionInterval(duration);

    const overviewChartData = await db.many(chartOverviewQuery(`${interval} milliseconds`, itemId));

    const labelChartData = await db.many(charLabelQuery(`${interval} milliseconds`, itemId));
    // distributed mode
    if (aggOverview?.number_of_hostnames > 1) {
      distributedThreads = await db.manyOrNone(distributedThreadsQuery(`${interval} milliseconds`, itemId));
    }

    const chartData = prepareChartDataForSaving(
      overviewChartData, labelChartData, interval, distributedThreads);

    overview.maxVu = Math.max(...chartData.threads.map(([, vu]) => vu));

    const scenarioSettings = await db.one(getScenarioSettings(projectName, scenarioName));
    if (scenarioSettings.thresholdEnabled) {
      const scenarioMetrics = await db.one(currentScenarioMetrics(projectName, scenarioName, overview.maxVu));
      const thresholdResult = scenarioThresholdsCalc(overview, scenarioMetrics, scenarioSettings);
      if (thresholdResult) {
        await db.none(saveThresholdsResult(projectName, scenarioName, itemId, thresholdResult));
      }
    }

    await sendNotifications(projectName, scenarioName, itemId, overview);

    await db.tx(async t => {
      await t.none(saveItemStats(itemId, JSON.stringify(labelStats), overview, JSON.stringify(sutOverview)));
      await t.none(savePlotData(itemId, JSON.stringify(chartData)));
      await t.none(updateItem(itemId, ReportStatus.Ready, overview.startDate));
    });

    logger.info(`Item: ${itemId} processing finished`);

    if(scenarioSettings.deleteSamples) {
      logger.info(`Item: ${itemId} deleting samples data`);
      await db.none(deleteSamples(itemId));
      await db.none('VACUUM FULL jtl.samples');
      logger.info(`Item: ${itemId} samples data deletion done`);
    }

  } catch (error) {
    console.log(error);
    throw new Error(`Error while processing dataId: ${itemId} for item: ${itemId}, error: ${error}`);
  }
};
