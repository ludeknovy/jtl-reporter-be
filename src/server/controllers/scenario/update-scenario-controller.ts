import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { updateScenario } from '../../queries/scenario';

export const updateScenarioController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName } = req.params;
  const { scenarioName: newScenarioSchema } = req.body;
  await db.any(updateScenario(projectName, scenarioName, newScenarioSchema));
  res.status(204).send();
};
