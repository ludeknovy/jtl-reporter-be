import { Request, Response, NextFunction } from 'express';
import { createUser } from '../../queries/auth';
import { db } from '../../../db/db';
import * as boom from 'boom';
import { hashPassword } from '../auth/helper/passwords';


export const createNewUserController = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  try {
    const passwordHash = await hashPassword(password);
    await db.query(createUser(username, passwordHash));
    res.status(201).send();
  } catch (error) {
    if (error.routine === '_bt_check_unique') {
      return next(boom.conflict(`Username already exists`));
    }
    return next(error);
  }
}