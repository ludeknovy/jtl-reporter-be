import { Request, Response } from "express"
import { db } from "../../../db/db"
import { getProject } from "../../queries/projects"
import { StatusCode } from "../../utils/status-code"

export const getProjectController = async (req: Request, res: Response) => {
  const { projectName } = req.params
  const projectSettings = await db.one(getProject(projectName))
  res.status(StatusCode.Ok).send(projectSettings)
}
