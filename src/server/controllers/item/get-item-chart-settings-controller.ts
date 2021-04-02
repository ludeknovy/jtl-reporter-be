import { Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { IGetUserAuthInfoRequest } from '../../middleware/request.model';
import { getItemChartSettings } from '../../queries/items';


export const getItemChartSettingsController = async (
  req: IGetUserAuthInfoRequest,
  res: Response, next: NextFunction) => {
  const { itemId } = req.params;
  const { userId } = req.user;
  const chartSettings = await db.oneOrNone(getItemChartSettings(itemId, userId)) ;
  res.status(200).send(chartSettings?.settings || []);
};
