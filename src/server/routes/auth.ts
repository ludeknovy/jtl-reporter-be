import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { bodySchemaValidator } from '../schema-validator/schema-validator-middleware';
import { wrapAsync } from '../errors/error-handler';
import { loginController } from '../controllers/auth/login-controller';
import { authQuerySchema, changePasswordSchema, } from '../schema-validator/auth-schema';
import { changePasswordController } from '../controllers/auth/change-password-controller';
import { verifyToken } from '../middleware/auth-middleware';
import { IGetUserAuthInfoRequest } from '../middleware/request.model';

export class AuthRoutes {
  public routes(app: express.Application): void {

    app.route('/api/auth/login')
      .post(bodySchemaValidator(authQuerySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await loginController(req, res, next)));

    app.route('/api/auth/change-password')
      .post(
        verifyToken,
        bodySchemaValidator(changePasswordSchema),
        wrapAsync(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => await changePasswordController(req, res, next)));

  }
}
