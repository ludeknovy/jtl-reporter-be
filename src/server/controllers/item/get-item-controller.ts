import { Response } from "express"
import { db } from "../../../db/db"
import { findMinMax } from "../../data-stats/helper/stats-fc"
import { findItem, findItemStats, getMonitoringData } from "../../queries/items"
import { StatusCode } from "../../utils/status-code"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { getUserScenarioSettings } from "../../queries/scenario"


export const getItemController = async (req: IGetUserAuthInfoRequest, res: Response) => {
  const { projectName, scenarioName, itemId } = req.params
  const { userId } = req.user
  const {
    plot_data: plot,
    extra_plot_data: extraPlotData,
    histogram_plot_data: histogramPlotData,
    scatter_plot_data: scatterPlotData,
    note,
    environment,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    base_id, resourcesLink,
    status, hostname, reportStatus, thresholds,
    analysisEnabled, zeroErrorToleranceEnabled, topMetricsSettings, name, apdexSettings,
  } = await db.one(findItem(itemId, projectName, scenarioName))
  const { stats: statistics, overview, sutOverview, errors } = await db.one(findItemStats(itemId))

  const userSettings = await db.oneOrNone(getUserScenarioSettings(projectName, scenarioName, userId))

  const monitoring: MonitoringData[] = await db.manyOrNone(getMonitoringData(itemId))

  const monitoringAdjusted = monitoring.map(_ => {
    return Object.assign(_, {
      avgCpu: parseFloat(_.avgCpu),
      avgMem: parseFloat(_.avgMem || "0"),
      timestamp: new Date(_.timestamp).getTime(),
    })
  })

  const maxCpu = findMinMax(monitoring.map(_ => _.avgCpu)).max

  res.status(StatusCode.Ok).json({
    overview, sutOverview, statistics, status, apdexSettings,
    plot: Object.assign({}, plot, { scatterPlotData }),
    extraPlotData, note, environment, hostname, reportStatus, thresholds, analysisEnabled,
    baseId: base_id, isBase: base_id === itemId, zeroErrorToleranceEnabled, topMetricsSettings,
    histogramPlotData,
    name, resourcesLink,
    monitoring: {
      cpu: {
        data: monitoringAdjusted,
        max: maxCpu,
      },
    },
    userSettings: {
      requestStats: userSettings?.request_stats_settings,
    },
    errorSummary: errors,
  })
}


interface MonitoringData { timestamp: Date; avgCpu: string; name: string; avgMem: string }
