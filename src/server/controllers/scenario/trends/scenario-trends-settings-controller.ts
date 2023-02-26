import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { Response } from "express"
import { updateUserScenarioTrendsSettings } from "../../../queries/scenario"
import { db } from "../../../../db/db"
import { StatusCode } from "../../../utils/status-code"

export const postScenarioTrendsSettings = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { userId } = req.user
    const { projectName, scenarioName } = req.params
    await db.none(updateUserScenarioTrendsSettings(projectName, scenarioName, userId, JSON.stringify(req.body)))
    res.status(StatusCode.NoContent).send()
}
