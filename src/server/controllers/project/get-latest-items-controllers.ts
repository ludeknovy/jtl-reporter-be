import { Request, Response } from "express"
import { db } from "../../../db/db"
import { latestItems } from "../../queries/projects"

export const getLatestItemsControllers = async (req: Request, res: Response) => {
  const items = await db.many(latestItems())
  res.status(200).send(items)
}
