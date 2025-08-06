import { Response } from "express"
import { db } from "../../../../db/db"
import { getUserScenarioSettings } from "../../../queries/scenario"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { StatusCode } from "../../../utils/status-code"

const defaultRequestStatsSettings = {
    samples: true,
    avg: true,
    min: true,
    max: true,
    p90: true,
    p95: true,
    p99: true,
    throughput: true,
    network: true,
    errorRate: true,
}


export const getScenariosUserSettingsController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { userId } = req.user
    const { projectName, scenarioName } = req.params
    const userScenarioSettings = await db.oneOrNone(getUserScenarioSettings(projectName, scenarioName, userId))

    res.status(StatusCode.Ok).json({
        ...userScenarioSettings?.request_stats_settings || defaultRequestStatsSettings,
    })
}
