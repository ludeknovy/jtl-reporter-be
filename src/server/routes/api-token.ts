import * as express from "express"
import { Request, Response, NextFunction } from "express"
import { bodySchemaValidator } from "../schema-validator/schema-validator-middleware"
import { authenticationMiddleware } from "../middleware/auth-middleware"
import { wrapAsync } from "../errors/error-handler"
import { getTokensController } from "../controllers/api-tokens/get-tokens-controller"
import { createTokenController } from "../controllers/api-tokens/create-token-controller"
import { deleteTokenController } from "../controllers/api-tokens/delete-token-controller"
import { newTokenSchema, deleteTokenSchema } from "../schema-validator/token-schema"
import { IGetUserAuthInfoRequest } from "../middleware/request.model"

export class ApiTokensRoutes {

  routes(app: express.Application): void {
    app.route("/api/api-tokens")
      .get(
        authenticationMiddleware,
        wrapAsync( (req: Request, res: Response) => getTokensController(req, res)))
      .post(
        authenticationMiddleware,
        bodySchemaValidator(newTokenSchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => createTokenController(req, res, next)))
      .delete(
        authenticationMiddleware,
        bodySchemaValidator(deleteTokenSchema),
        // eslint-disable-next-line max-len
        wrapAsync( (req: Request, res: Response) => deleteTokenController(req, res)))
  }
}
