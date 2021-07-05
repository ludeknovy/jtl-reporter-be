import csvtojson = require('csvtojson');
import { db } from '../../../../db/db';
import { logger } from '../../../../logger';
import {
  prepareDataForSavingToDb,
  prepareChartDataForSavingFromMongo
} from '../../../data-stats/prepare-data';
import {
  saveThresholdsResult, saveItemStats, savePlotData, updateItem,
  saveData, aggOverviewQuery, aggLabelQuery, chartOverviewQuery, charLabelQuery, sutOverviewQuery
} from '../../../queries/items';
import { ItemDataType, ReportStatus } from '../../../queries/items.model';
import { chartQueryOptionInterval } from '../../../queries/mongoChartOptionHelper';
import { getScenarioThresholds, currentScenarioMetrics } from '../../../queries/scenario';
import { sendNotifications } from '../../../utils/notifications/send-notification';
import { scenarioThresholdsCalc } from '../utils/scenario-thresholds-calc';
import * as parser from 'xml2json';
import * as fs from 'fs';

export const itemDataProcessing = async ({ projectName, scenarioName, itemId, dataId, errors, monitoring }) => {
  let distributedThreads = null;
  let sutMetrics = [];

  try {
    const aggOverview = await db.one(aggOverviewQuery(dataId));
    const aggLabel = await db.many(aggLabelQuery(dataId));

    if (aggOverview.number_of_sut_hostnames > 1) {
      sutMetrics = await db.many(sutOverviewQuery(dataId));
    }


    const {
      overview,
      overview: { duration },
      labelStats, sutOverview } = prepareDataForSavingToDb(aggOverview, aggLabel, sutMetrics);
    const interval = chartQueryOptionInterval(duration);

    const overviewChartData = await db.many(chartOverviewQuery(`${interval} milliseconds`, dataId));

    const labelChartData = await db.many(charLabelQuery(`${interval} milliseconds`, dataId));
    // distributed mode
    if (aggOverview['number_of_hostnames'] > 1) {
      // distributedThreads = await collection.aggregate(
      //   threadChartDistributed(interval, dataId),
      //   { allowDiskUse: true }).toArray();
    }

    const chartData = prepareChartDataForSavingFromMongo(overviewChartData, labelChartData, distributedThreads);

    overview.maxVu = Math.max(...chartData.threads.map(([, vu]) => vu));

    const scenarioThresholds = await db.one(getScenarioThresholds(projectName, scenarioName));
    if (scenarioThresholds.enabled) {
      const scenarioMetrics = await db.one(currentScenarioMetrics(projectName, scenarioName, overview.maxVu));
      const thresholdResult = scenarioThresholdsCalc(overview, scenarioMetrics, scenarioThresholds);
      if (thresholdResult) {
        await db.none(saveThresholdsResult(projectName, scenarioName, itemId, thresholdResult));
      }
    }

    if (errors) {
      const filename = errors[0].path;
      const fileContent = fs.readFileSync(filename);
      fs.unwatchFile(filename);
      const jsonErrors = parser.toJson(fileContent);
      await db.none(saveData(itemId, jsonErrors, ItemDataType.Error));
    }


    if (monitoring) {
      const filename = monitoring[0].path;
      const monitoringData = await csvtojson().fromFile(filename);
      const monitoringDataString = JSON.stringify(monitoringData);
      fs.unwatchFile(filename);
      await db.none(saveData(itemId, monitoringDataString, ItemDataType.MonitoringLogs));
    }
    logger.info(`Item: ${itemId} processing finished`);
    await sendNotifications(projectName, scenarioName, itemId, overview);


    await db.tx(async t => {
      await t.none(saveItemStats(itemId, JSON.stringify(labelStats), overview, JSON.stringify(sutOverview)));
      await t.none(savePlotData(itemId, JSON.stringify(chartData)));
      await t.none(updateItem(itemId, ReportStatus.Ready, overview.startDate));
    });
  } catch (error) {
    console.log(error)
    throw new Error(`Error while processing dataId: ${dataId} for item: ${itemId}, error: ${error}`);
  }
};
