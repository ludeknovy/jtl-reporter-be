import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { deleteScenario } from '../../queries/scenario';

export const deleteScenarioController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName } = req.params;
  await db.none(deleteScenario(projectName, scenarioName));
  res.status(204).send();
};
