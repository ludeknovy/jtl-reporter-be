import { Response } from "express"
import { db } from "../../../db/db"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { getItemChartSettings } from "../../queries/items"
import { StatusCode } from "../../utils/status-code"


export const getItemChartSettingsController = async (
  req: IGetUserAuthInfoRequest,
  res: Response) => {
  const { itemId } = req.params
  const { userId } = req.user

  const chartSettings = await db.oneOrNone(getItemChartSettings(itemId, userId))
  res.status(StatusCode.Ok).send(chartSettings?.settings || [])
}
