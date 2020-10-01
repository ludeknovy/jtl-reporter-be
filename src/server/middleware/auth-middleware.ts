import { Response, NextFunction } from 'express';
import * as boom from 'boom';
import * as jwt from 'jsonwebtoken';
import { db } from '../../db/db';
import { getUserById } from '../queries/auth';
import { getApiToken } from '../queries/api-tokens';
import { config } from '../config';
import { IGetUserAuthInfoRequest } from './request.model';

const UNAUTHORIZED_MSG = 'The token you provided is invalid';

export const verifyToken = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return next(boom.unauthorized('Please provide x-access-token'));
  }
  if (isApiToken(token)) {
    try {
      const [tokenData] = await db.query(getApiToken(token));
      if (tokenData) {
        req.user = { userId: tokenData.created_by };
        return next();
      } else {
        return next(boom.unauthorized(UNAUTHORIZED_MSG));
      }
    } catch (error) {
      return next(boom.unauthorized(UNAUTHORIZED_MSG));
    }
  }

  try {
    const { userId } = await jwt.verify(token, config.jwtToken);
    const [userData] = await db.query(getUserById(userId));
    if (!userData) {
      return next(boom.unauthorized(UNAUTHORIZED_MSG));
    }
    req.user = { userId };
    next();
  } catch (error) {
    return next(boom.unauthorized(UNAUTHORIZED_MSG));
  }
};


const isApiToken = (token) => {
  return token.startsWith('at-');
};
