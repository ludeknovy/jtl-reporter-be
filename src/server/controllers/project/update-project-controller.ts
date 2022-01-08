import { Request, Response } from "express"
import { db } from "../../../db/db"
import { updateProjectName } from "../../queries/projects"

export const updateProjectController = async (req: Request, res: Response) => {
  const { projectName } = req.params
  const { projectName: newProjectName, topMetricsSettings } = req.body
  await db.none(updateProjectName(projectName, newProjectName, topMetricsSettings))
  res.status(204).send()
}
