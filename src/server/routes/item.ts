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
  findItem,
  findItemStats,
  updateTestItemInfo,
  deleteItem,
  findAttachements,
  removeCurrentBaseFlag,
  setBaseFlag,
  savePlotData,
  getEndpointHistory
} from '../queries/items';
import { db } from '../../db/db';
import { createNewItem, saveItemStats, saveKpiData, saveErrorsData } from '../queries/items';
import {
  bodySchemaValidator, paramsSchemaValidator,
  queryParamsValidator
} from '../schema-validator/schema-validator-middleware';
import {
  paramsSchema, updateItemBodySchema,
  newItemParamSchema, endpointQuerySchema
} from '../schema-validator/item-schema';
import { paramsSchema as scenarioParamsSchema, querySchema } from '../schema-validator/scenario-schema';
import { findItemsForScenario, itemsForScenarioCount } from '../queries/scenario';
import { prepareDataForSavingToDb, ItemDbData } from '../data-stats/prepare-data';
import { ItemStatus } from '../queries/items.model';
import * as moment from 'moment';
const upload = multer(
  {
    dest: `./uploads`,
    limits: { fieldSize: 25 * 1024 * 1024 }
  }).fields([
    { name: 'kpi', maxCount: 1 },
    { name: 'errors', maxCount: 1 }]);


export class ItemsRoutes {
  private fileContent;
  private computedData: ItemDbData;

  public routes(app: express.Application): void {

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items')
      .get(
        paramsSchemaValidator(scenarioParamsSchema),
        queryParamsValidator(querySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { projectName, scenarioName } = req.params;
          const { limit = 15, offset = 0 } = req.query;
          const { total } = await db.one(itemsForScenarioCount(projectName, scenarioName));
          const ids = await db.any(findItemsForScenario(projectName, scenarioName, limit, offset));
          const idsBaseUpdate = ids.map(_ => {
            _.base = !_.base ? false : true;
            return _;
          });
          res.status(200).send({ name: scenarioName, data: idsBaseUpdate, total: parseInt(total, 10) });
        }))

      .post(
        paramsSchemaValidator(newItemParamSchema),
        (req: Request, res: Response, next: NextFunction) => {
          upload(req, res, async error => {
            const { environment, note, status = ItemStatus.None } = req.body;
            const { kpi, errors } = <any>req.files;
            const { scenarioName } = req.params;
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
            try {
              const filename = kpi[0].path;
              this.fileContent = await csv().fromFile(filename);
              fs.unlinkSync(filename);
            } catch (e) {
              return next(boom.badRequest('Error while reading provided file'));
            }
            try {
              this.computedData = prepareDataForSavingToDb(this.fileContent);
            } catch (e) {
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
                status));
              await db.none(saveItemStats(item.id, JSON.stringify(itemStats), overview));
              await db.none(saveKpiData(item.id, JSON.stringify(sortedData)));
              await db.none(savePlotData(item.id, JSON.stringify(chunkData(sortedData))));
              await db.query('COMMIT');
              if (errors) {
                const filename = errors[0].path;
                const fileContent = fs.readFileSync(filename);
                fs.unwatchFile(filename);
                const jsonErrors = parser.toJson(fileContent);
                await db.none(saveErrorsData(item.id, jsonErrors));
              }
              res.status(200).send({
                id: item.id,
                overview,
                status: Object.values(ItemStatus).find(_ => _ === status),
              });
            } catch (error) {
              await db.query('ROLLBACK');
              return next(error);
            }
          });
        });

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId')
      .get(
        paramsSchemaValidator(paramsSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { projectName, scenarioName, itemId } = req.params;
          const {
            plot_data: plot,
            note,
            environment,
            base_id,
            status } = await db.one(findItem(itemId, projectName, scenarioName));
          const { stats: statistics, overview } = await db.one(findItemStats(itemId));
          const files = await db.any(findAttachements(itemId));
          const attachements = files.map(_ => _.type);
          res.status(200).send({
            overview, statistics, status,
            plot, note, environment,
            attachements, baseId: base_id, isBase: base_id === itemId
          });
        }))

      .put(
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(updateItemBodySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { projectName, scenarioName, itemId } = req.params;
          const { note, environment, base } = req.body;
          console.log(base);
          try {
            await db.query('BEGIN');
            await db.none(updateTestItemInfo(itemId, scenarioName, projectName, note, environment));
            if (base) {
              await db.none(removeCurrentBaseFlag(scenarioName));
              await db.none(setBaseFlag(itemId, scenarioName));
            }
            await db.query('COMMIT');
            res.status(204).send();
          } catch (error) {
            await db.query('ROLLBACK');
            return next(error);
          }
        }))

      .delete(
        paramsSchemaValidator(paramsSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { projectName, scenarioName, itemId } = req.params;
          await db.any(deleteItem(projectName, scenarioName, itemId));
          res.status(204).send();
        }));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/label-trend')
      .get(
        paramsSchemaValidator(paramsSchema),
        queryParamsValidator(endpointQuerySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { projectName, scenarioName } = req.params;
          const { name } = req.query;
          const queryResult = await db.query(getEndpointHistory(scenarioName, projectName, name));
          const timePoints = [];
          const n0 = [];
          const n5 = [];
          const n9 = [];
          const errorRate = [];
          const throughput = [];
          const threads = [];
          console.log(queryResult.length);
          try {
            queryResult.forEach((_) => {
              let { start_time } = _;
              timePoints.push(moment(start_time).format(`DD.MM.YYYY HH:mm:SS`));
              n0.push( _.labels.n0);
              n5.push(_.labels.n5);
              n9.push(_.labels.n9);
              errorRate.push(_.labels.errorRate);
              throughput.push(_.labels.throughput);
              threads.push(_.max_vu);
            });
          } catch (error) {
            console.log(error);
          }
          res.status(200).send({
            timePoints,
            n0, n5, n9, errorRate, throughput, threads
          });
        }));

  }
}
