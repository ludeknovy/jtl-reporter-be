import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { IGetUserAuthInfoRequest } from '../../middleware/request.model';
import { upsertItemChartSettings } from '../../queries/items';


export const upsertItemChartSettingsController = async (
  req: IGetUserAuthInfoRequest,
  res: Response, next: NextFunction) => {
  const settings = req.body;
  const { itemId } = req.params;
  const { userId } = req.user;
  await db.none(upsertItemChartSettings(itemId, userId, JSON.stringify(settings)));
  res.status(200).send();
};
