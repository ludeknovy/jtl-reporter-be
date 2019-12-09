import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import * as uuid from 'uuid';
import { createNewApiToken } from '../../queries/api-tokens';

export const createTokenController = async (req: Request, res: Response, next: NextFunction) => {
  const { description } = req.body;
  const { userId } = <any>req.user;
  const newToken = `at-${uuid()}`
  try {
    await db.query(createNewApiToken(newToken, description, userId));
    return res.status(201).send({ token: newToken });
  } catch (error) {
    return next(error);
  }
}
