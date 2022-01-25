import { Request, Response } from "express"
import { db } from "../../../db/db"
import { logger } from "../../../logger"
import { createNewItem } from "../../queries/items"
import { ItemStatus, ReportStatus } from "../../queries/items.model"
import { StatusCode } from "../../utils/status-code"

export const createItemAsyncController = async (req: Request, res: Response) => {
  const { environment, note, status = ItemStatus.None, hostname } = req.body
  const { scenarioName, projectName } = req.params

  logger.info(`Creating new item for scenario: ${scenarioName}`)
  try {

    const item = await db.one(createNewItem(
      scenarioName,
      null,
      environment,
      note,
      status,
      projectName,
      hostname,
      ReportStatus.InProgress
    ))
    const itemId = item.id
    logger.info(`New item for scenario: ${scenarioName} created with id: ${itemId}`)
    res.status(StatusCode.Created).send({ itemId })
  } catch(e) {
    logger.error(`Creating new async item failed ${e}`)
    res.status(StatusCode.InternalError).send()
  }
}
