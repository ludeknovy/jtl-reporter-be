import boom = require("boom")
import { Request, Response, NextFunction } from "express"
import { db } from "../../../db/db"
import { AllowedRoles } from "../../middleware/authorization-middleware"
import { getUsers } from "../../queries/auth"
import { createNewUserController } from "../users/create-new-user-controller"

export const initUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await db.manyOrNone(getUsers())
    if (users && users.length > 0) {
      return next(boom.forbidden("User was already initialized"))
    }
    req.body.role = AllowedRoles.Admin
    await createNewUserController(req, res, next)


  } catch(error) {
    return next(error)
  }

}
