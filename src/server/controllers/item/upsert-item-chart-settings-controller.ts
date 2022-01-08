import { Response } from "express"
import { db } from "../../../db/db"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { upsertItemChartSettings } from "../../queries/items"
import {StatusCodes} from "../../utils/status-codes";


export const upsertItemChartSettingsController = async (
  req: IGetUserAuthInfoRequest,
  res: Response) => {
  const settings = req.body
  const { itemId } = req.params
  const { userId } = req.user
  console.log("HERE")
  await db.none(upsertItemChartSettings(itemId, userId, JSON.stringify(settings)))
  res.status(StatusCodes.Ok).send()
}
