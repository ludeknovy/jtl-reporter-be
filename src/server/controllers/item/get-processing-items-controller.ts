import { Request, Response } from "express"

import { getProcessingItems } from "../../queries/scenario"
import { db } from "../../../db/db"
import { ReportStatus } from "../../queries/items.model"
import { StatusCode } from "../../utils/status-code"

export const getProcessingItemsController = async (req: Request, res: Response) => {
  const { projectName, scenarioName } = req.params
  const processingItems = await db.any(getProcessingItems(projectName, scenarioName))
  const inprogress = processingItems.filter((_) => _.reportStatus === ReportStatus.InProgress)
  const failed = processingItems.filter((_) => _.reportStatus === ReportStatus.Error)
  res.status(StatusCode.Ok).json({ failed, inprogress })
}
