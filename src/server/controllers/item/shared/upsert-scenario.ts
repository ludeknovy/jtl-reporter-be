import { db } from "../../../../db/db"
import { getProject } from "../../../queries/projects"
import { createNewScenario, getScenario } from "../../../queries/scenario"
import { logger } from "../../../../logger"

export const upsertScenario = async (projectName, scenarioName) => {
    const scenario = await db.oneOrNone(getScenario(projectName, scenarioName))
    if (scenario) {
        // scenario already exists
        return true
    }
    const project = await db.one(getProject(projectName))
    if (project.upsertScenario) {
        logger.info(`Creating new scenario "${scenarioName}" into project "${projectName}"`)
        await db.query(createNewScenario(projectName, scenarioName))
        return true
    }
    return false
}
