import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { wrapAsync } from '../errors/error-handler';
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
import { verifyToken } from '../middleware/auth-middleware';



export class ItemsRoutes {

  public routes(app: express.Application): void {

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items')
      .get(
        verifyToken,
        paramsSchemaValidator(scenarioParamsSchema),
        queryParamsValidator(querySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getItemsController(req, res, next)))

      .post(
        verifyToken,
        paramsSchemaValidator(newItemParamSchema),
        createItemController);

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId')
      .get(
        verifyToken,
        paramsSchemaValidator(paramsSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getItemController(req, res, next)))

      .put(
        verifyToken,
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(updateItemBodySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await updateItemController(req, res, next)))

      .delete(
        verifyToken,
        paramsSchemaValidator(paramsSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteItemController(req, res, next)));
  }
}
