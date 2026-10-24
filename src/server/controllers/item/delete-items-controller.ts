import { Request, Response } from "express"
import { db } from "../../../db/db"
import { deleteItems } from "../../queries/items"
import { logger } from "../../../logger"
import { StatusCode } from "../../utils/status-code"

interface DeleteItemsParams {
  projectName: string
  scenarioName: string
}

interface DeleteItemsBody {
  itemIds: string[]
}

export const deleteItemsController = async (
  req: Request<DeleteItemsParams, unknown, DeleteItemsBody>, res: Response) => {
  const { projectName, scenarioName } = req.params
  const { itemIds } = req.body

  await db.any(deleteItems(projectName, scenarioName, itemIds))

  logger.info(`Items ${itemIds.join(", ")} deleted.`)
  res.status(StatusCode.NoContent).send()
}
