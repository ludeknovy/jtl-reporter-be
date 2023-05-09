import * as express from "express"
import { Request, Response, NextFunction } from "express"
import { bodySchemaValidator } from "../schema-validator/schema-validator-middleware"
import { wrapAsync } from "../errors/error-handler"
import { loginController } from "../controllers/auth/login-controller"
import { authQuerySchema, authWithTokenSchema, changePasswordSchema } from "../schema-validator/auth-schema"
import { changePasswordController } from "../controllers/auth/change-password-controller"
import { authenticationMiddleware } from "../middleware/authentication-middleware"
import { IGetUserAuthInfoRequest } from "../middleware/request.model"
import { loginWithTokenController } from "../controllers/auth/login-with-token-controller"
import { initUserController } from "../controllers/auth/init-user-controller"
import { initUserScheam } from "../schema-validator/users-schema"

export class AuthRoutes {
    routes(app: express.Application): void {

        app.route("/api/auth/login")
            .post(bodySchemaValidator(authQuerySchema),
                wrapAsync((req: Request, res: Response, next: NextFunction) => loginController(req, res, next)))

        app.route("/api/auth/login-with-token")
            .post(bodySchemaValidator(authWithTokenSchema),
                wrapAsync((req: Request, res: Response, next: NextFunction) =>
                    loginWithTokenController(req, res, next)))

        app.route("/api/auth/change-password")
            .post(
                authenticationMiddleware,
                bodySchemaValidator(changePasswordSchema),
                // eslint-disable-next-line max-len
                wrapAsync((req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => changePasswordController(req, res, next)))

        app.route("/api/auth/initialize-user")
            .post(
                bodySchemaValidator(initUserScheam),
                wrapAsync((req: Request, res: Response, next: NextFunction) =>
                    initUserController(req, res, next)))
    }
}
