import { Request, Response } from "express"
import { db } from "../../../../db/db"
import {
    getUserScenarioSettings,
    scenarioAggregatedTrends,
    scenarioLabelTrends,
} from "../../../queries/scenario"
import { StatusCode } from "../../../utils/status-code"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"

export const getScenarioTrendsController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { projectName, scenarioName } = req.params
    const aggregatedData = await db.any(scenarioAggregatedTrends(projectName, scenarioName))
    const labelData = await db.manyOrNone(scenarioLabelTrends(projectName, scenarioName))
    const scenarioSettings = await db.oneOrNone(getUserScenarioSettings(projectName, scenarioName, req.user.userId))

    const labelTrends = labelData.map(data => data.stats.map(value => ({
        percentile90: [data.startDate, value.n0],
        errorRate: [data.startDate, value.errorRate],
        throughput: [data.startDate, value.throughput],
        label: value.label,
    })))


    const adjusted = {}

    labelTrends.forEach((trend) => {
        trend.forEach(value => {
            if (!adjusted[value.label]) {
                Object.assign(adjusted, { [value.label]: { percentile90: [], errorRate: [], throughput: [] } })
            }
            adjusted[value.label].percentile90.push(value.percentile90)
            adjusted[value.label].errorRate.push(value.errorRate)
            adjusted[value.label].throughput.push(value.throughput)
        })
    })

    const networkAdjustedData = aggregatedData.map((_) => {
        const { bytesPerSecond, bytesSentPerSecond } = _.overview
        const network = bytesPerSecond + bytesSentPerSecond
        return {
            id: _.id,
            overview: {
                ..._.overview,
                network,
            },
        }
    })
    res.status(StatusCode.Ok).json({
        aggregatedTrends: networkAdjustedData.sort(sortByDateAsc),
        labelTrends: adjusted,
        userSettings: {
            aggregatedTrends:
                scenarioSettings?.scenario_trends_settings
                && Object.keys(scenarioSettings.scenario_trends_settings)?.length > 0
                    ? scenarioSettings?.scenario_trends_settings?.aggregatedTrends
                    : true,
            labelMetrics: scenarioSettings?.scenario_trends_settings?.labelMetrics || {},
        },
    })
}

const sortByDateAsc = (a, b): number => {
    return new Date(a.overview.startDate).getTime() - new Date(b.overview.startDate).getTime()
}

