import { Response, NextFunction } from 'express';
import { IGetUserAuthInfoRequest } from './request.model';


export const allowQueryTokenAuth = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  req.allowQueryAuth = true;
  return next();
};
