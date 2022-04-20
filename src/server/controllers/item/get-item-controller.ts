import { Request, Response } from "express"
import { db } from "../../../db/db"
import { findMinMax } from "../../data-stats/helper/stats-fc"
import { findItem, findItemStats, getMonitoringData } from "../../queries/items"
import { StatusCode } from "../../utils/status-code"


export const getItemController = async (req: Request, res: Response) => {
  const { projectName, scenarioName, itemId } = req.params
  const {
    plot_data: plot,
    extra_plot_data: extraPlotData,
    note,
    environment,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    base_id,
    status, hostname, reportStatus, thresholds,
    analysisEnabled, zeroErrorToleranceEnabled, topMetricsSettings, name,
  } = await db.one(findItem(itemId, projectName, scenarioName))
  const { stats: statistics, overview, sutOverview } = await db.one(findItemStats(itemId))

  const monitoring: MonitoringData[] = await db.manyOrNone(getMonitoringData(itemId))

  const monitoringAdjusted = monitoring.map(_ => {
    return Object.assign(_, {
      avgCpu: parseFloat(_.avgCpu),
      avgMem: parseFloat(_.avgMem || "0"),
      timestamp: new Date(_.timestamp).getTime(),
    })
  })

  const maxCpu = findMinMax(monitoring.map(_ => _.avgCpu)).max

  res.status(StatusCode.Ok).send({
    overview, sutOverview, statistics, status,
    plot, extraPlotData, note, environment, hostname, reportStatus, thresholds, analysisEnabled,
    baseId: base_id, isBase: base_id === itemId, zeroErrorToleranceEnabled, topMetricsSettings,
    name,
    monitoring: {
      cpu: {
        data: monitoringAdjusted,
        max: maxCpu,
      },
    },
  })
}


interface MonitoringData { timestamp: Date; avgCpu: string; name: string; avgMem: string }
