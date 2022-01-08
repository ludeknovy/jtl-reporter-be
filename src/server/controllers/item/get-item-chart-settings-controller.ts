import { Response } from "express"
import { db } from "../../../db/db"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { getItemChartSettings } from "../../queries/items"
import { StatusCodes } from "../../utils/status-codes"


export const getItemChartSettingsController = async (
  req: IGetUserAuthInfoRequest,
  res: Response) => {
  const { itemId } = req.params
  const { userId } = req.user

  const chartSettings = await db.oneOrNone(getItemChartSettings(itemId, userId))
  res.status(StatusCodes.Ok).send(chartSettings?.settings || [])
}
