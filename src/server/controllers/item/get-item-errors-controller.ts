import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { findErrors } from '../../queries/items';

export const getItemErrorsController = async (req: Request, res: Response, next: NextFunction) => {
  const { itemId, projectName } = req.params; 
  const result = await db.query(findErrors(itemId, projectName));
  res.status(200).send(result)
}