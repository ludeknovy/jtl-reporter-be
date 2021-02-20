import { Request, Response, NextFunction } from 'express';
import { db } from '../../../../db/db';
import { selectShareTokens } from '../../../queries/items';

export const getItemLinksController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName, itemId } = req.params;
  const shareTokens = await db.manyOrNone(selectShareTokens(projectName, scenarioName, itemId));
  res.status(200).send(shareTokens);
};
