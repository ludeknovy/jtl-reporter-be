import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { updateScenario } from '../../queries/scenario';


export const updateScenarioController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName } = req.params;
  const { thresholds, analysisEnabled, scenarioName: name, apdex } = req.body;
  await db.none(updateScenario(projectName, scenarioName, name, analysisEnabled, thresholds, apdex));
  res.status(204).send();
};
