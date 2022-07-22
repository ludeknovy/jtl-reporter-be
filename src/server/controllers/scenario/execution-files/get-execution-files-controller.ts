import { Request, Response } from "express"
import { db } from "../../../../db/db"
import { getScenarioExecutionFiles} from "../../../queries/scenario"
import { StatusCode } from "../../../utils/status-code"


export const getExecutionFileController = async (req: Request, res: Response) => {
    const { projectName, scenarioName } = req.params
    const executionFiles = await db.manyOrNone(getScenarioExecutionFiles(projectName, scenarioName))
    res.status(StatusCode.Ok).send(executionFiles)
}
