import { IGetUserAuthInfoRequest } from "./request.model"
import { NextFunction, Response } from "express"
import { db } from "../../db/db"
import * as boom from "boom"
import { findProjectId } from "../queries/projects"

export const projectExistsMiddleware = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {

    const { projectName } = req.params
    const project = await db.oneOrNone(findProjectId(projectName))
    if (!project) {
        return next(boom.notFound("Project not found"))
    }
}
