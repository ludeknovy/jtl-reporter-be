import * as boom from "boom"
import { logger } from "../../logger"

export const authorizationMiddleware = (allowedRoles: AllowedRoles[]) => {
  return (request, response, next) => {
    logger.info(`User ${request.user.userId} with role ${request.user.role} asking access to a resource with allowed roles: ${allowedRoles}`)
    if (allowedRoles.find((role) => role === request.user.role)) {
      // role is allowed, so continue on the next middleware
      next()
    } else {
      next(boom.forbidden(`Not enough permission to do this`))
    }
  }
}


export enum AllowedRoles {
  Admin = "admin",
  Operator = "operator",
  Readonly = "readonly"
}
