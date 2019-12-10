import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { paramsSchemaValidator, queryParamsValidator } from '../schema-validator/schema-validator-middleware';
import { wrapAsync } from '../errors/error-handler';
import { labelParamSchema, labelQuerySchema } from '../schema-validator/item-schema';
import { getLabelTrendController } from '../controllers/label/get-label-trend-controller';
import { getLabelVirtualUsersController } from '../controllers/label/get-label-vu-controllers';
import { getLabelErrorsController } from '../controllers/label/get-label-errors-controller';
import { verifyToken } from '../middleware/auth-middleware';

export class LabelRoutes {

  public routes(app: express.Application): void {

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/label/:label/trend')
      .get(
        verifyToken,
        paramsSchemaValidator(labelParamSchema),
        queryParamsValidator(labelQuerySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getLabelTrendController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/label/:label/virtual-users')
      .get(
        verifyToken,
        paramsSchemaValidator(labelParamSchema),
        queryParamsValidator(labelQuerySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getLabelVirtualUsersController(req, res, next)));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/label/:label/errors')
      .get(
        verifyToken,
        paramsSchemaValidator(labelParamSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getLabelErrorsController(req, res, next)));
  }
}
