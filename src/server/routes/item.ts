import { Request, Response, NextFunction } from "express"
import * as express from "express"
import { wrapAsync } from "../errors/error-handler"
import {
  bodySchemaValidator, paramsSchemaValidator,
  queryParamsValidator,
} from "../schema-validator/schema-validator-middleware"
import {
  paramsSchema, updateItemBodySchema,
  newItemParamSchema,
  newAsyncItemStartBodySchema, shareTokenSchema, upsertUserItemChartSettings,
} from "../schema-validator/item-schema"
import { paramsSchema as scenarioParamsSchema, querySchema } from "../schema-validator/scenario-schema"
import { getItemsController } from "../controllers/item/get-items-controller"
import { getItemController } from "../controllers/item/get-item-controller"
import { updateItemController } from "../controllers/item/update-item-controller"
import { deleteItemController } from "../controllers/item/delete-item-controller"
import { createItemController } from "../controllers/item/create-item-controller"
import { authenticationMiddleware } from "../middleware/auth-middleware"
import { getProcessingItemsController } from "../controllers/item/get-processing-items-controller"
import { createItemAsyncController } from "../controllers/item/create-item-async-controller"
import { stopItemAsyncController } from "../controllers/item/stop-item-async-controller"
import { allowQueryTokenAuth } from "../middleware/allow-query-token-auth"
import { getItemLinksController } from "../controllers/item/share-tokens/get-item-share-tokens-controller"
import { createItemLinkController } from "../controllers/item/share-tokens/create-item-share-token-controller"
import { deleteItemShareTokenController } from "../controllers/item/share-tokens/delete-item-share-token-cronroller"
import { IGetUserAuthInfoRequest } from "../middleware/request.model"
import { upsertItemChartSettingsController } from "../controllers/item/upsert-item-chart-settings-controller"
import { getItemChartSettingsController } from "../controllers/item/get-item-chart-settings-controller"

export class ItemsRoutes {

  routes(app: express.Application): void {

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items")
      .get(
        authenticationMiddleware,
        paramsSchemaValidator(scenarioParamsSchema),
        queryParamsValidator(querySchema),
        wrapAsync( (req: Request, res: Response, next: NextFunction) => getItemsController(req, res, next)))

      .post(
        authenticationMiddleware,
        paramsSchemaValidator(newItemParamSchema),
        createItemController)

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/start-async")
      .post(
        authenticationMiddleware,
        bodySchemaValidator(newAsyncItemStartBodySchema),
        paramsSchemaValidator(newItemParamSchema),
        createItemAsyncController)

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId")
      .get(
        allowQueryTokenAuth,
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        wrapAsync( (req: Request, res: Response) => getItemController(req, res)))

      .put(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(updateItemBodySchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response, next: NextFunction) => updateItemController(req, res, next)))

      .delete(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => deleteItemController(req, res)))

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/stop-async")
      .post(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        stopItemAsyncController)

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/share-tokens")
      .get(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => getItemLinksController(req, res)))

      .post(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => createItemLinkController(req, res)))

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/share-tokens/:tokenId")
      .delete(
        authenticationMiddleware,
        paramsSchemaValidator(shareTokenSchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => deleteItemShareTokenController(req, res)))

    app.route("/api/projects/:projectName/scenarios/:scenarioName/processing-items")
      .get(
        authenticationMiddleware,
        paramsSchemaValidator(scenarioParamsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next) =>  await getProcessingItemsController(req, res)))

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/custom-chart-settings")
      .post(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(upsertUserItemChartSettings),
        // eslint-disable-next-line max-len
        wrapAsync( (req: IGetUserAuthInfoRequest, res: Response, next) => upsertItemChartSettingsController(req, res))
      )
      .get(authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync( async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => await getItemChartSettingsController(req, res, next)))
  }
}
