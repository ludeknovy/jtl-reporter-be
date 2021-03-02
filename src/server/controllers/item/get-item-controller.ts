import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { findItem, findItemStats, findAttachements, findData } from '../../queries/items';
import { ItemDataType } from '../../queries/items.model';
import { findMinMax } from '../../data-stats/helper/stats-fc';

export const getItemController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName, itemId } = req.params;
  const {
    plot_data: plot,
    note,
    environment,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    base_id,
    status, hostname, reportStatus, thresholds } = await db.one(findItem(itemId, projectName, scenarioName));
  const { stats: statistics, overview } = await db.one(findItemStats(itemId));

  const files = await db.any(findAttachements(itemId));
  const attachements = files.map(_ => _.type);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [monitoringLogs = { item_data: [] }] = await db.any(findData(itemId, ItemDataType.MonitoringLogs));
  monitoringLogs.item_data = monitoringLogs.item_data.map((_) => {
    _.ts = parseInt(_.ts, 10) * 1000;
    return _;
  });
  const cpu = monitoringLogs.item_data.map((_) => [_.ts, parseInt(_.cpu, 10)]);
  const mem = monitoringLogs.item_data.map((_) => [_.ts, parseInt(_.mem, 10)]);
  const maxCpu = findMinMax(cpu.map(_ => _[1])).max;
  const maxMem = findMinMax(mem.map(_ => _[1])).max;

  res.status(200).send({
    overview, statistics, status,
    plot, note, environment, hostname, reportStatus, thresholds,
    attachements, baseId: base_id, isBase: base_id === itemId, monitoringData: { cpu, mem, maxCpu, maxMem }
  });
};
