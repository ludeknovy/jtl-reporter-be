import { Response } from "express"
import { db } from "../../../db/db"
import { getProject, updateProjectName } from "../../queries/projects"
import { StatusCode } from "../../utils/status-code"
import { addProjectMember, getProjectMembers, removeProjectMember } from "../../queries/user-project-access"
import { logger } from "../../../logger"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { AllowedRoles } from "../../middleware/authorization-middleware"


export const updateProjectController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { projectName } = req.params
    const { projectName: newProjectName, topMetricsSettings, upsertScenario, projectMembers } = req.body

    const project = await db.one(getProject(projectName))
    await db.tx("update project", async transaction => {

        if (req.user.role === AllowedRoles.Admin) {
            const currentProjectMembers = await db.manyOrNone(getProjectMembers(projectName))

            const newProjectMembers = projectMembers?.filter(member =>
                !currentProjectMembers.find(currentMember => currentMember.user_id === member))
            const projectMembersToRemove = currentProjectMembers
                .filter(currentMember =>
                    !projectMembers.find(member => member === currentMember.user_id))
                .map(currentMember => currentMember.user_id)


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
        }

        await transaction.none(
            updateProjectName(projectName, newProjectName, topMetricsSettings, upsertScenario))
    })
    res.status(StatusCode.NoContent).send()
}
