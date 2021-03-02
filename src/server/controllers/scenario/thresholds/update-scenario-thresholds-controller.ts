import { Request, Response, NextFunction } from 'express';
import { db } from '../../../../db/db';
import { updateScenarioThresholds } from '../../../queries/scenario';

export const updateScenarioThresholdsController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName } = req.params;
  const notifications = await db.none(updateScenarioThresholds(projectName, scenarioName, req.body));
  res.status(200).send(notifications);
};
