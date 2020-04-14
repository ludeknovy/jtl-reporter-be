import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { wrapAsync } from '../errors/error-handler';
import { paramsSchemaValidator, bodySchemaValidator } from '../schema-validator/schema-validator-middleware';
import { paramsSchema, scenarioUpdateSchema } from '../schema-validator/scenario-schema';
import { projectNameParam, newScenarioSchema } from '../schema-validator/project-schema';
import { getScenariosController } from '../controllers/scenario/get-scenarios-controller';
import { createScenarioController } from '../controllers/scenario/create-scenario-controller';
import { deleteScenarioController } from '../controllers/scenario/delete-scenario-controller';
import { getScenarioTrendsController } from '../controllers/scenario/get-scenario-trends-controller';
import { verifyToken } from '../middleware/auth-middleware';
import { updateScenarioController } from '../controllers/scenario/update-scenario-controller';

export class ScenarioRoutes {

  public routes(app: express.Application): void {

    app.route('/api/projects/:projectName/scenarios')
      .get(
        verifyToken,
        paramsSchemaValidator(projectNameParam),
        // tslint:disable-next-line: max-line-length
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenariosController(req, res, next)))
      .post(
        verifyToken,
        paramsSchemaValidator(projectNameParam),
        bodySchemaValidator(newScenarioSchema),
        // tslint:disable-next-line: max-line-length
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await createScenarioController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName')
      .put(
        verifyToken,
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(scenarioUpdateSchema),
        // tslint:disable-next-line: max-line-length
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await updateScenarioController(req, res, next)))

      .delete(
        verifyToken,
        paramsSchemaValidator(paramsSchema),
        // tslint:disable-next-line: max-line-length
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteScenarioController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/trends')
      .get(
        verifyToken,
        paramsSchemaValidator(paramsSchema),
        // tslint:disable-next-line: max-line-length
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenarioTrendsController(req, res, next)));
  }
}
