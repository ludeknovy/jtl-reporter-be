import { Response, NextFunction } from "express"
import { IGetUserAuthInfoRequest } from "./request.model"

export const allowScenarioQueryTokenAuth = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    req.allowQueryAuthScenario = true
    return next()
}
