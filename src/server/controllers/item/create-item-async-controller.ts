import boom = require('boom');
import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { logger } from '../../../logger';
import { createNewItem } from '../../queries/items';
import { ItemStatus, ReportStatus } from '../../queries/items.model';
import * as uuid from 'uuid';

export const createItemAsyncController = async (req: Request, res: Response, next: NextFunction) => {
  const { environment, note, status = ItemStatus.None, hostname } = req.body;
  const { scenarioName, projectName } = req.params;

  logger.info(`Creating new item for scenario: ${scenarioName}`);
  try {
    let itemId;
    const dataId = uuid();

    const item = await db.one(createNewItem(
      scenarioName,
      null,
      environment,
      note,
      status,
      projectName,
      hostname,
      ReportStatus.InProgress,
      dataId
    ));
    itemId = item.id;
    logger.info(`New item for scenario: ${scenarioName} created with id: ${itemId} and dataId: ${dataId}`);
    res.status(200).send({ itemId, dataId });
  } catch (e) {
    logger.error(`Creating new async item failed ${e}`);
    res.status(500).send();
  }
};
