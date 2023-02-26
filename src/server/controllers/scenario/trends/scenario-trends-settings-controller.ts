import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { Response } from "express"
import { updateUserScenarioTrendsSettings } from "../../../queries/scenario"
import { db } from "../../../../db/db"
import { StatusCode } from "../../../utils/status-code"

const MAX_ALLOWED_METRICS = 2

export const postScenarioTrendsSettings = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { userId } = req.user
    const { projectName, scenarioName } = req.params
    const numberOfAllowedMetrics = Object.values(req.body.labelMetrics).filter(value => value)
    if (numberOfAllowedMetrics.length > MAX_ALLOWED_METRICS) {
        return res.status(StatusCode.BadRequest).send(`Max ${MAX_ALLOWED_METRICS} metrics allowed`)
    }
    await db.none(updateUserScenarioTrendsSettings(projectName, scenarioName, userId, JSON.stringify(req.body)))
    res.status(StatusCode.NoContent).send()
}
