import { Request, Response } from "express"
import { db } from "../../../../db/db"
import { createScenarioNotification } from "../../../queries/scenario"
import { StatusCode } from "../../../utils/status-code"

export const createScenarioNotificationController = async (req: Request, res: Response) => {
  const { projectName, scenarioName } = req.params
  const { type, url, name, channel } = req.body
  await db.none(createScenarioNotification(projectName, scenarioName, channel, url, name, type))
  res.status(StatusCode.Created).send()
}
