import { IGetUserAuthInfoRequest } from "./request.model"
import { NextFunction, Response } from "express"
import { db } from "../../db/db"
import * as boom from "boom"
import { createNewProject, findProjectId } from "../queries/projects"
import { getGlobalSettings } from "../queries/global-settings"
import { logger } from "../../logger"

export const projectExistsMiddleware = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {

    const { projectName } = req.params
    const project = await db.oneOrNone(findProjectId(projectName))
    if (!project) {
        return next(boom.notFound("Project not found"))
    }
    next()
}

export const projectAutoProvisioningMiddleware = async (
    req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const { projectName } = req.params
    const project = await db.oneOrNone(findProjectId(projectName))
    if (project) {
        return next()
    }
    const globalSettings = await db.one(getGlobalSettings())
    if (globalSettings.project_auto_provisioning === true) {
        logger.info(`Project auto-provisioning is enabled, creating a new project ${projectName}`)
        await db.one(createNewProject(projectName, true))
        return next()
    }
    return next(boom.notFound("Project not found"))
}
