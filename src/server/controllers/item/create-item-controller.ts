import { Request, Response, NextFunction } from 'express';
import { ItemStatus, ItemDataType } from '../../queries/items.model';
import { prepareDataForSavingToDb, InputData, OutputData, normalizeData } from '../../data-stats/prepare-data';
import { db } from '../../../db/db';
import { createNewItem, saveItemStats, saveKpiData, savePlotData, saveData } from '../../queries/items';
import { chunkData } from '../../data-stats/chunk-data';
import * as multer from 'multer';
import * as boom from 'boom';
import * as fs from 'fs';
// import * as csv from 'csvtojson';
import * as parser from 'xml2json';
import * as csv from 'fast-csv';
import pg = require('pg-promise/typescript/pg-subset');


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
      const kpiFilename = kpi[0].path;
      let tempBuffer = [];
      const csvStream = fs.createReadStream(kpiFilename)
        .pipe(csv.parse({ headers: true }))
        .on('data', async row => {
          if (tempBuffer.length === (5000 - 1)) {
            csvStream.pause();
            await db.query('INSERT INTO jtl.data_chunks(item_data) VALUES($1)', [JSON.stringify(tempBuffer)]);
            tempBuffer = [];
            csvStream.resume();
          }
          tempBuffer.push(normalizeData(row));
          return;
        })
        .on('end', (rowCount: number) => {
          console.log(tempBuffer.length);
          console.log(`Parsed ${rowCount} rows`);
          fs.unlinkSync(kpiFilename);
          return res.status(200).send();
        });

    } catch (e) {
      return next(boom.badRequest('Error while reading provided file'));
    }
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
  });
}