import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { deleteItem, selectDataId } from '../../queries/items';
import { MongoUtils } from '../../../db/mongoUtil';
import { logger } from '../../../logger';


export const deleteItemController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName, scenarioName, itemId } = req.params;
  const jtlDb = MongoUtils.getClient().db('jtl-data');
  const collection = jtlDb.collection('data-chunks');
  const { data_id: dataId} = await db.one(selectDataId(itemId, projectName, scenarioName));
  logger.info(`About to delete data from mongo for dataId: ${dataId}`);
  await db.any(deleteItem(projectName, scenarioName, itemId));
  const { deletedCount } = await collection.deleteMany({ dataId });
  logger.info(`Item ${itemId} deleted from postgres. Deleted ${deletedCount} documents from mongo`);
  res.status(204).send();
};
