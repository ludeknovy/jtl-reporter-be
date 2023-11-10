import { Response, NextFunction } from "express"
import { IGetUserAuthInfoRequest } from "./request.model"

export const allowItemQueryTokenAuth = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  req.allowQueryAuthItem = true
  return next()
}
