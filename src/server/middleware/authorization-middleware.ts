import * as boom from "boom"

export const authorizationMiddleware = (allowedRoles: AllowedRoles[]) => {
  return (request, response, next) => {
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
