import { Request, Response, NextFunction } from "express"
import * as express from "express"
import { wrapAsync } from "../errors/error-handler"
import { bodySchemaValidator, paramsSchemaValidator } from "../schema-validator/schema-validator-middleware"
import { createNewProjectSchema, projectNameParam, updateProjectSchema } from "../schema-validator/project-schema"
import { createProjectController } from "../controllers/project/create-project-controller"
import { getProjectsController } from "../controllers/project/get-projects-controller"
import { getLatestItemsControllers } from "../controllers/project/get-latest-items-controllers"
import { deleteProjectController } from "../controllers/project/delete-project-controller"
import { updateProjectController } from "../controllers/project/update-project-controller"
import { getProjectStatsController } from "../controllers/project/get-projects-stats-controller"
import { authenticationMiddleware } from "../middleware/auth-middleware"
import { getProjectController } from "../controllers/project/get-project-controller"

export class ProjectRoutes {
  routes(app: express.Application): void {

    app.route("/api/projects")
      .post(
        authenticationMiddleware,
        bodySchemaValidator(createNewProjectSchema),
        wrapAsync( (req: Request, res: Response, next: NextFunction) => createProjectController(req, res, next)))

      .get(
        authenticationMiddleware,
        wrapAsync( (req: Request, res: Response, next: NextFunction) => getProjectsController(req, res, next)))

    app.route("/api/projects/latest-items")
      .get(
        authenticationMiddleware,
        wrapAsync( (req: Request, res: Response ) => getLatestItemsControllers(req, res)))

    app.route("/api/projects/overall-stats")
      .get(
        authenticationMiddleware,
        wrapAsync( (req: Request, res: Response ) => getProjectStatsController(req, res)))

    app.route("/api/projects/:projectName")
      .delete(
        authenticationMiddleware,
        paramsSchemaValidator(projectNameParam),
        wrapAsync( (req: Request, res: Response) => deleteProjectController(req, res)))

      .get(
        authenticationMiddleware,
        paramsSchemaValidator(projectNameParam),
        wrapAsync( (req: Request, res: Response) => getProjectController(req, res)))


      .put(
        authenticationMiddleware,
        paramsSchemaValidator(projectNameParam),
        bodySchemaValidator(updateProjectSchema),
        wrapAsync( (req: Request, res: Response) => updateProjectController(req, res)))
  }

}
