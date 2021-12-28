import * as express from 'express';
import { Response, NextFunction } from 'express';
import { bodySchemaValidator } from '../schema-validator/schema-validator-middleware';
import { authenticationMiddleware } from '../middleware/authentication-middleware';
import { wrapAsync } from '../errors/error-handler';
import { getTokensController } from '../controllers/api-tokens/get-tokens-controller';
import { createTokenController } from '../controllers/api-tokens/create-token-controller';
import { deleteTokenController } from '../controllers/api-tokens/delete-token-controller';
import { newTokenSchema, deleteTokenSchema } from '../schema-validator/token-schema';
import { IGetUserAuthInfoRequest } from '../middleware/request.model';
import { authorization, AllowedRoles } from '../middleware/authorization-middleware';

export class ApiTokensRoutes {

  public routes(app: express.Application): void {
    app.route('/api/api-tokens')
    .get(
      authenticationMiddleware,
      authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
      // tslint:disable-next-line: max-line-length
      wrapAsync(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => await getTokensController(req, res, next)))
    .post(
      authenticationMiddleware,
      authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
      bodySchemaValidator(newTokenSchema),
      // tslint:disable-next-line: max-line-length
      wrapAsync(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => await createTokenController(req, res, next)))
    .delete(
      authenticationMiddleware,
      authorization([AllowedRoles.Regular, AllowedRoles.Admin]),
      bodySchemaValidator(deleteTokenSchema),
      // tslint:disable-next-line: max-line-length
      wrapAsync(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => await deleteTokenController(req, res, next)));
   }
}
