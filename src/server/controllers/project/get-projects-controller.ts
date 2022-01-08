import { Request, Response } from "express"
import { db } from "../../../db/db"
import { findProjects } from "../../queries/projects"
import { StatusCodes } from "../../utils/status-codes"

export const getProjectsController = async (req: Request, res: Response, next) => {
  const projects = await db.any(findProjects())
  res.status(StatusCodes.Ok).send(projects)
}
