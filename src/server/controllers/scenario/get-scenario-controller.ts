import { Request, Response } from "express"
import { db } from "../../../db/db"
import { getScenario } from "../../queries/scenario"
import { StatusCode } from "../../utils/status-code"

export const getScenarioController = async (req: Request, res: Response) => {
  const { projectName, scenarioName } = req.params
  const scenario = await db.oneOrNone(getScenario(projectName, scenarioName))
  res.status(StatusCode.Ok).send({
    name: scenario.name,
    analysisEnabled: scenario.analysis_enabled,
    zeroErrorToleranceEnabled: scenario.zero_error_tolerance_enabled,
    deleteSamples: scenario.delete_samples,
    keepTestRunsPeriod: scenario.keep_test_runs_period,
    thresholds: {
      enabled: scenario.threshold_enabled,
      percentile: scenario.threshold_percentile,
      throughput: scenario.threshold_throughput,
      errorRate: scenario.threshold_error_rate,
    },
  })
}
