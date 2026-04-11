import { Response } from "express"
import { db } from "../../../db/db"
import { updateScenario } from "../../queries/scenario"
import { StatusCode } from "../../utils/status-code"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"


export const updateScenarioController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { projectName, scenarioName } = req.params
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
        apdexSettings,
        minTestDuration,
    } = req.body

    await db.none(updateScenario(projectName, scenarioName, name, analysisEnabled,
        thresholds, deleteSamples, zeroErrorToleranceEnabled, keepTestRunsPeriod,
        generateShareToken, JSON.stringify(labelFilterSettings), JSON.stringify(labelTrendChartSettings),
        extraAggregations, apdexSettings, minTestDuration))

    res.status(StatusCode.NoContent).send()
}
