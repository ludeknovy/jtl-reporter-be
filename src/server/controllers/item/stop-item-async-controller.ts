import { Request, Response } from "express"
import { db } from "../../../db/db"
import { logger } from "../../../logger"
import { updateItem, updateItemStatus } from "../../queries/items"
import { ReportStatus } from "../../queries/items.model"
import { itemDataProcessing } from "./shared/item-data-processing"
import { StatusCode } from "../../utils/status-code"
import {itemErrorHandler} from "./shared/item-error-handler";

export const stopItemAsyncController = async (req: Request, res: Response) => {
  const { projectName, scenarioName, itemId } = req.params
  const { status } = req.body
  res.status(StatusCode.Ok).send()

  logger.info(`Stopping async item: ${itemId}`)
  try {
    const { reportStatus } = await db
      .one("SELECT report_status as \"reportStatus\" FROM jtl.items WHERE id = $1", [itemId])

    if (reportStatus !== ReportStatus.InProgress) {
      logger.info(`Item: ${itemId} was already processed`)
      return
    }
    await itemDataProcessing({ itemId, projectName, scenarioName })
    if (status) {
      await db.none(updateItemStatus(itemId, status))
    }
  } catch(e) {
    logger.error(`Processing of item ${itemId} failed ${e}`)
    await itemErrorHandler(itemId, e)
  }
}
