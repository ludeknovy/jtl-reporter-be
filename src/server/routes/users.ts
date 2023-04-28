import { Request, Response, NextFunction } from "express"
import * as express from "express"
import { authenticationMiddleware } from "../middleware/authentication-middleware"
import { bodySchemaValidator, paramsSchemaValidator } from "../schema-validator/schema-validator-middleware"
import { wrapAsync } from "../errors/error-handler"
import { createNewUserController } from "../controllers/users/create-new-user-controller"
import { getUsersController } from "../controllers/users/get-users-controller"
import { newUserSchema, userSchema } from "../schema-validator/users-schema"
import { deleteUserController } from "../controllers/users/delete-user-controller"
import { authorizationMiddleware, AllowedRoles } from "../middleware/authorization-middleware"

export class UsersRoutes {
    routes(app: express.Application): void {
        app.route("/api/users")
            .post(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Admin]),
                bodySchemaValidator(newUserSchema),
                // eslint-disable-next-line max-len
                wrapAsync((req: Request, res: Response, next: NextFunction) => createNewUserController(req, res, next)))

            .get(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Admin]),
                wrapAsync((req: Request, res: Response) => getUsersController(req, res))
            )

        app.route("/api/users/:userId")
            .delete(
                authenticationMiddleware,
                authorizationMiddleware([AllowedRoles.Admin]),
                paramsSchemaValidator(userSchema),
                wrapAsync((req: Request, res: Response) => deleteUserController(req, res))
            )
    }
}
