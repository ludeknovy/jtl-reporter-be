import csvtojson = require('csvtojson');
import { db } from '../../../../db/db';
import { MongoUtils } from '../../../../db/mongoUtil';
import { logger } from '../../../../logger';
import {
  prepareDataForSavingToDbFromMongo,
  prepareChartDataForSavingFromMongo
} from '../../../data-stats/prepare-data';
import { saveThresholdsResult, saveItemStats, savePlotData, updateItem, saveData } from '../../../queries/items';
import { ItemDataType, ReportStatus } from '../../../queries/items.model';
import {
  overviewChartAgg, labelChartAgg, labelAggPipeline,
  overviewAggPipeline, threadChartDistributed
} from '../../../queries/mongo-db-agg';
import { chartQueryOptionInterval } from '../../../queries/mongoChartOptionHelper';
import { getScenarioThresholds, currentScenarioMetrics } from '../../../queries/scenario';
import { sendNotifications } from '../../../utils/notifications/send-notification';
import { scenarioThresholdsCalc } from '../utils/scenario-thresholds-calc';
import * as parser from 'xml2json';
import * as fs from 'fs';

export const itemDataProcessing = async ({ projectName, scenarioName, itemId, dataId, errors, monitoring }) => {
  const jtlDb = MongoUtils.getClient().db('jtl-data');
  const collection = jtlDb.collection('data-chunks');
  let distributedThreads = null;

  try {
    const hostnames: [] = await collection.distinct('samples.Hostname', { dataId });

    const aggOverview = await overviewAggregationPipeline(collection, dataId);
    const aggLabel = await labelAggregationPipeline(collection, dataId);

    const {
      overview,
      overview: { duration },
      labelStats } = prepareDataForSavingToDbFromMongo(aggOverview[0], aggLabel);
    const interval = chartQueryOptionInterval(duration);
    const overviewChartData = await collection.aggregate(
      overviewChartAgg(dataId, interval), { allowDiskUse: true }).toArray();
    const labelChartData = await collection.aggregate(
      labelChartAgg(dataId, interval), { allowDiskUse: true }).toArray();

    // distributed mode
    if (hostnames?.length > 1) {
      distributedThreads = await collection.aggregate(
        threadChartDistributed(interval, dataId),
        { allowDiskUse: true }).toArray();
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
      await t.none(saveItemStats(itemId, JSON.stringify(labelStats), overview));
      await t.none(savePlotData(itemId, JSON.stringify(chartData)));
      await t.none(updateItem(itemId, ReportStatus.Ready, overview.startDate));
    });
  } catch (error) {
    throw new Error(`Error while processing dataId: ${dataId} for item: ${itemId}, error: ${error}`);
  }
};


const overviewAggregationPipeline = async (collection, dataId) => {
  return await collection.aggregate(
    overviewAggPipeline(dataId), { allowDiskUse: true }).toArray();
};

const labelAggregationPipeline = async (collection, dataId) => {
  return await collection.aggregate(
    labelAggPipeline(dataId), { allowDiskUse: true }).toArray();
};
