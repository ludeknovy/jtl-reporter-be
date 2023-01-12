import { Response } from "express"
import { db } from "../../../db/db"
import { updateScenario, updateUserScenarioSettings } from "../../queries/scenario"
import { StatusCode } from "../../utils/status-code"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"


export const updateScenarioController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { projectName, scenarioName } = req.params
    const { userId } = req.user
    const {
        thresholds,
        analysisEnabled,
        scenarioName: name,
        deleteSamples,
        generateShareToken,
        zeroErrorToleranceEnabled,
        keepTestRunsPeriod,
        labelFilterSettings,
        labelTrendChartSettings,
        extraAggregations,
        userSettings,
        apdexSettings,
    } = req.body

    await db.none(updateScenario(projectName, scenarioName, name, analysisEnabled,
        thresholds, deleteSamples, zeroErrorToleranceEnabled, keepTestRunsPeriod,
        generateShareToken, JSON.stringify(labelFilterSettings), JSON.stringify(labelTrendChartSettings),
        extraAggregations, apdexSettings))

    await db.none(updateUserScenarioSettings(projectName, scenarioName, userId,
        JSON.stringify(userSettings.requestStats)))

    res.status(StatusCode.NoContent).send()
}
