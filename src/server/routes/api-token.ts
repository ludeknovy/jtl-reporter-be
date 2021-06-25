import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { bodySchemaValidator } from '../schema-validator/schema-validator-middleware';
import { authenticationMiddleware } from '../middleware/auth-middleware';
import { wrapAsync } from '../errors/error-handler';
import { getTokensController } from '../controllers/api-tokens/get-tokens-controller';
import { createTokenController } from '../controllers/api-tokens/create-token-controller';
import { deleteTokenController } from '../controllers/api-tokens/delete-token-controlle';
import { newTokenSchema, deleteTokenSchema } from '../schema-validator/token-schema';
import { IGetUserAuthInfoRequest } from '../middleware/request.model';

export class ApiTokensRoutes {

  public routes(app: express.Application): void {
    app.route('/api/api-tokens')
      .get(
        authenticationMiddleware,
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getTokensController(req, res, next)))
      .post(
        authenticationMiddleware,
        bodySchemaValidator(newTokenSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => await createTokenController(req, res, next)))
      .delete(
        authenticationMiddleware,
        bodySchemaValidator(deleteTokenSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteTokenController(req, res, next)));
  }
}
