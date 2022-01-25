import { Request, Response } from "express"
import { db } from "../../../../db/db"
import { deleteShareToken } from "../../../queries/items"
import { StatusCode } from "../../../utils/status-code"

export const deleteItemShareTokenController = async (req: Request, res: Response) => {
  const { projectName, scenarioName, itemId, tokenId } = req.params
  await db.none(deleteShareToken(projectName, scenarioName, itemId, tokenId))
  res.status(StatusCode.Ok).send()
}
