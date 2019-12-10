import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { verifyToken } from '../middleware/auth-middleware';
import { bodySchemaValidator } from '../schema-validator/schema-validator-middleware';
import { authQuerySchema } from '../schema-validator/auth-schema';
import { wrapAsync } from '../errors/error-handler';
import { createNewUserController } from '../controllers/users/create-new-user-controller';
import { getUsersController } from '../controllers/users/get-users-controller';

export class UsersRoutes {
  public routes(app: express.Application): void {
    app.route('/api/users')
      .post(
        verifyToken,
        bodySchemaValidator(authQuerySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await createNewUserController(req, res, next)))

      .get(
        verifyToken,
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getUsersController(req, res, next))
      );
  }
}
