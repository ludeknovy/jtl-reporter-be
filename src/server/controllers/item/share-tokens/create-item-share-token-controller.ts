import { Request, Response } from "express"
import { randomBytes } from "crypto"
import { db } from "../../../../db/db"
import { createShareToken } from "../../../queries/items"
import { StatusCode } from "../../../utils/status-code"

export const createItemLinkController = async (req: Request, res: Response) => {
  const { projectName, scenarioName, itemId } = req.params
  const { note } = req.body
  const SIZE = 40
  const token = randomBytes(SIZE).toString("hex")
  await db.none(createShareToken(projectName, scenarioName, itemId, token, note ))
  res.status(StatusCode.Created).send({ token })
}
