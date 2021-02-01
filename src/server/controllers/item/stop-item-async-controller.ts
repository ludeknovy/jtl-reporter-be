import boom = require('boom');
import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { logger } from '../../../logger';
import { saveItemStats, savePlotData, updateItem} from '../../queries/items';
import { ReportStatus } from '../../queries/items.model';
import {labelAggPipeline, labelChartAgg, overviewAggPipeline, overviewChartAgg} from '../../queries/mongo-db-agg';
import {prepareChartDataForSavingFromMongo, prepareDataForSavingToDbFromMongo} from '../../data-stats/prepare-data';
import {chartQueryOptionInterval} from '../../queries/mongoChartOptionHelper';
import {MongoUtils} from '../../../db/mongoUtil';

const jtlDb = MongoUtils.getClient().db('jtl-data');
const collection = jtlDb.collection('data-chunks');

export const stopItemAsyncController = async (req: Request, res: Response, next: NextFunction) => {
  const { scenarioName, projectName, itemId } = req.params;

  logger.info(`Stopping async item: ${itemId}`);
  try {
    const { dataId, reportStatus } = await db
      .one('SELECT data_id as dataId, report_status as reportStatus FROM jtl.items WHERE id = $1', [itemId]);
    if (reportStatus !== ReportStatus.InProgress) {
      return res.status(400).send('Already processed');
    }

    const aggOverview = await collection.aggregate(
      overviewAggPipeline(dataId), { allowDiskUse: true }).toArray();
    const aggLabel = await collection.aggregate(
      labelAggPipeline(dataId), { allowDiskUse: true }).toArray();

    const {
      overview,
      overview: { duration },
      labelStats } = prepareDataForSavingToDbFromMongo(aggOverview[0], aggLabel);
    const interval = chartQueryOptionInterval(duration);
    const overviewChartData = await collection.aggregate(
      overviewChartAgg(dataId, interval), { allowDiskUse: true }).toArray();
    const labelChartData = await collection.aggregate(
      labelChartAgg(dataId, interval), { allowDiskUse: true }).toArray();

    const chartData = prepareChartDataForSavingFromMongo(overviewChartData, labelChartData);

    await db.tx(async t => {
      await t.none(saveItemStats(itemId, JSON.stringify(labelStats), overview));
      await t.none(savePlotData(itemId, JSON.stringify(chartData)));
      await t.none(updateItem(itemId, ReportStatus.Ready, overview.startDate));
    });

    logger.info(`New item for scenario: ${scenarioName} created with id: ${itemId} and dataId: ${dataId}`);
    res.status(200).send({ itemId, dataId });
  } catch (e) {
    logger.error(`Processing of item samples failed ${e}`);
    res.status(500).send();
  }
};
