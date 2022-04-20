import { Request, Response } from "express"
import { getLabelHistoryForVu, getLabelHistory } from "../../queries/items"
import * as moment from "moment"
import { db } from "../../../db/db"
import { StatusCode } from "../../utils/status-code"
import { getScenario } from "../../queries/scenario"

export const getLabelTrendController = async (req: Request, res: Response) => {
  const { projectName, scenarioName, itemId, label } = req.params
  const { environment, virtualUsers: inputVirtualUsers } = req.query as any
  const queryResult = (inputVirtualUsers && parseInt(inputVirtualUsers, 10) > 0)
    ? await db.query(getLabelHistoryForVu(
      scenarioName, projectName, label,
      itemId, environment, inputVirtualUsers))
    : await db.query(getLabelHistory(
      scenarioName, projectName, label,
      itemId, environment))

  queryResult.sort((a, b) => a.start_time - b.start_time)

  const scenarioSettings = await db.one(getScenario(projectName, scenarioName))

  const { timePoints, p90, p95, p99,
    errorRate, throughput, virtualUsers, avgResponseTime,
    avgConnectionTime, avgLatency, name } = queryResult.reduce((accumulator, current) => {
    accumulator.timePoints.push(moment(current.start_time).format("DD.MM.YYYY HH:mm:SS"))
    accumulator.p90.push(current.labels.n0)
    accumulator.p95.push(current.labels.n5)
    accumulator.p99.push(current.labels.n9)
    accumulator.errorRate.push(current.labels.errorRate)
    accumulator.throughput.push(current.labels.throughput)
    accumulator.virtualUsers.push(current.max_vu)
    accumulator.avgResponseTime.push(current.labels.avgResponseTime)
    accumulator.avgConnectionTime.push(current.labels.connect)
    accumulator.avgLatency.push(current.labels.latency)
    accumulator.name.push(current.name)
    return accumulator
  }, { timePoints: [], p90: [], p95: [], p99: [], errorRate: [], throughput: [], virtualUsers: [], avgResponseTime: [],
    avgConnectionTime: [], avgLatency: [], name: [] })

  res.status(StatusCode.Ok).send({
    chartSeries: {
      timePoints,
      p90, p95, p99,
      errorRate,
      throughput,
      virtualUsers,
      avgLatency,
      avgConnectionTime,
      avgResponseTime,
      name,
    },
    chartSettings: scenarioSettings.label_trend_chart_settings,
  })
}
