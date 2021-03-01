import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { wrapAsync } from '../errors/error-handler';
import { paramsSchemaValidator, bodySchemaValidator } from '../schema-validator/schema-validator-middleware';
import {
  paramSchemaNotification, paramsSchema,
  scenarioNotificationBodySchema, scenarioUpdateSchema, updateScenarioThresholdsBodySchema
} from '../schema-validator/scenario-schema';
import { projectNameParam, newScenarioSchema } from '../schema-validator/project-schema';
import { getScenariosController } from '../controllers/scenario/get-scenarios-controller';
import { createScenarioController } from '../controllers/scenario/create-scenario-controller';
import { deleteScenarioController } from '../controllers/scenario/delete-scenario-controller';
import { getScenarioTrendsController } from '../controllers/scenario/trends/get-scenario-trends-controller';
import { authenticationMiddleware } from '../middleware/auth-middleware';
import { updateScenarioController } from '../controllers/scenario/update-scenario-controller';
// eslint-disable-next-line max-len
import { getScenarioNotificationsController } from '../controllers/scenario/notifications/get-notifications-controllers';
// eslint-disable-next-line max-len
import { createScenarioNotificationController } from '../controllers/scenario/notifications/create-notification-controller';
// eslint-disable-next-line max-len
import { deleteScenarioNotificationController } from '../controllers/scenario/notifications/delete-scenario-notification-controller';
import { getScenarioThresholdsController } from '../controllers/scenario/thresholds/get-scenario-thresholds-controller';
// eslint-disable-next-line max-len
import { updateScenarioThresholdsController } from '../controllers/scenario/thresholds/update-scenario-thresholds-controller';

export class ScenarioRoutes {

  public routes(app: express.Application): void {

    app.route('/api/projects/:projectName/scenarios')
      .get(
        authenticationMiddleware,
        paramsSchemaValidator(projectNameParam),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenariosController(req, res, next)))
      .post(
        authenticationMiddleware,
        paramsSchemaValidator(projectNameParam),
        bodySchemaValidator(newScenarioSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await createScenarioController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName')
      .put(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(scenarioUpdateSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await updateScenarioController(req, res, next)))

      .delete(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteScenarioController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/thresholds')
      .get(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenarioThresholdsController(req, res, next)))

      .put(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(updateScenarioThresholdsBodySchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await updateScenarioThresholdsController(req, res, next)));


    app.route('/api/projects/:projectName/scenarios/:scenarioName/notifications')
      .get(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenarioNotificationsController(req, res, next)))

      .post(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(scenarioNotificationBodySchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await createScenarioNotificationController(req, res, next)));


    app.route('/api/projects/:projectName/scenarios/:scenarioName/notifications/:notificationId')
      .delete(
        authenticationMiddleware,
        paramsSchemaValidator(paramSchemaNotification),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteScenarioNotificationController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/trends')
      .get(
        authenticationMiddleware,
        paramsSchemaValidator(paramsSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenarioTrendsController(req, res, next)));
  }
}
