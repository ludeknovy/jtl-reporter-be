import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { wrapAsync } from '../errors/error-handler';
import { bodySchemaValidator, paramsSchemaValidator } from '../schema-validator/schema-validator-middleware';
import { createNewProjectSchema, projectNameParam } from '../schema-validator/project-schema';
import { createProjectController } from '../controllers/project/create-project-controller';
import { getProjectsController } from '../controllers/project/get-projects-controller';
import { getLatestItemsControllers } from '../controllers/project/get-latest-items-controllers';
import { deleteProjectController } from '../controllers/project/delete-project-controller';
import { updateProjectController } from '../controllers/project/update-project-controller';
import { getProjectStatsController } from '../controllers/project/get-projects-stats-controller';
import { authenticationMiddleware } from '../middleware/auth-middleware';

export class ProjectRoutes {
  public routes(app: express.Application): void {

    app.route('/api/projects')
      .post(
        authenticationMiddleware,
        bodySchemaValidator(createNewProjectSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await createProjectController(req, res, next)))

      .get(
        authenticationMiddleware,
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getProjectsController(req, res, next)));

    app.route('/api/projects/latest-items')
      .get(
        authenticationMiddleware,
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getLatestItemsControllers(req, res, next)));

    app.route('/api/projects/overall-stats')
      .get(
        authenticationMiddleware,
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await getProjectStatsController(req, res, next)));

    app.route('/api/projects/:projectName')
      .delete(
        authenticationMiddleware,
        paramsSchemaValidator(projectNameParam),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await deleteProjectController(req, res, next)))

      .put(
        authenticationMiddleware,
        paramsSchemaValidator(projectNameParam),
        bodySchemaValidator(createNewProjectSchema),
        // eslint-disable-next-line max-len
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => await updateProjectController(req, res, next)));
  }

}
