import { Request, Response, NextFunction } from 'express';
import { db } from '../../../../db/db';
import { getScenarioThresholds } from '../../../queries/scenario';

export const getScenarioThresholdsController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName } = req.params;
  const thresholds = await db.oneOrNone(getScenarioThresholds(projectName, scenarioName));
  res.status(200).send(thresholds);
};
