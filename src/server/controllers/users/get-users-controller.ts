import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { getUsers } from '../../queries/users';


export const getUsersController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await db.query(getUsers);
  res.status(200).send(result);
};
