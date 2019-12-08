import { Request, Response, NextFunction } from 'express';
import * as csv from 'csvtojson';
import * as parser from 'xml2json';
import * as express from 'express';
import * as multer from 'multer';
import * as boom from 'boom';
import * as fs from 'fs';
import { wrapAsync } from '../errors/error-handler';
import { chunkData } from '../data-stats/chunk-data';
import {
  deleteItem,
  savePlotData,
} from '../queries/items';
import { db } from '../../db/db';
import { createNewItem, saveItemStats, saveKpiData, saveData } from '../queries/items';
import {
  bodySchemaValidator, paramsSchemaValidator,
  queryParamsValidator
} from '../schema-validator/schema-validator-middleware';
import {
  paramsSchema, updateItemBodySchema,
  newItemParamSchema,
} from '../schema-validator/item-schema';
import { paramsSchema as scenarioParamsSchema, querySchema } from '../schema-validator/scenario-schema';
import { prepareDataForSavingToDb, ItemDbData } from '../data-stats/prepare-data';
import { ItemStatus, ItemDataType } from '../queries/items.model';
import { getItemsController } from '../controllers/item/get-items-controller';
import { getItemController } from '../controllers/item/get-item-controller';
import { updateItemController } from '../controllers/item/update-item-controller';
import { deleteItemController } from '../controllers/item/delete-item-controller';
const upload = multer(
  {
    dest: `./uploads`,
    limits: { fieldSize: 25 * 1024 * 1024 }
  }).fields([
    { name: 'kpi', maxCount: 1 },
    { name: 'errors', maxCount: 1 },
    { name: 'monitoring', maxCount: 1 }
  ]);


export class ItemsRoutes {
  private fileContent;
  private computedData: ItemDbData;

  public routes(app: express.Application): void {

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items')
      .get(
        paramsSchemaValidator(scenarioParamsSchema),
        queryParamsValidator(querySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getItemsController(req, res, next)))

      .post(
        paramsSchemaValidator(newItemParamSchema),
        (req: Request, res: Response, next: NextFunction) => {
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
            try {
              const kpiFilename = kpi[0].path;
              this.fileContent = await csv().fromFile(kpiFilename);
              fs.unlinkSync(kpiFilename);
            } catch (e) {
              return next(boom.badRequest('Error while reading provided file'));
            }
            try {
              this.computedData = prepareDataForSavingToDb(this.fileContent);
            } catch (e) {
              console.log(e);
              return next(boom.badRequest('Csv data are not in correct format'));
            }
            try {
              await db.query('BEGIN');
              const { startTime, itemStats, overview, sortedData } = this.computedData;
              const item = await db.one(createNewItem(
                scenarioName,
                startTime,
                environment,
                note,
                status,
                projectName,
                hostname));
              await db.none(saveItemStats(item.id, JSON.stringify(itemStats), overview));
              await db.none(saveKpiData(item.id, JSON.stringify(sortedData)));
              await db.none(savePlotData(item.id, JSON.stringify(chunkData(sortedData))));
              await db.query('COMMIT');
              if (errors) {
                const filename = errors[0].path;
                const fileContent = fs.readFileSync(filename);
                fs.unwatchFile(filename);
                const jsonErrors = parser.toJson(fileContent);
                await db.none(saveData(item.id, jsonErrors, ItemDataType.Error));
              }
              if (monitoring) {
                const filename = monitoring[0].path;
                const monitoringData = await csv().fromFile(filename);
                const monitoringDataString = JSON.stringify(monitoringData);
                fs.unwatchFile(filename);
                await db.none(saveData(item.id, monitoringDataString, ItemDataType.MonitoringLogs));
              }
              res.status(200).send({
                id: item.id,
                overview,
                status: Object.values(ItemStatus).find(_ => _ === status),
              });
            } catch (error) {
              console.log(error);
              await db.query('ROLLBACK');
              return next(error);
            }
          });
        });

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId')
      .get(
        paramsSchemaValidator(paramsSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getItemController(req, res, next)))

      .put(
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(updateItemBodySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await updateItemController(req, res, next)))

      .delete(
        paramsSchemaValidator(paramsSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteItemController(req, res, next)));
  }
}
