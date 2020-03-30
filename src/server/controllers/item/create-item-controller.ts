import { Request, Response, NextFunction } from 'express';
import { ItemStatus, ItemDataType } from '../../queries/items.model';
import {
  dataForFb, prepareDataForSavingToDbFromMongo, prepareChartDataForSavingFromMongo,
} from '../../data-stats/prepare-data';
import { db } from '../../../db/db';
import {
  createNewItem, saveItemStats, savePlotData, saveData, updateItemStatus
} from '../../queries/items';
import * as multer from 'multer';
import * as boom from 'boom';
import * as fs from 'fs';
import * as csvtojson from 'csvtojson';
import * as parser from 'xml2json';
import * as csv from 'fast-csv';
import { ReportStatus } from '../../queries/items.model';
import { overviewAggPipeline, labelAggPipeline, overviewChartAgg, labelChartAgg } from '../../queries/mongo-db-agg';
import { chartQueryOptionInterval } from '../../queries/mongoChartOptionHelper';
import { MongoUtils } from '../../../db/mongoUtil';
import { logger } from '../../../logger';
import * as uuid from 'uuid';


const upload = multer(
  {
    dest: `./uploads`,
    limits: { fieldSize: 2048 * 1024 * 1024 }
  }).fields([
    { name: 'kpi', maxCount: 1 },
    { name: 'errors', maxCount: 1 },
    { name: 'monitoring', maxCount: 1 }
  ]);

export const createItemController = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, async error => {
    let itemId = null;
    const { environment, note, status = ItemStatus.None, hostname } = req.body;
    const { kpi, errors, monitoring } = <any>req.files;
    const { scenarioName, projectName } = req.params;
    if (error) {
      return next(boom.badRequest(error.message));
    }
    if (!kpi) {
      return next(boom.badRequest('no file provided'));
    }
    if (!environment) {
      return next(boom.badRequest('environment is required'));
    }
    if (!Object.values(ItemStatus).some(_ => _ === status)) {
      return next(boom.badRequest('invalid status type'));
    }
    if (hostname && hostname.lenght > 200) {
      return next(boom.badRequest('too long hostname. max length is 200.'));
    }
    logger.info(`Starting new item processing for scenario: ${scenarioName}`);
    try {
      const dataId = uuid();
      let itemId;
      const jtlDb = MongoUtils.getClient().db('jtl-data');
      const collection = jtlDb.collection('data-chunks');

      const kpiFilename = kpi[0].path;
      let tempBuffer = [];

      logger.info(`Starting KPI file streaming and saving to Mongo`);
      res.status(200).send();

      const parsingStart = Date.now();
      const csvStream = fs.createReadStream(kpiFilename)
        .pipe(csv.parse({ headers: true }))
        .on('data', async row => {
          if (tempBuffer.length === (500)) {
            csvStream.pause();
            await collection.insertOne({ dataId, samples: tempBuffer });
            tempBuffer = [];
            csvStream.resume();
          }
          tempBuffer.push(dataForFb(row));
        })
        .on('end', async (rowCount: number) => {
          try {
            await collection.insertOne({ dataId, samples: tempBuffer });

            fs.unlinkSync(kpiFilename);

            logger.info(`Parsed ${rowCount} records in ${(Date.now() - parsingStart) / 1000} seconds`);

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

              const item = await t.one(createNewItem(
                scenarioName,
                null,
                environment,
                note,
                status,
                projectName,
                hostname,
                ReportStatus.InProgress,
                dataId
              ));

              itemId = item.id;
              await t.none(saveItemStats(item.id, JSON.stringify(labelStats), overview));
              await t.none(savePlotData(item.id, JSON.stringify(chartData)));
              await t.none(updateItemStatus(item.id, ReportStatus.Ready));
            });


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
          } catch (error) {
            logger.error(`Error while processing item: ${itemId}: ${error}`);
          }
        });
    } catch (e) {
      logger.error(e);
      return next(boom.serverUnavailable('Error while reading provided file'));
    }
  });
};
