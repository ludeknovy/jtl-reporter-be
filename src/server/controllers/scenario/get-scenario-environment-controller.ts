import { Request, Response } from "express"
import { searchEnvironments } from "../../queries/scenario"
import { StatusCode } from "../../utils/status-code"
import { db } from "../../../db/db"

export const getScenarioEnvironmentController = async (req: Request, res: Response) => {
    const { projectName, scenarioName } = req.params
    const environments = await db.manyOrNone(searchEnvironments(projectName, scenarioName))
    return res.status(StatusCode.Ok).json(environments.map(env => env.environment))
}
