import { Request, Response, NextFunction } from "express"
import * as express from "express"
import { wrapAsync } from "../errors/error-handler"
import {
    paramsSchemaValidator,
    bodySchemaValidator,
    queryParamsValidator,
} from "../schema-validator/schema-validator-middleware"
import {
    environmentQuerySchema,
    paramSchemaNotification, paramsSchema,
    scenarioNotificationBodySchema, scenarioTrendsSettings, updateScenarioSchema,
} from "../schema-validator/scenario-schema"
import { projectNameParam, scenarioSchema } from "../schema-validator/project-schema"
import { getScenariosController } from "../controllers/scenario/get-scenarios-controller"
import { createScenarioController } from "../controllers/scenario/create-scenario-controller"
import { deleteScenarioController } from "../controllers/scenario/delete-scenario-controller"
import { getScenarioTrendsController } from "../controllers/scenario/trends/get-scenario-trends-controller"
import { getScenarioNotificationsController } from "../controllers/scenario/notifications/get-notifications-controllers"
import { createScenarioNotificationController }
    from "../controllers/scenario/notifications/create-notification-controller"
import { deleteScenarioNotificationController }
    from "../controllers/scenario/notifications/delete-scenario-notification-controller"
import { updateScenarioController } from "../controllers/scenario/update-scenario-controller"
import { getScenarioController } from "../controllers/scenario/get-scenario-controller"
import { authenticationMiddleware } from "../middleware/authentication-middleware"
import { AllowedRoles, authorizationMiddleware } from "../middleware/authorization-middleware"
import { IGetUserAuthInfoRequest } from "../middleware/request.model"
import { postScenarioTrendsSettings } from "../controllers/scenario/trends/update-scenario-trends-settings-controller"
import { getScenarioEnvironmentController } from "../controllers/scenario/get-scenario-environment-controller"
import { projectExistsMiddleware } from "../middleware/project-scenario-exists"

export class ScenarioRoutes {

    routes(app: express.Application): void {

        app.route("/api/projects/:projectName/scenarios")
            .get(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
                paramsSchemaValidator(projectNameParam),
                projectExistsMiddleware,
                wrapAsync((req: Request, res: Response) => getScenariosController(req, res)))

            .post(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
                paramsSchemaValidator(projectNameParam),
                bodySchemaValidator(scenarioSchema),
                projectExistsMiddleware,
                wrapAsync((req: Request, res: Response, next: NextFunction) =>
                    createScenarioController(req, res, next)))

        app.route("/api/projects/:projectName/scenarios/:scenarioName")
            .get(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
                paramsSchemaValidator(paramsSchema),
                projectExistsMiddleware,
                wrapAsync((req: IGetUserAuthInfoRequest, res: Response) => getScenarioController(req, res))
            )

            .put(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
                paramsSchemaValidator(paramsSchema),
                bodySchemaValidator(updateScenarioSchema),
                projectExistsMiddleware,
                wrapAsync((req: IGetUserAuthInfoRequest, res: Response) => updateScenarioController(req, res)))

            .delete(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
                paramsSchemaValidator(paramsSchema),
                projectExistsMiddleware,
                wrapAsync((req: Request, res: Response) => deleteScenarioController(req, res)))

        app.route("/api/projects/:projectName/scenarios/:scenarioName/notifications")
            .get(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
                paramsSchemaValidator(paramsSchema),
                projectExistsMiddleware,
                wrapAsync((req: Request, res: Response) => getScenarioNotificationsController(req, res)))

            .post(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
                paramsSchemaValidator(paramsSchema),
                bodySchemaValidator(scenarioNotificationBodySchema),
                projectExistsMiddleware,
                wrapAsync((req: Request, res: Response) => createScenarioNotificationController(req, res)))


        app.route("/api/projects/:projectName/scenarios/:scenarioName/notifications/:notificationId")
            .delete(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
                paramsSchemaValidator(paramSchemaNotification),
                projectExistsMiddleware,
                wrapAsync((req: Request, res: Response) => deleteScenarioNotificationController(req, res)))

        app.route("/api/projects/:projectName/scenarios/:scenarioName/trends")
            .get(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
                paramsSchemaValidator(paramsSchema),
                queryParamsValidator(environmentQuerySchema),
                projectExistsMiddleware,
                wrapAsync((req: IGetUserAuthInfoRequest, res: Response) => getScenarioTrendsController(req, res)))

        app.route("/api/projects/:projectName/scenarios/:scenarioName/trends/settings")
            .post(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
                paramsSchemaValidator(paramsSchema),
                bodySchemaValidator(scenarioTrendsSettings),
                projectExistsMiddleware,
                wrapAsync((req: IGetUserAuthInfoRequest, res: Response) => postScenarioTrendsSettings(req, res)))

        app.route("/api/projects/:projectName/scenarios/:scenarioName/environment")
            .get(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
                paramsSchemaValidator(paramsSchema),
                projectExistsMiddleware,
                wrapAsync((req: IGetUserAuthInfoRequest, res: Response) => getScenarioEnvironmentController(req, res)))
    }
}
