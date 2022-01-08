import { Request, Response } from "express"
import { db } from "../../../db/db"
import { deleteItem } from "../../queries/items"
import { logger } from "../../../logger"
import { StatusCode } from "../../utils/status-code"


export const deleteItemController = async (req: Request, res: Response) => {
  const { projectName, scenarioName, itemId } = req.params
  await db.any(deleteItem(projectName, scenarioName, itemId))
  logger.info(`Item ${itemId} deleted.`)
  res.status(StatusCode.NoContent).send()
}
