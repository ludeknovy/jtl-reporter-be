import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { findMinMax } from '../../data-stats/helper/stats-fc';
import { findItem, findItemStats, findAttachements, getMonitoringData } from '../../queries/items';


export const getItemController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName, itemId } = req.params;
  const {
    plot_data: plot,
    note,
    environment,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    base_id,
    status, hostname, reportStatus, thresholds,
    analysisEnabled } = await db.one(findItem(itemId, projectName, scenarioName));
  const { stats: statistics, overview, sutOverview } = await db.one(findItemStats(itemId));

  const files = await db.any(findAttachements(itemId));
  const attachements = files.map(_ => _.type);

  const monitoring: MonitoringData[] = await db.manyOrNone(getMonitoringData(itemId));

  const monitoringAdjusted = monitoring.map(_ => {
    return Object.assign(_, { avgCpu: parseFloat(_.avgCpu) });
  });

  const maxCpu = findMinMax(monitoring.map(_ => _.avgCpu)).max;

  res.status(200).send({
    overview, sutOverview, statistics, status,
    plot, note, environment, hostname, reportStatus, thresholds, analysisEnabled,
    attachements, baseId: base_id, isBase: base_id === itemId, monitoring: {
      cpu: {
        data: monitoringAdjusted,
        max: maxCpu
      }
    }
  });
};


interface MonitoringData { timestamp: Date; avgCpu: string; name: string }
