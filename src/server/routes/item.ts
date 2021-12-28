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
  newAsyncItemStartBodySchema, shareTokenSchema, upsertUserItemChartSettings
} from '../schema-validator/item-schema';
import { paramsSchema as scenarioParamsSchema, querySchema } from '../schema-validator/scenario-schema';
import { getItemsController } from '../controllers/item/get-items-controller';
import { getItemController } from '../controllers/item/get-item-controller';
import { updateItemController } from '../controllers/item/update-item-controller';
import { deleteItemController } from '../controllers/item/delete-item-controller';
import { createItemController } from '../controllers/item/create-item-controller';
import { authentication } from '../middleware/authentication-middleware';
import { AllowedRoles, authorization } from '../middleware/authorization-middleware';
import { getItemErrorsController } from '../controllers/item/get-item-errors-controller';
import { getProcessingItemsController } from '../controllers/item/get-processing-items-controller';
import { createItemAsyncController } from '../controllers/item/create-item-async-controller';
import { stopItemAsyncController } from '../controllers/item/stop-item-async-controller';
import { getItemLinksController } from '../controllers/item/share-tokens/get-item-share-tokens-controller';
import { createItemLinkController } from '../controllers/item/share-tokens/create-item-share-token-controller';
import { deleteItemShareTokenController } from '../controllers/item/share-tokens/delete-item-share-token-cronroller';
import { IGetUserAuthInfoRequest } from '../middleware/request.model';
import { upsertItemChartSettingsController } from '../controllers/item/upsert-item-chart-settings-controller';
import { getItemChartSettingsController } from '../controllers/item/get-item-chart-settings-controller';

export class ItemsRoutes {

  public routes(app: express.Application): void {

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items')
      .get(
        authentication,
        authorization([AllowedRoles.Readonly, AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(scenarioParamsSchema),
        queryParamsValidator(querySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getItemsController(req, res, next)))

      .post(
        authentication,
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(newItemParamSchema),
        createItemController);

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/start-async')
      .post(
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        bodySchemaValidator(newAsyncItemStartBodySchema),
        paramsSchemaValidator(newItemParamSchema),
        createItemAsyncController);

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId')
      .get(
        authentication,
        authorization([AllowedRoles.Readonly, AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getItemController(req, res, next)))

      .put(
        authentication,
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(updateItemBodySchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await updateItemController(req, res, next)))

      .delete(
        authentication,
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteItemController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/stop-async')
      .post(
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        stopItemAsyncController);

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/share-tokens')
      .get(
        authorization([AllowedRoles.Readonly, AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getItemLinksController(req, res, next)))

      .post(
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await createItemLinkController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/share-tokens/:tokenId')
      .delete(
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(shareTokenSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteItemShareTokenController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/errors')
      .get(
        authentication,
        authorization([AllowedRoles.Readonly, AllowedRoles.Regular, AllowedRoles.Admin]),
        // tslint:disable-next-line: max-line-length
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getItemErrorsController(req, res, next)));
      // eslint-disable-next-line max-len

    app.route('/api/projects/:projectName/scenarios/:scenarioName/processing-items')
      .get(
        authorization([AllowedRoles.Readonly, AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(scenarioParamsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getProcessingItemsController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/custom-chart-settings')
      .post(
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(upsertUserItemChartSettings),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => await upsertItemChartSettingsController(req, res, next))
      )
      .get(
        authorization([AllowedRoles.Readonly, AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => await getItemChartSettingsController(req, res, next)));
  }
}
