import { Request, Response } from "express"
import { db } from "../../../../db/db"
import { createScenarioNotification } from "../../../queries/scenario"

export const createScenarioNotificationController = async (req: Request, res: Response) => {
  const { projectName, scenarioName } = req.params
  const { type, url, name } = req.body
  await db.none(createScenarioNotification(projectName, scenarioName, type, url, name))
  res.status(201).send()
}
