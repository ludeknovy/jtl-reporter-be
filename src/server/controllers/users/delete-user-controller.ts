import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { deleteUser, isExistingUser } from '../../queries/users';

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const [{ exists }] = await db.query(isExistingUser(userId));
  if (exists) {
    await db.query(deleteUser(userId));
    res.status(200).send();
  }
  res.status(404).send();
};
