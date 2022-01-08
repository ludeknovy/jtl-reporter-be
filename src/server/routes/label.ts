import { Request, Response, NextFunction } from "express"
import * as express from "express"
import { paramsSchemaValidator, queryParamsValidator } from "../schema-validator/schema-validator-middleware"
import { wrapAsync } from "../errors/error-handler"
import { labelParamSchema, labelQuerySchema } from "../schema-validator/item-schema"
import { getLabelTrendController } from "../controllers/label/get-label-trend-controller"
import { getLabelVirtualUsersController } from "../controllers/label/get-label-vu-controllers"
import { getLabelErrorsController } from "../controllers/label/get-label-errors-controller"
import { authenticationMiddleware } from "../middleware/auth-middleware"

export class LabelRoutes {

  routes(app: express.Application): void {

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/label/:label/trend")
      .get(
        authenticationMiddleware,
        paramsSchemaValidator(labelParamSchema),
        queryParamsValidator(labelQuerySchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => getLabelTrendController(req, res)))

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/label/:label/virtual-users")
      .get(
        authenticationMiddleware,
        paramsSchemaValidator(labelParamSchema),
        queryParamsValidator(labelQuerySchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response, next: NextFunction) => getLabelVirtualUsersController(req, res, next)))

    app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/label/:label/errors")
      .get(
        authenticationMiddleware,
        paramsSchemaValidator(labelParamSchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => getLabelErrorsController(req, res)))
  }
}
