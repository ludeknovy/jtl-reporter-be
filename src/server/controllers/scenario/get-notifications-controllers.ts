import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { scenarioNotifications } from '../../queries/scenario';

export const getScenarioNotificationsController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName } = req.params;
  const notifications = await db.manyOrNone(scenarioNotifications(projectName, scenarioName));
  res.status(200).send(notifications);
};
