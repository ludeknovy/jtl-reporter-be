import { Response } from "express"
import { db } from "../../../db/db"
import { latestItems } from "../../queries/projects"
import { StatusCode } from "../../utils/status-code"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"

export const getLatestItemsControllers = async (req: IGetUserAuthInfoRequest, res: Response) => {
  const user = req.user
  const items = await db.manyOrNone(latestItems(user.userId))
  res.status(StatusCode.Ok).json(items)
}
