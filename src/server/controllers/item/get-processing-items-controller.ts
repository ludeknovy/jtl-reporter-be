import { Request, Response, NextFunction } from 'express';

import { getProcessingItems } from '../../queries/scenario';
import { db } from '../../../db/db';

export const getProcessingItemsController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName } = req.params;
  const processingItems = await db.any(getProcessingItems(projectName, scenarioName));
  res.status(200).send(processingItems);
};
