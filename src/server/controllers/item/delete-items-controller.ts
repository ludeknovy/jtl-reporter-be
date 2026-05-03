import { Request, Response } from "express"
import { db } from "../../../db/db"
import { deleteItems } from "../../queries/items"
import { logger } from "../../../logger"
import { StatusCode } from "../../utils/status-code"

export const deleteItemsController = async (req: Request, res: Response) => {
  const { projectName, scenarioName } = req.params
  const { itemIds } = req.body

  await db.any(deleteItems(projectName, scenarioName, itemIds))

  logger.info(`Items ${itemIds.join(", ")} deleted.`)
  res.status(StatusCode.NoContent).send()
}
