import { Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { getApiToken, getOnlyMyApiTokens } from '../../queries/api-tokens';
import { IGetUserAuthInfoRequest } from '../../middleware/request.model';
import { AllowedRoles } from '../../middleware/authorization-middleware';

export const getTokensController = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  const { role, userId } = req.user;
  if (role === AllowedRoles.Regular) {
    const myApiKeys = await db.any(getOnlyMyApiTokens(userId));
    return res.status(200).send(myApiKeys);
  }
  const result = await db.many(getApiToken);
  res.status(200).send(result);
};
