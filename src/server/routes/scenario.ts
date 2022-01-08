import { Request, Response, NextFunction } from "express"
import * as express from "express"
import { wrapAsync } from "../errors/error-handler"
import { paramsSchemaValidator, bodySchemaValidator } from "../schema-validator/schema-validator-middleware"
import {
  paramSchemaNotification, paramsSchema,
  scenarioNotificationBodySchema, updateScenarioSchema,
} from "../schema-validator/scenario-schema"
import { projectNameParam, scenarioSchema } from "../schema-validator/project-schema"
import { getScenariosController } from "../controllers/scenario/get-scenarios-controller"
import { createScenarioController } from "../controllers/scenario/create-scenario-controller"
import { deleteScenarioController } from "../controllers/scenario/delete-scenario-controller"
import { getScenarioTrendsController } from "../controllers/scenario/trends/get-scenario-trends-controller"
import { authenticationMiddleware } from "../middleware/auth-middleware"
// eslint-disable-next-line max-len
import { getScenarioNotificationsController } from "../controllers/scenario/notifications/get-notifications-controllers"
// eslint-disable-next-line max-len
import { createScenarioNotificationController } from "../controllers/scenario/notifications/create-notification-controller"
// eslint-disable-next-line max-len
import { deleteScenarioNotificationController } from "../controllers/scenario/notifications/delete-scenario-notification-controller"
// eslint-disable-next-line max-len
import { updateScenarioController } from "../controllers/scenario/update-scenario-controller"
import { getScenarioController } from "../controllers/scenario/get-scenario-controller"

export class ScenarioRoutes {

  routes(app: express.Application): void {

    app.route("/api/projects/:projectName/scenarios")
      .get(
        authenticationMiddleware,
        paramsSchemaValidator(projectNameParam),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => getScenariosController(req, res)))

      .post(
        authenticationMiddleware,
        paramsSchemaValidator(projectNameParam),
        bodySchemaValidator(scenarioSchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response, next: NextFunction) => createScenarioController(req, res, next)))

    app.route("/api/projects/:projectName/scenarios/:scenarioName")
      .get(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => getScenarioController(req, res))
      )

      .put(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(updateScenarioSchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => updateScenarioController(req, res)))

      .delete(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => deleteScenarioController(req, res)))

    app.route("/api/projects/:projectName/scenarios/:scenarioName/notifications")
      .get(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => getScenarioNotificationsController(req, res)))

      .post(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(scenarioNotificationBodySchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => createScenarioNotificationController(req, res)))


    app.route("/api/projects/:projectName/scenarios/:scenarioName/notifications/:notificationId")
      .delete(
        authenticationMiddleware,
        paramsSchemaValidator(paramSchemaNotification),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => deleteScenarioNotificationController(req, res)))

    app.route("/api/projects/:projectName/scenarios/:scenarioName/trends")
      .get(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => getScenarioTrendsController(req, res)))
  }
}
