import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { wrapAsync } from '../errors/error-handler';
import { paramsSchemaValidator, bodySchemaValidator } from '../schema-validator/schema-validator-middleware';
import { paramsSchema, scenarioUpdateSchema } from '../schema-validator/scenario-schema';
import { projectNameParam, newScenarioSchema } from '../schema-validator/project-schema';
import { getScenariosController } from '../controllers/scenario/get-scenarios-controller';
import { createScenarioController } from '../controllers/scenario/create-scenario-controller';
import { getScenarioController } from '../controllers/scenario/get-scenario-controller';
import { deleteScenarioController } from '../controllers/scenario/delete-scenario-controller';
import { getScenarioTrendsController } from '../controllers/scenario/get-scenario-trends-controller';

export class ScenarioRoutes {

  public routes(app: express.Application): void {

    app.route('/api/projects/:projectName/scenarios')
      .get(
        paramsSchemaValidator(projectNameParam),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenariosController(req, res, next)))
      .post(
        paramsSchemaValidator(projectNameParam),
        bodySchemaValidator(newScenarioSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await createScenarioController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName')
      .put(
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(scenarioUpdateSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenarioController(req, res, next)))

      .delete(
        paramsSchemaValidator(paramsSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteScenarioController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/trends')
      .get(
        paramsSchemaValidator(paramsSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenarioTrendsController(req, res, next)));
  }
}
