import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { getUser } from '../../queries/auth';
import * as boom from 'boom';
import * as jwt from 'jsonwebtoken';
import { passwordMatch } from './helper/passwords';
import { config } from '../../config';


export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  try {
    const result = await db.query(getUser(username));
    if (!result[0]) {
      return next(boom.unauthorized('The credentials you provided is incorrect'));
    }
    if (!await passwordMatch(password, result[0].password)) {
      return next(boom.unauthorized('The credentials you provided is incorrect'));
    }
    const token = generateToken(result[0].id);
    return res.status(200).send({ token, username, role: result[0].role });
  } catch (error) {
    return next(error);
  }

};



export const generateToken = (id) => {
  const token = jwt.sign({
    userId: id
  },
    config.jwtToken, { expiresIn: '7d' }
  );
  return token;
};
