import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { isExistingScenario, createNewScenario } from '../../queries/scenario';
import * as boom from 'boom';

export const createScenarioController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName } = req.params;
  const { scenarioName, analysisEnabled } = req.body;
  const { exists } = await db.one(isExistingScenario(scenarioName, projectName));
  if (!exists) {
    await db.none(createNewScenario(projectName, scenarioName, analysisEnabled));
  } else {
    return next(boom.conflict('Scenario already exists'));
  }
  res.status(201).send();
};
