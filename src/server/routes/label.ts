import { Request, Response, NextFunction } from "express"
import * as express from "express"
import { paramsSchemaValidator, queryParamsValidator } from "../schema-validator/schema-validator-middleware"
import { wrapAsync } from "../errors/error-handler"
import { labelParamSchema, labelQuerySchema } from "../schema-validator/item-schema"
import { getLabelTrendController } from "../controllers/label/get-label-trend-controller"
import { getLabelVirtualUsersController } from "../controllers/label/get-label-vu-controllers"
import { getLabelErrorsController } from "../controllers/label/get-label-errors-controller"
import { AllowedRoles, authorizationMiddleware } from "../middleware/authorization-middleware"
import { authenticationMiddleware } from "../middleware/authentication-middleware"
import { projectExistsMiddleware } from "../middleware/project-scenario-exists"

export class LabelRoutes {

    routes(app: express.Application): void {

        app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/label/:label/trend")
            .get(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
                paramsSchemaValidator(labelParamSchema),
                queryParamsValidator(labelQuerySchema),
                projectExistsMiddleware,
                wrapAsync((req: Request, res: Response) => getLabelTrendController(req, res)))

        app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/label/:label/virtual-users")
            .get(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
                paramsSchemaValidator(labelParamSchema),
                queryParamsValidator(labelQuerySchema),
                projectExistsMiddleware,
                wrapAsync((req: Request, res: Response, next: NextFunction) =>
                    getLabelVirtualUsersController(req, res, next)))

        app.route("/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/label/:label/errors")
            .get(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
                paramsSchemaValidator(labelParamSchema),
                projectExistsMiddleware,
                wrapAsync((req: Request, res: Response) => getLabelErrorsController(req, res)))
    }
}
