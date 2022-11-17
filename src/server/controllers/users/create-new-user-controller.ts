import { Request, Response, NextFunction } from "express"
import { createUser } from "../../queries/auth"
import { db } from "../../../db/db"
import * as boom from "boom"
import { hashPassword } from "../auth/helper/passwords"
import { StatusCode } from "../../utils/status-code"
import {allowAdminUserForAllProjects} from "../../queries/user-project-access";


export const createNewUserController = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password, role } = req.body

  try {
    const userId = await createUserInDB(username, password, role)
    console.log({ userId })
    console.log({ role })
    if (role === "admin") {
      await db.query(allowAdminUserForAllProjects(userId.id))
    }

    res.status(StatusCode.Created).send()
  } catch(error) {
    if (error.routine === "_bt_check_unique") {
      return next(boom.conflict("Username already exists"))
    }
    return next(error)
  }
}

export const createUserInDB = async (username, password, role): Promise<{ id: string }> => {
  const passwordHash = await hashPassword(password)
  return db.one(createUser(username, passwordHash, role))
}
