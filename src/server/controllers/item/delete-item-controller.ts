import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { deleteItem } from '../../queries/items';
import { logger } from '../../../logger';


export const deleteItemController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName, itemId } = req.params;
  await db.any(deleteItem(projectName, scenarioName, itemId));
  logger.info(`Item ${itemId} deleted.`);
  res.status(204).send();
};
