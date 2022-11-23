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
import { getProjectController } from "../controllers/project/get-project-controller"
import { AllowedRoles, authorizationMiddleware } from "../middleware/authorization-middleware"
import { authenticationMiddleware } from "../middleware/authentication-middleware"
import { IGetUserAuthInfoRequest } from "../middleware/request.model"

export class ProjectRoutes {
  routes(app: express.Application): void {

    app.route("/api/projects")
      .post(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
        bodySchemaValidator(createNewProjectSchema),
        wrapAsync( (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) =>
            createProjectController(req, res, next)))

      .get(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
        wrapAsync( (req: IGetUserAuthInfoRequest, res: Response) => getProjectsController(req, res)))

    app.route("/api/projects/latest-items")
      .get(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
        wrapAsync( (req: IGetUserAuthInfoRequest, res: Response ) => getLatestItemsControllers(req, res)))

    app.route("/api/projects/overall-stats")
      .get(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
        wrapAsync( (req: Request, res: Response ) => getProjectStatsController(req, res)))

    app.route("/api/projects/:projectName")
      .delete(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(projectNameParam),
        wrapAsync( (req: Request, res: Response) => deleteProjectController(req, res)))

      .get(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Readonly, AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(projectNameParam),
        wrapAsync( (req: IGetUserAuthInfoRequest, res: Response) => getProjectController(req, res)))


      .put(
        authenticationMiddleware,
        authorizationMiddleware([AllowedRoles.Operator, AllowedRoles.Admin]),
        paramsSchemaValidator(projectNameParam),
        bodySchemaValidator(updateProjectSchema),
        wrapAsync( (req: Request, res: Response) => updateProjectController(req, res)))


    app.route("/api/projects/:projectName/allowed-users")
        .get()
  }

}
