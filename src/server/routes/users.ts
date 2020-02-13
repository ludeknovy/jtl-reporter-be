import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { verifyToken } from '../middleware/auth-middleware';
import { bodySchemaValidator, paramsSchemaValidator } from '../schema-validator/schema-validator-middleware';
import { wrapAsync } from '../errors/error-handler';
import { createNewUserController } from '../controllers/users/create-new-user-controller';
import { getUsersController } from '../controllers/users/get-users-controller';
import { newUserSchema, userSchema } from '../schema-validator/users-schema';
import { deleteUserController } from '../controllers/users/delete-user-controller';

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
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getUsersController(req, res, next))
      );

    app.route('/api/users/:userId')
      .get(
        verifyToken,
        paramsSchemaValidator(userSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteUserController(req, res, next))
      );
  }
}
