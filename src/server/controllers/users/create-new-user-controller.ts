import { Request, Response, NextFunction } from 'express';
import { createUser } from '../../queries/auth';
import { db } from '../../../db/db';
import * as boom from 'boom';
import { hashPassword } from '../auth/helper/passwords';


export const createNewUserController = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password, role } = req.body;

  try {
    await createUserInDB(username, password, role);
    res.status(201).send();
  } catch (error) {
    if (error.routine === '_bt_check_unique') {
      return next(boom.conflict(`Username already exists`));
    }
    return next(error);
  }
};

export const createUserInDB = async (username, password, role) => {
  const passwordHash = await hashPassword(password);
  await db.query(createUser(username, passwordHash, role));
}
