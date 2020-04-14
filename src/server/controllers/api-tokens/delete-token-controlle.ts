import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { deleteToken } from '../../queries/api-tokens';

export const deleteTokenController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.body;
  await db.query(deleteToken(id));
  return res.status(204).send();
};
