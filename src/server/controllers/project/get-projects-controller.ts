import { Response } from "express"
import { db } from "../../../db/db"
import { findProjects } from "../../queries/projects"
import { StatusCode } from "../../utils/status-code"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"

export const getProjectsController = async (req: IGetUserAuthInfoRequest, res: Response ) => {
  const user = req.user
  const projects = await db.any(findProjects(user.userId))
  res.status(StatusCode.Ok).json(projects)
}
