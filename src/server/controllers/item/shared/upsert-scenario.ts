import { db } from "../../../../db/db"
import { getProject } from "../../../queries/projects"
import { createNewScenario, getScenario } from "../../../queries/scenario"
import { logger } from "../../../../logger"

export const upsertScenario = async (projectName, scenarioName) => {
    const project = await db.one(getProject(projectName))
    if (project.upsertScenario) {
        const scenario = await db.oneOrNone(getScenario(projectName, scenarioName))
        if (!scenario) {
            logger.info(`Upserting scenario "${scenarioName}" into project "${projectName}"`)

            await db.query(createNewScenario(projectName, scenarioName))
        }
    }
}
