import boom = require('boom');
import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { getUsers } from '../../queries/auth';
import { createNewUserController } from '../users/create-new-user-controller';

export const initUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await db.manyOrNone(getUsers());
    if (users && users.length > 0) {
      return next(boom.forbidden('User was already initialized'));
    } else {
      await createNewUserController(req, res, next);
    }

  } catch (error) {
    return next(error);
  }

};
