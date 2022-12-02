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
import { AllowedRoles, authorizationMiddleware } from "../middleware/authorization-middleware"
import { authenticationMiddleware } from "../middleware/authentication-middleware"
import { getRequestStatsExportController } from "../controllers/item/get-request-stats-export-controller"

export class ItemsRoutes {

  routes(app: express.Application): void {

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items")
      .get(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(scenarioParamsSchema),
        queryParamsValidator(querySchema),
        wrapAsync( (req: Request, res: Response) => getItemsController(req, res)))

      .post(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(newItemParamSchema),
        createItemController)

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/start-async")
      .post(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
        bodySchemaValidator(newAsyncItemStartBodySchema),
        paramsSchemaValidator(newItemParamSchema),
        createItemAsyncController)

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId")
      .get(
        allowQueryTokenAuth,
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        wrapAsync( (req: IGetUserAuthInfoRequest, res: Response) => getItemController(req, res)))

      .put(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(updateItemBodySchema),
        wrapAsync( (req: Request, res: Response, next: NextFunction) => updateItemController(req, res, next)))

      .delete(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        wrapAsync( (req: Request, res: Response) => deleteItemController(req, res)))

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/request-stats-export")
        .get(
          authenticationMiddleware,
          authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
          paramsSchemaValidator(paramsSchema),
          wrapAsync( (req: Request, res: Response) => getRequestStatsExportController(req, res)))


    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/stop-async")
      .post(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        stopItemAsyncController)

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/share-tokens")
      .get(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        wrapAsync( (req: IGetUserAuthInfoRequest, res: Response) => getItemLinksController(req, res)))

      .post(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        wrapAsync( (req: IGetUserAuthInfoRequest, res: Response) => createItemLinkController(req, res)))

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/share-tokens/:tokenId")
      .delete(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(shareTokenSchema),
        wrapAsync( (req: IGetUserAuthInfoRequest, res: Response) => deleteItemShareTokenController(req, res)))

    app.route("/api/projects/:projectName/scenarios/:scenarioName/processing-items")
      .get(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(scenarioParamsSchema),
        wrapAsync( (req: Request, res: Response) => getProcessingItemsController(req, res)))

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/custom-chart-settings")
      .post(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(upsertUserItemChartSettings),
        wrapAsync( (req: IGetUserAuthInfoRequest, res: Response) => upsertItemChartSettingsController(req, res))
      )
      .get(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        wrapAsync( (req: IGetUserAuthInfoRequest, res: Response) => getItemChartSettingsController(req, res)))
  }
}
