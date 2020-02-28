import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { authentication } from '../middleware/authentication-middleware';
import { bodySchemaValidator, paramsSchemaValidator } from '../schema-validator/schema-validator-middleware';
import { wrapAsync } from '../errors/error-handler';
import { createNewUserController } from '../controllers/users/create-new-user-controller';
import { getUsersController } from '../controllers/users/get-users-controller';
import { newUserSchema, userSchema } from '../schema-validator/users-schema';
import { deleteUserController } from '../controllers/users/delete-user-controller';
import { authorization, AllowedRoles } from '../middleware/authorization-middleware';

export class UsersRoutes {
  public routes(app: express.Application): void {
    app.route('/api/users')
      .post(
        authentication,
        authorization([AllowedRoles.Admin]),
        bodySchemaValidator(newUserSchema),
        // tslint:disable-next-line: max-line-length
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await createNewUserController(req, res, next)))

      .get(
        authentication,
        authorization([AllowedRoles.Admin]),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getUsersController(req, res, next))
      );

    app.route('/api/users/:userId')
      .delete(
        authentication,
        authorization([AllowedRoles.Admin]),
        paramsSchemaValidator(userSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteUserController(req, res, next))
      );
  }
}
