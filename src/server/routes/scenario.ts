import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { wrapAsync } from '../errors/error-handler';
import { paramsSchemaValidator, bodySchemaValidator } from '../schema-validator/schema-validator-middleware';
import {
  paramSchemaNotification, paramsSchema,
  scenarioNotificationBodySchema, updateScenarioSchema
} from '../schema-validator/scenario-schema';
import { projectNameParam, scenarioSchema } from '../schema-validator/project-schema';
import { getScenariosController } from '../controllers/scenario/get-scenarios-controller';
import { createScenarioController } from '../controllers/scenario/create-scenario-controller';
import { deleteScenarioController } from '../controllers/scenario/delete-scenario-controller';
import { authenticationMiddleware } from '../middleware/authentication-middleware';
import { authorization, AllowedRoles } from '../middleware/authorization-middleware';
import { getScenarioTrendsController } from '../controllers/scenario/trends/get-scenario-trends-controller';
// eslint-disable-next-line max-len
import { getScenarioNotificationsController } from '../controllers/scenario/notifications/get-notifications-controllers';
// eslint-disable-next-line max-len
import { createScenarioNotificationController } from '../controllers/scenario/notifications/create-notification-controller';
// eslint-disable-next-line max-len
import { deleteScenarioNotificationController } from '../controllers/scenario/notifications/delete-scenario-notification-controller';
// eslint-disable-next-line max-len
import { updateScenarioController } from '../controllers/scenario/update-scenario-controller';
import { getScenarioController } from '../controllers/scenario/get-scenario-controller';

export class ScenarioRoutes {

  public routes(app: express.Application): void {

    app.route('/api/projects/:projectName/scenarios')
      .get(
        authenticationMiddleware,
        authorization([AllowedRoles.Readonly, AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(projectNameParam),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenariosController(req, res, next)))

      .post(
        authenticationMiddleware,
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(projectNameParam),
        bodySchemaValidator(scenarioSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await createScenarioController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName')
      .get(
        authorization([AllowedRoles.Readonly, AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenarioController(req, res, next))
      )

      .put(
        authenticationMiddleware,
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(updateScenarioSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await updateScenarioController(req, res, next)))

      .delete(
        authenticationMiddleware,
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteScenarioController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/notifications')
      .get(
        authorization([AllowedRoles.Readonly, AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenarioNotificationsController(req, res, next)))

      .post(
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(scenarioNotificationBodySchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await createScenarioNotificationController(req, res, next)));


    app.route('/api/projects/:projectName/scenarios/:scenarioName/notifications/:notificationId')
      .delete(
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramSchemaNotification),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteScenarioNotificationController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/trends')
      .get(
        authenticationMiddleware,
        authorization([AllowedRoles.Readonly, AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenarioTrendsController(req, res, next)));
  }
}
