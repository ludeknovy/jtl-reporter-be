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
import { authentication } from '../middleware/authentication-middleware';
import { authorization, AllowedRoles } from '../middleware/authorization-middleware';

export class ScenarioRoutes {

  public routes(app: express.Application): void {

    app.route('/api/projects/:projectName/scenarios')
      .get(
        authentication,
        authorization([AllowedRoles.Readonly, AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(projectNameParam),
        // tslint:disable-next-line: max-line-length
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenariosController(req, res, next)))
      .post(
        authentication,
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(projectNameParam),
        bodySchemaValidator(newScenarioSchema),
        // tslint:disable-next-line: max-line-length
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await createScenarioController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName')
      .put(
        authentication,
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(scenarioUpdateSchema),
        // tslint:disable-next-line: max-line-length
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenarioController(req, res, next)))

      .delete(
        authentication,
        authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        // tslint:disable-next-line: max-line-length
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteScenarioController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/trends')
      .get(
        authentication,
        authorization([AllowedRoles.Readonly, AllowedRoles.Regular, AllowedRoles.Admin]),
        paramsSchemaValidator(paramsSchema),
        // tslint:disable-next-line: max-line-length
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getScenarioTrendsController(req, res, next)));
  }
}
