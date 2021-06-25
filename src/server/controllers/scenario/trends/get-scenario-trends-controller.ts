import { Request, Response, NextFunction } from 'express';
import { db } from '../../../../db/db';
import { scenarioTrends } from '../../../queries/scenario';

export const getScenarioTrendsController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName } = req.params;
  const ids = await db.any(scenarioTrends(projectName, scenarioName));
  res.status(200).send(ids);
};
