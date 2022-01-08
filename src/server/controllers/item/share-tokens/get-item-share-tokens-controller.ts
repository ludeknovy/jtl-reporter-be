import { Request, Response } from "express"
import { db } from "../../../../db/db"
import { selectShareTokens } from "../../../queries/items"
import { StatusCode } from "../../../utils/status-code"

export const getItemLinksController = async (req: Request, res: Response) => {
  const { projectName, scenarioName, itemId } = req.params
  const shareTokens = await db.manyOrNone(selectShareTokens(projectName, scenarioName, itemId))
  res.status(StatusCode.Ok).send(shareTokens)
}
