import { Response } from "express"
import { db } from "../../../db/db"
import { getScenario } from "../../queries/scenario"
import { StatusCode } from "../../utils/status-code"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { getBaselineItem } from "../../queries/items"

export const getScenarioController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { projectName, scenarioName } = req.params
    const scenario = await db.oneOrNone(getScenario(projectName, scenarioName))
    const baseline = await db.oneOrNone(getBaselineItem(projectName, scenarioName))
    res.status(StatusCode.Ok).json({
        name: scenario.name,
        analysisEnabled: scenario.analysis_enabled,
        zeroErrorToleranceEnabled: scenario.zero_error_tolerance_enabled,
        minTestDuration: scenario.min_test_duration,
        deleteSamples: scenario.delete_samples,
        keepTestRunsPeriod: scenario.keep_test_runs_period,
        generateShareToken: scenario.generate_share_token,
        extraAggregations: scenario.extra_aggregations,
        thresholds: {
            enabled: scenario.threshold_enabled,
            percentile: scenario.threshold_percentile,
            throughput: scenario.threshold_throughput,
            errorRate: scenario.threshold_error_rate,
        },
        labelFilterSettings: scenario.label_filter_settings,
        labelTrendChartSettings: scenario.label_trend_chart_settings,
        apdexSettings: scenario.apdex_settings,
        baselineReport: baseline?.id || null,
    })
}
