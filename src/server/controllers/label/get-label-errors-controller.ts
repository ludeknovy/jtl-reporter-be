import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { getErrorsForLabel } from '../../queries/items';

export const getLabelErrorsController = async (req: Request, res: Response, next: NextFunction) => {
  const { itemId, label } = req.params;
  const queryResult = await db.query(getErrorsForLabel(itemId, label));
  const stat = queryResult.reduce((acc, { error: { rc } }) => {
    acc[rc]
      ? acc[rc]++
      : acc[rc] = 1;
    return acc;
  }, {});
  res.status(200).send({ stat });
};
