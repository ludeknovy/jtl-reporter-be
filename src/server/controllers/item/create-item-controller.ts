import { Request, Response, NextFunction } from 'express';
import { ItemStatus } from '../../queries/items.model';
import { transformDataForDb } from '../../data-stats/prepare-data';
import { db } from '../../../db/db';
import { createNewItem, updateItem } from '../../queries/items';
import * as multer from 'multer';
import * as boom from 'boom';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import { ReportStatus } from '../../queries/items.model';
import { logger } from '../../../logger';
import { itemDataProcessing } from './shared/item-data-processing';
import * as pgp from 'pg-promise';

const pg = pgp();

const upload = multer(
  {
    dest: './uploads',
    limits: { fieldSize: 2048 * 1024 * 1024 }
  }).fields([
  { name: 'kpi', maxCount: 1 },
  { name: 'errors', maxCount: 1 },
  { name: 'monitoring', maxCount: 1 }
]);

export const createItemController = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, async error => {
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
      let itemId;

      const kpiFilename = kpi[0].path;
      let tempBuffer = [];

      const item = await db.one(createNewItem(
        scenarioName,
        null,
        environment,
        note,
        status,
        projectName,
        hostname,
        ReportStatus.InProgress
      ));
      itemId = item.id;

      res.status(200).send({ itemId });

      const columnSet = new pg.helpers.ColumnSet([
        'elapsed', 'success', 'bytes', 'label',
        {
          name: 'timestamp',
          prop: 'timeStamp'
        },
        {
          name: 'sent_bytes',
          prop: 'sentBytes'
        },
        {
          name: 'connect',
          prop: 'Connect'
        }, {
          name: 'hostname',
          prop: 'Hostname',
          def: null
        }, {
          name: 'status_code',
          prop: 'responseCode'
        },
        {
          name: 'all_threads',
          prop: 'allThreads'
        },
        {
          name: 'grp_threads',
          prop: 'grpThreads'
        }, {
          name: 'latency',
          prop: 'Latency'
        },
        {
          name: 'response_message',
          prop: 'responseMessage'
        },
        {
          name: 'item_id',
          prop: 'itemId'
        },
        {
          name: 'sut_hostname',
          prop: 'sutHostname',
          def: null
        }
      ], { table: new pg.helpers.TableName({ table: 'samples', schema: 'jtl' }) });


      logger.info(`Starting KPI file streaming and saving to db, item_id: ${itemId}`);
      const parsingStart = Date.now();
      const csvStream = fs.createReadStream(kpiFilename)
        .pipe(csv.parse({ headers: true }))
        .on('data', async row => {
          if (tempBuffer.length === (10000)) {
            csvStream.pause();
            const query = pg.helpers.insert(tempBuffer, columnSet);
            await db.none(query);

            tempBuffer = [];
            csvStream.resume();
          }
          const data = transformDataForDb(row, itemId);
          if (data) {
            return tempBuffer.push(data);
          }
          return;
        })
        .on('end', async (rowCount: number) => {
          try {
            await db.none(pg.helpers.insert(tempBuffer, columnSet));

            fs.unlinkSync(kpiFilename);

            logger.info(`Parsed ${rowCount} records in ${(Date.now() - parsingStart) / 1000} seconds`);
            await itemDataProcessing({
              itemId,
              projectName, scenarioName,
              monitoring, errors
            });
            logger.info(`Done ${rowCount} in ${(Date.now() - parsingStart) / 1000} seconds`);

          } catch (error) {
            await db.none(updateItem(itemId, ReportStatus.Error, null));
            logger.error(`Error while processing item: ${itemId}: ${error}`);
          }
        }).
        on('error', async (error) => {
          await db.none(updateItem(itemId, ReportStatus.Error, null));
          logger.error(`Not valid csv file provided: ${error}`);
        });
    } catch (e) {
      logger.error(e);
      return next(boom.internal('Error while reading provided file'));
    }
  });
};
