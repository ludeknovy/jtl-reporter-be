import { Request, Response } from "express"
import { randomBytes } from "crypto"
import { db } from "../../../../db/db"
import { createShareToken } from "../../../queries/items"

export const createItemLinkController = async (req: Request, res: Response) => {
  const { projectName, scenarioName, itemId } = req.params
  const { note } = req.body
  const token = randomBytes(40).toString("hex")
  await db.none(createShareToken(projectName, scenarioName, itemId, token, note ))
  res.status(201).send({ token })
}
