import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { getScenario } from '../../queries/scenario';

export const getScenarioController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName } = req.params;
  const scenario = await db.oneOrNone(getScenario(projectName, scenarioName));
  res.status(200).send({
    name: scenario.name,
    analysisEnabled: scenario.analysis_enabled,
    deleteSamples: scenario.delete_samples,
    thresholds: {
      enabled: scenario.threshold_enabled,
      percentile: scenario.threshold_percentile,
      throughput: scenario.threshold_throughput,
      errorRate: scenario.threshold_error_rate
    }
  });
};
