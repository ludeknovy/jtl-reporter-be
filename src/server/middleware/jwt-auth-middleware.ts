import { Request, Response, NextFunction } from 'express';
import * as boom from 'boom';
import * as jwt from 'jsonwebtoken';
import { db } from '../../db/db';
import { getUserById } from '../queries/auth';


export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return next(boom.badRequest(`Please provide x-access-token`))
  }
  try {
    const { userId } = await jwt.verify(token, "A71527A34D15F38E");
    const rows = await db.query(getUserById(userId));
    if (!rows[0]) {
      return next(boom.unauthorized('The token you provided is invalid'))
    }
    req.user = { userId };
    next();
  } catch (error) {
    console.log(error)
    return next(boom.unauthorized('The token you provided is invalid'))
  }
}