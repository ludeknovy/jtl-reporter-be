import { Request, Response } from "express"
import { db } from "../../../db/db"
import {getProject, updateProjectName} from "../../queries/projects"
import { StatusCode } from "../../utils/status-code"
import {getAllowedUsersForProject, removeAllowedUSerFromProject} from "../../queries/user-project-access"
import { logger } from "../../../logger"
import * as pgp from "pg-promise"

const pg = pgp()

export const updateProjectController = async (req: Request, res: Response) => {
    const { projectName } = req.params
    const { projectName: newProjectName, topMetricsSettings, upsertScenario, projectMembers } = req.body
    const currentProjectMembers = await db.manyOrNone(getAllowedUsersForProject(projectName))

    const newProjectMembers = projectMembers.filter(member =>
        !currentProjectMembers.find(currentMember => currentMember.user_id === member))
    const projectMembersToRemove = currentProjectMembers
        .filter(currentMember =>
            !projectMembers.find(member => member === currentMember.user_id))
        .map(currentMember => currentMember.user_id)

    const project = await db.one(getProject(projectName))
    await db.tx(transaction => {
        const queries = []

        if (Array.isArray(newProjectMembers) && newProjectMembers.length > 0) {
            logger.info(`Adding new project members ${newProjectMembers}`)
            const columnSet = new pg.helpers.ColumnSet([
                    { name: "project_id", prop: "projectId" },
                    { name: "user_id", prop: "userId" }],
                { table: new pg.helpers.TableName({ table: "user_project_access", schema: "jtl" }) })

            const dataToBeInserted = newProjectMembers.map(user => ({
                userId: user,
                projectId: project.id,
            }))
            queries.push(db.query(pg.helpers.insert(dataToBeInserted, columnSet)))
        }
        if (Array.isArray(projectMembersToRemove) && projectMembersToRemove.length > 0) {
            logger.info(`Removing current project members ${projectMembersToRemove}`)
            projectMembersToRemove.forEach(member => {
                queries.push(db.query(removeAllowedUSerFromProject(project.id, member)))
            })
        }

        queries.push(db.none(
            updateProjectName(projectName, newProjectName, topMetricsSettings, upsertScenario)))

        console.log(queries)
        return transaction.batch(queries)
    })
    res.status(StatusCode.NoContent).send()
}
