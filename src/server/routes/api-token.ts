import * as express from "express"
import { Response, NextFunction } from "express"
import { bodySchemaValidator } from "../schema-validator/schema-validator-middleware"
import { authenticationMiddleware } from "../middleware/authentication-middleware"
import { wrapAsync } from "../errors/error-handler"
import { getTokensController } from "../controllers/api-tokens/get-tokens-controller"
import { createTokenController } from "../controllers/api-tokens/create-token-controller"
import { deleteTokenController } from "../controllers/api-tokens/delete-token-controller"
import { newTokenSchema, deleteTokenSchema } from "../schema-validator/token-schema"
import { IGetUserAuthInfoRequest } from "../middleware/request.model"
import { authorizationMiddleware, AllowedRoles } from "../middleware/authorization-middleware"

export class ApiTokensRoutes {

  routes(app: express.Application): void {
    app.route("/api/api-tokens")
    .get(
      authenticationMiddleware,
      authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
      wrapAsync((req: IGetUserAuthInfoRequest, res: Response) => getTokensController(req, res)))

    .post(
      authenticationMiddleware,
      authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
      bodySchemaValidator(newTokenSchema),
      wrapAsync((req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) =>
        createTokenController(req, res, next)))

    .delete(
      authenticationMiddleware,
      authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
      bodySchemaValidator(deleteTokenSchema),
      wrapAsync((req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) =>
        deleteTokenController(req, res, next)))
    }
  }

