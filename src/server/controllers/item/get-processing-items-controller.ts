import { Request, Response } from "express"

import { getProcessingItems } from "../../queries/scenario"
import { db } from "../../../db/db"
import { ReportStatus } from "../../queries/items.model"
import { StatusCodes } from "../../utils/status-codes"

export const getProcessingItemsController = async (req: Request, res: Response) => {
  const { projectName, scenarioName } = req.params
  const processingItems = await db.any(getProcessingItems(projectName, scenarioName))
  const inprogress = processingItems.filter((_) => _.reportStatus === ReportStatus.InProgress)
  const failed = processingItems.filter((_) => _.reportStatus === ReportStatus.Error)
  res.status(StatusCodes.Ok).send({ failed, inprogress })
}
