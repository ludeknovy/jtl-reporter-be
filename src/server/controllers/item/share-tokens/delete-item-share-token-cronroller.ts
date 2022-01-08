import { Request, Response } from "express"
import { db } from "../../../../db/db"
import { deleteShareToken } from "../../../queries/items"

export const deleteItemShareTokenController = async (req: Request, res: Response) => {
  const { projectName, scenarioName, itemId, tokenId } = req.params
  await db.none(deleteShareToken(projectName, scenarioName, itemId, tokenId))
  res.status(200).send()
}
