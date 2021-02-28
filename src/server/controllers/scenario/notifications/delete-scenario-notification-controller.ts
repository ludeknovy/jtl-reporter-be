import { Request, Response, NextFunction } from 'express';
import { db } from '../../../../db/db';
import { deleteScenarioNotification } from '../../../queries/scenario';

export const deleteScenarioNotificationController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName, notificationId } = req.params;
  await db.none(deleteScenarioNotification(projectName, scenarioName, notificationId));
  res.status(204).send();
};
