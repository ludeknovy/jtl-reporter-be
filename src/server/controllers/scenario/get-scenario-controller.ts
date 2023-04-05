import { Response } from "express"
import { db } from "../../../db/db"
import { getScenario, getUserScenarioSettings } from "../../queries/scenario"
import { StatusCode } from "../../utils/status-code"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { getBaselineItem } from "../../queries/items"

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

export const getScenarioController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { projectName, scenarioName } = req.params
    const { userId } = req.user
    const scenario = await db.oneOrNone(getScenario(projectName, scenarioName))
    const baseline = await db.oneOrNone(getBaselineItem(projectName, scenarioName))
    const userScenarioSettings = await db.oneOrNone(getUserScenarioSettings(projectName, scenarioName, userId))
    res.status(StatusCode.Ok).json({
        name: scenario.name,
        analysisEnabled: scenario.analysis_enabled,
        zeroErrorToleranceEnabled: scenario.zero_error_tolerance_enabled,
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
        userSettings: {
            requestStats: userScenarioSettings?.request_stats_settings || defaultRequestStatsSettings,
        },
        apdexSettings: scenario.apdex_settings,
        baselineReport: baseline?.id || null,
    })
}
