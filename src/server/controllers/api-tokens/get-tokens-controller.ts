import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { getApiTokens } from '../../queries/api-tokens';

export const getTokensController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await db.many(getApiTokens);
  res.status(200).send(result);
};
