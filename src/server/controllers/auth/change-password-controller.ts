import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { getUserById, updatePassword } from '../../queries/auth';
import { passwordMatch, hashPassword } from './helper/passwords';
import * as boom from 'boom';
import { IGetUserAuthInfoRequest } from '../../middleware/request.model';

export const changePasswordController = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req.user;
  try {
    const result = await db.query(getUserById(userId));
    if (!await passwordMatch(currentPassword, result[0].password)) {
      return next(boom.unauthorized('Current password is invalid'));
    }
    const passwordHash = await hashPassword(newPassword);
    console.log(passwordHash)
    await db.query(updatePassword(userId, passwordHash));
    return res.status(204).send();
  } catch (error) {
    console.log(error)
    next(error)
  }
};
