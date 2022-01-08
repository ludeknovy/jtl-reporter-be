import { Request, Response } from "express"
import { db } from "../../../../db/db"
import { deleteScenarioNotification } from "../../../queries/scenario"
import { StatusCode } from "../../../utils/status-code"

export const deleteScenarioNotificationController = async (req: Request, res: Response) => {
  const { projectName, scenarioName, notificationId } = req.params
  await db.none(deleteScenarioNotification(projectName, scenarioName, notificationId))
  res.status(StatusCode.NoContent).send()
}
