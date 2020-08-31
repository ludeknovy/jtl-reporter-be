import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import * as uuid from 'uuid';
import { createNewApiToken } from '../../queries/api-tokens';
import { IGetUserAuthInfoRequest } from '../../middleware/request.model';

export const createTokenController = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  const { description } = req.body;
  const { userId } = req.user;
  const newToken = `at-${uuid()}`;
  try {
    await db.query(createNewApiToken(newToken, description, userId));
    return res.status(201).send({ token: newToken });
  } catch (error) {
    return next(error);
  }
};
