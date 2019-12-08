import { Request, Response, NextFunction } from 'express';
import { db } from "../../../db/db";
import { findItem, findItemStats, findAttachements, findData } from "../../queries/items";
import { ItemDataType } from "../../queries/items.model";
import { findMinMax } from "../../data-stats/helper/stats-fc";

export const getItemController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName, itemId } = req.params;
  const {
    plot_data: plot,
    note,
    environment,
    base_id,
    status, hostname } = await db.one(findItem(itemId, projectName, scenarioName));
  const { stats: statistics, overview } = await db.one(findItemStats(itemId));

  const files = await db.any(findAttachements(itemId));
  const attachements = files.map(_ => _.type);

  const [monitoringLogs = { item_data: [] }] = await db.any(findData(itemId, ItemDataType.MonitoringLogs));
  monitoringLogs.item_data = monitoringLogs.item_data.map((_) => {
    _.ts = parseInt(_.ts) * 1000;
    return _;
  });
  const cpu = monitoringLogs.item_data.map((_) => [_.ts, parseInt(_.cpu)]);
  const mem = monitoringLogs.item_data.map((_) => [_.ts, parseInt(_.mem)]);
  const maxCpu = findMinMax(cpu.map(_ => _[1])).max;
  const maxMem = findMinMax(mem.map(_ => _[1])).max;

  res.status(200).send({
    overview, statistics, status,
    plot, note, environment, hostname,
    attachements, baseId: base_id, isBase: base_id === itemId, monitoringData: { cpu, mem, maxCpu, maxMem }
  });
}