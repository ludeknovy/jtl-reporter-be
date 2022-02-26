import { Request, Response } from "express"
import { getLabelHistoryForVu, getLabelHistory } from "../../queries/items"
import * as moment from "moment"
import { db } from "../../../db/db"
import { StatusCode } from "../../utils/status-code"

export const getLabelTrendController = async (req: Request, res: Response) => {
  const { projectName, scenarioName, itemId, label } = req.params
  const { environment, virtualUsers } = req.query as any
  const queryResult = (virtualUsers && parseInt(virtualUsers, 10) > 0)
    ? await db.query(getLabelHistoryForVu(
      scenarioName, projectName, label,
      itemId, environment, virtualUsers))
    : await db.query(getLabelHistory(
      scenarioName, projectName, label,
      itemId, environment))

  queryResult.sort((a, b) => a.start_time - b.start_time)

  const { timePoints, n0, n5, n9,
    errorRate, throughput, threads, avgResponseTime, latency, connect } = queryResult.reduce((accumulator, current) => {
    accumulator.timePoints.push(moment(current.start_time).format("DD.MM.YYYY HH:mm:SS"))
    accumulator.n0.push(current.labels.n0)
    accumulator.n5.push(current.labels.n5)
    accumulator.n9.push(current.labels.n9)
    accumulator.errorRate.push(current.labels.errorRate)
    accumulator.throughput.push(current.labels.throughput)
    accumulator.threads.push(current.max_vu)
    accumulator.avgResponseTime.push(current.labels.avgResponseTime)
    accumulator.connect.push(current.labels.connect)
    accumulator.latency.push(current.labels.latency)
    return accumulator
  }, { timePoints: [], n0: [], n5: [], n9: [], errorRate: [], throughput: [], threads: [], avgResponseTime: [],
    connect: [], latency: [] })

  res.status(StatusCode.Ok).send({
    timePoints,
    n0, n5, n9,
    errorRate,
    throughput,
    threads,
    latency,
    connect,
    avgResponseTime,
  })
}
