import { Request, Response } from "express"
import { db } from "../../../../db/db"
import { scenarioAggregatedTrends, scenarioLabelTrends } from "../../../queries/scenario"
import { StatusCode } from "../../../utils/status-code"

export const getScenarioTrendsController = async (req: Request, res: Response) => {
    const { projectName, scenarioName } = req.params
    const aggregatedData = await db.any(scenarioAggregatedTrends(projectName, scenarioName))
    const labelData = await db.manyOrNone(scenarioLabelTrends(projectName, scenarioName))

    const labelTrends = labelData.map(data => data.stats.map(value => ({
        percentile90: [data.startDate, value.n0],
        errorRate: [data.startDate, value.errorRate],
        throughput: [data.startDate, value.throughput],
        label: value.label,
    })))

    console.log(JSON.stringify(labelTrends))

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
    })
}

const sortByDateAsc = (a, b): number => {
    return new Date(a.overview.startDate).getTime() - new Date(b.overview.startDate).getTime()
}

