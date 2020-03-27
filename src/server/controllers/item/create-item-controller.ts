import { Request, Response, NextFunction } from 'express';
import { ItemStatus, ItemDataType } from '../../queries/items.model';
import { prepareDataForSavingToDb, InputData, OutputData, 
  normalizeData, dataForFb, prepareDataForSavingToDbFromMongo,  } from '../../data-stats/prepare-data';
import { db } from '../../../db/db';
import { createNewItem, saveItemStats, saveKpiData, savePlotData, saveData, calculateOverview, getLabelsStats } from '../../queries/items';
import { chunkData } from '../../data-stats/chunk-data';
import * as multer from 'multer';
import * as boom from 'boom';
import * as fs from 'fs';
import * as pgp from 'pg-promise';
// import * as csv from 'csvtojson';
import * as parser from 'xml2json';
import * as csv from 'fast-csv';
import * as uuid from 'uuid';
import { MongoClient } from 'mongodb';
import { overviewAggPipeline, labelAggPipeline, overviewChartAgg, labelChartAgg } from '../../queries/mongo-db-agg';
import { chartQueryOptionInterval } from '../../queries/mongoChartOptionHelper';
const uri = 'mongodb://127.0.0.1:27017';
const client: MongoClient = new MongoClient(uri);


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
    let fileContent, computedData;
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
    try {
      await client.connect();
      const jtlDb = client.db('jtl-data');
      const collection = jtlDb.collection('data-chunks');

      await db.query('BEGIN');
      const kpiFilename = kpi[0].path;
      let tempBuffer = [];
      const item = await db.one(createNewItem(
        scenarioName,
        null,
        environment,
        note,
        status,
        projectName,
        hostname));


      const csvStream = fs.createReadStream(kpiFilename)
        .pipe(csv.parse({ headers: true }))
        .on('data', async row => {
          if (tempBuffer.length === (500)) {
            csvStream.pause();
            await collection.insertOne({ itemId: item.id, samples: tempBuffer });
            tempBuffer = [];
            csvStream.resume();
          }
          tempBuffer.push(dataForFb(row));
        })
        .on('end', async (rowCount: number) => {
          try {
            console.log(tempBuffer[0])
            await collection.insertOne({ itemId: item.id, samples: tempBuffer });

            const before = Date.now();
            console.log(item.id)
            const aggOverview = await collection.aggregate(overviewAggPipeline(item.id)).toArray();
            const after = Date.now();
            console.log(aggOverview);
  
            const beforeL = Date.now();
            const aggLabel = await collection.aggregate(labelAggPipeline(item.id), { allowDiskUse: true }).toArray();
            const afterL = Date.now();
            console.log(aggLabel);
  
            console.log(`duration Overview: ${(after - before) / 1000} sec.`)
            console.log(`duration Label: ${(afterL - beforeL) / 1000} sec.`)
            console.log(tempBuffer.length);
            console.log(`Parsed ${rowCount} rows`);

            const { overview, labelStats } = prepareDataForSavingToDbFromMongo(aggOverview[0], aggLabel);
            console.log("--------------")
            console.log(overview);
            console.log("--------------")
            console.log(labelStats);


            const { duration } = overview;
            console.log(duration);
            const interval = chartQueryOptionInterval(duration);
            const bOchD = Date.now();
            const overviewChartData = await collection.aggregate(overviewChartAgg(item.id, interval)).toArray();
            const aOchD = Date.now();
            const labelChartData = await collection.aggregate(labelChartAgg(item.id, interval)).toArray();
            const aLChD = Date.now();


            console.log(`Duration overview chart: ${(aOchD - bOchD) / 1000} sec.`);
            console.log(`Duration label chart: ${(aLChD - aOchD) / 1000} sec.`);

            console.log(overviewChartData.length);
            console.log(labelChartData.length);
            await db.none(saveItemStats(item.id, JSON.stringify(labelStats), overview));

            fs.unlinkSync(kpiFilename);
            await db.query('COMMIT');
            return res.status(200).send();
  
          } catch (error) {
            console.log(error);
            return res.status(500).send();
          }

 

          // await db.none(saveItemStats(item.id, JSON.stringify(itemStats), {
          //   percentil: overview.ninety,
          //   maxVu: overview.max,
          //   avgResponseTime: overview.avg_elapsed,
          //   errorRate,
          //   throughput,
          //   avgLatency: overview.avg_latency,
          //   avgBytes,
          //   avgConnect: overview.avg_connect,
          //   startDate,
          //   endDate,
          //   duration
          // }))

   
        });

    } catch (e) {
      await db.query('ROLLBACK');
      console.log(e);
      return next(boom.badRequest('Error while reading provided file'));
    }

    // OLD ------------
    // try {
    //   console.log(`${Date.now()} data received....`)
    //   computedData = prepareDataForSavingToDb(fileContent);
    //   console.log(`${Date.now()} data prepared for db`);
    // } catch (e) {
    //   console.log(e);
    //   return next(boom.badRequest('Csv data are not in correct format'));
    // }
    // try {
    //   const { startTime, itemStats, overview, sortedData } = computedData;
    //   const chunckedData = chunkData(sortedData);
    //   console.log(`${Date.now()} data chunked`);
    //   await db.query('BEGIN');
    //   const item = await db.one(createNewItem(
    //     scenarioName,
    //     startTime,
    //     environment,
    //     note,
    //     status,
    //     projectName,
    //     hostname));
    //   console.log(`${Date.now()} stringifying...`);
    //   await db.none(saveItemStats(item.id, JSON.stringify(itemStats), overview));
    //   await db.none(saveKpiData(item.id, JSON.stringify(sortedData)));
    //   await db.none(savePlotData(item.id, JSON.stringify(chunckedData)));
    //   await db.query('COMMIT');
    //   if (errors) {
    //     const filename = errors[0].path;
    //     const fileContent = fs.readFileSync(filename);
    //     fs.unwatchFile(filename);
    //     const jsonErrors = parser.toJson(fileContent);
    //     await db.none(saveData(item.id, jsonErrors, ItemDataType.Error));
    //   }


    // if (monitoring) {
    //   const filename = monitoring[0].path;
    //   const monitoringData = await csv().fromFile(filename);
    //   const monitoringDataString = JSON.stringify(monitoringData);
    //   fs.unwatchFile(filename);
    //   await db.none(saveData(item.id, monitoringDataString, ItemDataType.MonitoringLogs));
    // }
    //     res.status(200).send({
    //       id: item.id,
    //       overview,
    //       status: Object.values(ItemStatus).find(_ => _ === status),
    //     });
    //   } catch (error) {
    //     console.log(error);
    //     await db.query('ROLLBACK');
    //     return next(error);
    //   }
    //
  });
};