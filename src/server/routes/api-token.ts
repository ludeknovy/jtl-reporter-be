import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { bodySchemaValidator } from '../schema-validator/schema-validator-middleware';
import { verifyToken } from '../middleware/auth-middleware';
import { wrapAsync } from '../errors/error-handler';
import { getTokensController } from '../controllers/api-tokens/get-tokens-controller';
import { createTokenController } from '../controllers/api-tokens/create-token-controller';
import { deleteTokenController } from '../controllers/api-tokens/delete-token-controlle';
import { newTokenSchema, deleteTokenSchema } from '../schema-validator/token-schema';

export class ApiTokensRoutes {

  public routes(app: express.Application): void {
    app.route('/api/api-tokens')
    .get(
      verifyToken,
      wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getTokensController(req, res, next)))
    .post(
      verifyToken,
      bodySchemaValidator(newTokenSchema),
      wrapAsync(async (req: Request, res: Response, next: NextFunction) => await createTokenController(req, res, next)))
    .delete(
      verifyToken,
      bodySchemaValidator(deleteTokenSchema),
      wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteTokenController(req, res, next)));
   }
}