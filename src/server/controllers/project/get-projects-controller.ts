import { Request, Response } from "express"
import { db } from "../../../db/db"
import { findProjects } from "../../queries/projects"
import { StatusCode } from "../../utils/status-code"

export const getProjectsController = async (req: Request, res: Response ) => {
  const projects = await db.any(findProjects())
  res.status(StatusCode.Ok).send(projects)
}
