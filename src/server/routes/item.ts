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
  newAsyncItemStartBodySchema, stopAsyncItemBody
} from '../schema-validator/item-schema';
import { paramsSchema as scenarioParamsSchema, querySchema } from '../schema-validator/scenario-schema';
import { getItemsController } from '../controllers/item/get-items-controller';
import { getItemController } from '../controllers/item/get-item-controller';
import { updateItemController } from '../controllers/item/update-item-controller';
import { deleteItemController } from '../controllers/item/delete-item-controller';
import { createItemController } from '../controllers/item/create-item-controller';
import { verifyToken } from '../middleware/auth-middleware';
import { getItemErrorsController } from '../controllers/item/get-item-errors-controller';
import { getProcessingItemsController } from '../controllers/item/get-processing-items-controller';
import { createItemAsyncController } from '../controllers/item/create-item-async-controller';
import { stopItemAsyncController } from '../controllers/item/stop-item-async-controller';
import { allowQueryTokenAuth } from '../middleware/allow-query-token-auth';
import { getItemLinksController } from '../controllers/item/links/get-item-links-controller';
import { createItemLinkController } from '../controllers/item/links/create-item-link-controller';
import { deleteItemLinkController } from '../controllers/item/links/delete-item-link-cronroller';

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

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/start-async')
      .post(
        verifyToken,
        bodySchemaValidator(newAsyncItemStartBodySchema),
        paramsSchemaValidator(newItemParamSchema),
        createItemAsyncController);

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId')
      .get(
        allowQueryTokenAuth,
        verifyToken,
        paramsSchemaValidator(paramsSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getItemController(req, res, next)))

      .put(
        verifyToken,
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(updateItemBodySchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await updateItemController(req, res, next)))

      .delete(
        verifyToken,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteItemController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/stop-async')
      .post(
        verifyToken,
        paramsSchemaValidator(paramsSchema),
        stopItemAsyncController);

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/share-tokens')
      .get(
        verifyToken,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getItemLinksController(req, res, next)))

      .post(
        verifyToken,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await createItemLinkController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/share-tokens/:tokenId')
      .delete(
        verifyToken,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteItemLinkController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/errors')
      // eslint-disable-next-line max-len
      .get(wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getItemErrorsController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/processing-items')
      .get(
        verifyToken,
        paramsSchemaValidator(scenarioParamsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getProcessingItemsController(req, res, next)));
  }
}
