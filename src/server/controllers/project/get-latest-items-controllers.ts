import { Request, Response } from "express"
import { db } from "../../../db/db"
import { latestItems } from "../../queries/projects"
import { StatusCode } from "../../utils/status-code"

export const getLatestItemsControllers = async (req: Request, res: Response) => {
  const items = await db.many(latestItems())
  res.status(StatusCode.Ok).send(items)
}
