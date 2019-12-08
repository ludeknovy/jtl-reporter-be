import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { deleteItem } from '../../queries/items';
export const deleteItemController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName, itemId } = req.params;
  await db.any(deleteItem(projectName, scenarioName, itemId));
  res.status(204).send();
}  