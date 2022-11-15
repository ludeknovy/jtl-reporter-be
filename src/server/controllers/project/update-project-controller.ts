import { Request, Response } from "express"
import { db } from "../../../db/db"
import { updateProjectName } from "../../queries/projects"
import { StatusCode } from "../../utils/status-code"

export const updateProjectController = async (req: Request, res: Response) => {
  const { projectName } = req.params
  const { projectName: newProjectName, topMetricsSettings, upsertScenario } = req.body
  await db.none(updateProjectName(projectName, newProjectName, topMetricsSettings, upsertScenario))
  res.status(StatusCode.NoContent).send()
}
