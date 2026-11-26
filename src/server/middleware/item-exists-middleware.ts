import { IGetUserAuthInfoRequest } from "./request.model"
import { NextFunction, Response } from "express"
import { db } from "../../db/db"
import * as boom from "@hapi/boom"
import { findItemIdInScenario } from "../queries/items"

export const itemExistsMiddleware = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const { projectName, scenarioName, itemId } = req.params
    const item = await db.oneOrNone(findItemIdInScenario(itemId, projectName, scenarioName))
    if (!item) {
        return next(boom.notFound("Item not found"))
    }
    next()
}
