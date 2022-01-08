import { Request, Response } from "express"
import { db } from "../../../db/db"
import { deleteProject } from "../../queries/projects"
import { StatusCode } from "../../utils/status-code"

export const deleteProjectController = async (req: Request, res: Response) => {
  const { projectName } = req.params
  await db.none(deleteProject(projectName))
  res.status(StatusCode.NoContent).send()
}
