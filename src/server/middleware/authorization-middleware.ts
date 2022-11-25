import * as boom from "boom"
import { logger } from "../../logger"
import { db } from "../../db/db"
import { isUserAuthorizedForProject } from "../queries/user-project-access"

export const authorizationMiddleware = (allowedRoles: AllowedRoles[]) => {
  return async (request, response, next) => {
    const user = request.user
    logger.info(`User ${user.userId} with role ${user.role} accessing a resource with allowed roles: ${allowedRoles}`)
    // check project authorization
    const { projectName } = request.params
    if (projectName && user?.userId && user?.role !== AllowedRoles.Admin) {
      logger.info(`User ${user.userId} with role ${user.role} accessing a resource within ${projectName} project`)
      const userAuthorizedForProject = await db.oneOrNone(isUserAuthorizedForProject(projectName, user.userId))
      if (!userAuthorizedForProject && user.role) {
        logger.info(`User ${user.userId} has no access to project ${projectName}`)
        return next(boom.forbidden(`You dont have permission to access`))
      }
      // user is authorized, we can proceed
    }

    // check role authorization
    if (allowedRoles.find((role) => role === request.user.role)) {
      // role is allowed, so continue on the next middleware
      return next()
    }
    next(boom.forbidden(`Not enough permission to do this`))

  }
}


export enum AllowedRoles {
  Admin = "admin",
  Operator = "operator",
  Readonly = "readonly"
}
