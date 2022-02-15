import { Response } from "express"
import { db } from "../../../../db/db"
import { createShareToken } from "../../../queries/items"
import { StatusCode } from "../../../utils/status-code"
import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { generateShareToken } from "../utils/generateShareToken"

export const createItemLinkController = async (req: IGetUserAuthInfoRequest, res: Response) => {
  const { projectName, scenarioName, itemId } = req.params
  const { user } = req
  const { note } = req.body
  const token = generateShareToken()
  await db.none(createShareToken(projectName, scenarioName, itemId, token, user.userId, note ))
  res.status(StatusCode.Created).send({ token })
}
