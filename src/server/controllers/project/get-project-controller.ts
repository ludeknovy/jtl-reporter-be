import { Response } from "express"
import { db } from "../../../db/db"
import { getProject } from "../../queries/projects"
import { StatusCode } from "../../utils/status-code"
import { getProjectMembers } from "../../queries/user-project-access"
import { AllowedRoles } from "../../middleware/authorization-middleware"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"

export const getProjectController = async (req: IGetUserAuthInfoRequest, res: Response) => {
  const { projectName } = req.params
  const projectMembers = []
  const projectSettings = await db.one(getProject(projectName))
  if (req.user.role === AllowedRoles.Admin) {
    const pm = await db.manyOrNone(getProjectMembers(projectName))
    pm.forEach(user => projectMembers.push(user.user_id))
  }
  res.status(StatusCode.Ok).send({ ...projectSettings, projectMembers })
}
