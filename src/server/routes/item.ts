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
import { getItemsController } from '../controllers/item/get-items-controller';
import { getItemController } from '../controllers/item/get-item-controller';
import { updateItemController } from '../controllers/item/update-item-controller';
import { deleteItemController } from '../controllers/item/delete-item-controller';
import { createItemController } from '../controllers/item/create-item-controller';



export class ItemsRoutes {

  public routes(app: express.Application): void {

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items')
      .get(
        paramsSchemaValidator(scenarioParamsSchema),
        queryParamsValidator(querySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getItemsController(req, res, next)))

      .post(
        paramsSchemaValidator(newItemParamSchema),
        createItemController);

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
