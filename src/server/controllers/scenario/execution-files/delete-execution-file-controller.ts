import { Request, Response } from "express"
import { db } from "../../../../db/db"
import { deleteExecutionFile } from "../../../queries/scenario"
import { StatusCode } from "../../../utils/status-code"

export const deleteExecutionFileController = async (req: Request, res: Response) => {
    const { projectName, scenarioName, fileId } = req.params
    await db.query(deleteExecutionFile(projectName, scenarioName, fileId))
    res.status(StatusCode.Ok).send()
}
