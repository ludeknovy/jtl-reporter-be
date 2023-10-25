import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { generateShareToken } from "../../item/utils/generateShareToken"
import { db } from "../../../../db/db"
import { createScenarioShareToken } from "../../../queries/scenario"
import { StatusCode } from "../../../utils/status-code"

export const createScenarioShareTokenController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { projectName, scenarioName } = req.params
    const { user } = req
    const { note } = req.body
    const token = generateShareToken()
    console.log(projectName, scenarioName)
    await db.none(createScenarioShareToken(projectName, scenarioName, token, user.userId, note))
    res.status(StatusCode.Created).json({ token })
}
