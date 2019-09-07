import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import * as boom from 'boom';
import { wrapAsync } from '../errors/error-handler';
import {
  isExistingProject,
  createNewProject,
  findProjects,
  latestItems,
  deleteProject,
  updateProjectName
} from '../queries/projects';
import { db } from '../../db/db';
import { bodySchemaValidator, paramsSchemaValidator } from '../schema-validator/schema-validator-middleware';
import { createNewProjectSchema, projectNameParam } from '../schema-validator/project-schema';
import { dashboardStats } from '../queries/items';

export class ProjectRoutes {
  private projects;
  public routes(app: express.Application): void {

    app.route('/api/projects')
      .post(
        bodySchemaValidator(createNewProjectSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { body: { projectName } } = req;
          const { exists } = await db.one(isExistingProject(projectName));
          if (!exists) {
            await db.none(createNewProject(projectName));
          } else {
            return next(boom.conflict('Project already exists'));
          }
          res.status(201).send();
        }))

      .get(wrapAsync(async (req: Request, res: Response) => {
        this.projects = await db.any(findProjects());
        res.status(200).send(this.projects);
      }));

    app.route('/api/projects/latest-items')
      .get(wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
        const items = await db.many(latestItems());
        res.status(200).send(items);
      }));

    app.route('/api/projects/overall-stats')
      .get(wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { avgVu, avgDuration, totalDuration, totalCount } = await db.one(dashboardStats());
        res.status(200).send({
          avgVu: parseInt(avgVu, 10),
          avgDuration: parseInt(avgDuration, 10),
          totalDuration: parseInt(totalDuration, 10),
          totalRunCount: parseInt(totalCount, 10)
        });
      }));

    app.route('/api/projects/:projectName')
      .delete(
        paramsSchemaValidator(projectNameParam),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { projectName } = req.params;
          await db.none(deleteProject(projectName));
          res.status(204).send();
        }))

      .put(
        paramsSchemaValidator(projectNameParam),
        bodySchemaValidator(createNewProjectSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { projectName } = req.params;
          const { projectName: newProjectName } = req.body;
          await db.none(updateProjectName(projectName, newProjectName));
          res.status(204).send();
        }));
  }

}
