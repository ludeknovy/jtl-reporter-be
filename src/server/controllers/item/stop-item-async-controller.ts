import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { logger } from '../../../logger';
import { updateItem } from '../../queries/items';
import { ReportStatus } from '../../queries/items.model';
import { itemDataProcessing } from './shared/item-data-processing';

export const stopItemAsyncController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName, itemId } = req.params;

  logger.info(`Stopping async item: ${itemId}`);
  try {
    const { reportStatus } = await db
      .one('SELECT report_status as "reportStatus" FROM jtl.items WHERE id = $1', [itemId]);

    if (reportStatus !== ReportStatus.InProgress) {
      return res.status(400).send('Already processed');
    }
    await itemDataProcessing({ itemId, projectName, scenarioName });
  } catch (e) {
    logger.error(`Processing of item ${itemId} failed ${e}`);
    await db.none(updateItem(itemId, ReportStatus.Error, null));
    res.status(500).send();
  }
};
