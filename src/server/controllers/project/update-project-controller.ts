import { Request, Response } from "express"
import { db } from "../../../db/db"
import {getProject, updateProjectName} from "../../queries/projects"
import { StatusCode } from "../../utils/status-code"
import {addProjectMember, getProjectMembers, removeProjectMember} from "../../queries/user-project-access"
import { logger } from "../../../logger"
import * as pgp from "pg-promise"


export const updateProjectController = async (req: Request, res: Response) => {
    const { projectName } = req.params
    const { projectName: newProjectName, topMetricsSettings, upsertScenario, projectMembers } = req.body
    const currentProjectMembers = await db.manyOrNone(getProjectMembers(projectName))

    console.log({ currentProjectMembers })

    const newProjectMembers = projectMembers.filter(member =>
        !currentProjectMembers.find(currentMember => currentMember.user_id === member))
    const projectMembersToRemove = currentProjectMembers
        .filter(currentMember =>
            !projectMembers.find(member => member === currentMember.user_id))
        .map(currentMember => currentMember.user_id)

    const project = await db.one(getProject(projectName))
    await db.tx("update project", async transaction => {

        if (Array.isArray(newProjectMembers) && newProjectMembers.length > 0) {
            logger.info(`Adding new project members ${newProjectMembers}`)
            await Promise.all(newProjectMembers
                .map(user => transaction.none(addProjectMember(project.id, user))))
        }
        if (Array.isArray(projectMembersToRemove) && projectMembersToRemove.length > 0) {
            logger.info(`Removing current project members ${projectMembersToRemove}`)
            await Promise.all(projectMembersToRemove
                .map(member => transaction.query(removeProjectMember(project.id, member))))
        }

        await transaction.none(
            updateProjectName(projectName, newProjectName, topMetricsSettings, upsertScenario))
    })
    res.status(StatusCode.NoContent).send()
}
