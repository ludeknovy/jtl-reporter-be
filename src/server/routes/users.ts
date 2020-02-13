import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { verifyToken } from '../middleware/auth-middleware';
import { bodySchemaValidator } from '../schema-validator/schema-validator-middleware';
import { wrapAsync } from '../errors/error-handler';
import { createNewUserController } from '../controllers/users/create-new-user-controller';
import { getUsersController } from '../controllers/users/get-users-controller';
import { newUserSchema } from '../schema-validator/users-schema';

export class UsersRoutes {
  public routes(app: express.Application): void {
    app.route('/api/users')
      .post(
        verifyToken,
        bodySchemaValidator(newUserSchema),
        // tslint:disable-next-line: max-line-length
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await createNewUserController(req, res, next)))

      .get(
        verifyToken,
        // tslint:disable-next-line: max-line-length
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getUsersController(req, res, next))
      );
    
    app.route('/api/users/:id')
      .delete(
        verifyToken
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await )
      )
  }
}
