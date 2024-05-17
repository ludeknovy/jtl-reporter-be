import boom = require("boom")
import { Request, Response, NextFunction } from "express"
import { db } from "../../../db/db"
import { AllowedRoles } from "../../middleware/authorization-middleware"
import { getUsers, getRoleMigration } from "../../queries/auth"
import { createNewUserController } from "../users/create-new-user-controller"
import { MigrationNotFinishedException } from "../../errors/migration-not-finished-exception"

export const initUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const roleMigration = await db.oneOrNone(getRoleMigration())
        if (!roleMigration) {
            throw new MigrationNotFinishedException("role migration has not finished")
        }
        const users = await db.manyOrNone(getUsers())
        if (users && users.length > 0) {
            return next(boom.forbidden("User was already initialized"))
        }
        req.body.role = AllowedRoles.Admin
        await createNewUserController(req, res, next)

    } catch(error) {
        if (error.code === "42P01" || error instanceof MigrationNotFinishedException) {
            return next(boom.preconditionRequired("Migrations were not finished, please try it again later."))
        }
        return next(error)
    }

}
