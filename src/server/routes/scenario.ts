import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { wrapAsync } from '../errors/error-handler';
import {
  updateScenario, scenarioTrends, deleteScenario,
  findScenarios, isExistingScenario
} from '../queries/scenario';
import { db } from '../../db/db';
import { findScenariosData, createNewScenario } from '../queries/scenario';
import { paramsSchemaValidator, bodySchemaValidator } from '../schema-validator/schema-validator-middleware';
import { paramsSchema, scenarioUpdateSchema } from '../schema-validator/scenario-schema';
import { projectNameParam, newScenarioSchema } from '../schema-validator/project-schema';
import * as boom from 'boom';

export class ScenarioRoutes {

  public routes(app: express.Application): void {

    app.route('/api/projects/:projectName/scenarios')
      .get(
        paramsSchemaValidator(projectNameParam),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { projectName } = req.params;
          const scenarios = await db.any(findScenarios(projectName));
          const ids = await db.any(findScenariosData(projectName));
          const groupedData = ids.reduce((accumulator, x) => {
            const accIndex = accumulator.findIndex(_ => _.name === x.name);
            if (accIndex === -1) {
              accumulator.push({ name: x.name, id: x.scenario_id, data: [x.overview || undefined] });
            } else {
              accumulator[accIndex].data.push(x.overview);
            }
            return accumulator;
          }, []);
          scenarios.forEach(_ => {
            const scenario = groupedData.find(__ => __.name === _.name);
            if (!scenario) {
              groupedData.push({ name: _.name, id: _.id, data: [] });
            }
          });
          res.status(200).send(groupedData);
        }))
      .post(
        paramsSchemaValidator(projectNameParam),
        bodySchemaValidator(newScenarioSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { projectName } = req.params;
          const { scenarioName } = req.body;
          const { exists } = await db.one(isExistingScenario(scenarioName, projectName));
          if (!exists) {
            await db.none(createNewScenario(projectName, scenarioName));
          } else {
            return next(boom.conflict('Scenario already exists'));
          }
          res.status(201).send();
        }));

    app.route('/api/projects/:projectName/scenarios/:scenarioName')
      .put(
        paramsSchemaValidator(paramsSchema),
        bodySchemaValidator(scenarioUpdateSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { projectName, scenarioName } = req.params;
          const { scenarioName: newScenarioSchema } = req.body;
          await db.any(updateScenario(projectName, scenarioName, newScenarioSchema));
          res.status(204).send();
        }))

      .delete(
        paramsSchemaValidator(paramsSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { projectName, scenarioName } = req.params;
          await db.none(deleteScenario(projectName, scenarioName));
          res.status(204).send();
        }));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/trends')
      .get(
        paramsSchemaValidator(paramsSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { projectName, scenarioName } = req.params;
          const ids = await db.any(scenarioTrends(projectName, scenarioName));
          res.status(200).send(ids);
        }));
  }
}
